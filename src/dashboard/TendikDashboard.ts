import { renderDashboardLayout } from './DashboardLayout';
import { getGreetingName } from '../utils/nameHelper';
import { apiFetch } from '../shared/api-client';
import { renderReviewScholarship } from '../tendik/ReviewScholarship';
import { renderReviewProsesLuarNegeri } from '../tendik/ReviewProsesLuarNegeri';
import { renderReviewSuratKeteranganAktif } from '../tendik/ReviewSuratKeteranganAktif';
import { renderReviewSuratPengantarMagang } from '../tendik/ReviewSuratPengantarMagang';
import { renderReviewSuratTugas } from '../tendik/ReviewSuratTugas';
import {
    getAssignedTaskLabel,
    getLetterStatusLabel,
    getLetterStatusTone,
    isAktifLetter,
    isLegacyBeasiswaFallback,
    isMagangLetter,
    isProsesLuarNegeriLetter,
    isSuratTugasLetter,
    type TendikTaskRow,
} from '../shared/letter-workflow';
import { getTendikBookings } from '../mahasiswa/peminjaman/api';
import type { RoomType, TendikBooking } from '../mahasiswa/peminjaman/types';
import { listManagedRooms } from '../shared/room-management/api';
import type { ManagedRoom } from '../shared/room-management/types';

const escapeHtml = (value: unknown): string => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

type TendikReviewRenderer = (id: number, options: { origin: 'dashboard' }) => void;

const resolveTendikReviewRenderer = (letterType: string): TendikReviewRenderer | null => {
    if (isMagangLetter(letterType)) return renderReviewSuratPengantarMagang;
    if (isAktifLetter(letterType)) return renderReviewSuratKeteranganAktif;
    if (isProsesLuarNegeriLetter(letterType)) return renderReviewProsesLuarNegeri;
    if (isSuratTugasLetter(letterType)) return renderReviewSuratTugas;
    if (isLegacyBeasiswaFallback(letterType)) return renderReviewScholarship;
    return null;
};

export const renderTendikDashboard = async (role: string) => {
    let userName = getGreetingName(localStorage.getItem('auth_name')) || 'Pengguna';

    // Initial skeleton/loading state
    renderDashboardLayout('Dashboard', `
        <div class="flex items-center justify-center min-h-[400px]">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
    `, role, 'dashboard');

    try {
        // Fetch dashboard tasks/stats and the live profile in parallel.
        // /api/tendik/dashboard/tasks returns only stats+tasks+scope (no user meta),
        // so we read assigned_tasks from /api/profile, the same source the Tendik
        // Profile page uses, to keep both surfaces consistent and live with
        // Super Admin penugasan changes (localStorage is only seeded at login).
        const [response, profileResponse, riwayatResponse] = await Promise.all([
            apiFetch('/api/tendik/dashboard/tasks'),
            apiFetch('/api/profile', { cache: 'no-store' }),
            apiFetch('/api/tendik/riwayat?scope=mine'),
        ]);

        if (!response.ok) throw new Error('Data dasbor belum berhasil dimuat. Coba muat ulang halaman.');

        const data = await response.json();
        const stats = data.stats;
        const tasks = data.tasks;

        let riwayat: TendikTaskRow[] = [];
        if (riwayatResponse.ok) {
            try {
                const riwayatBody = await riwayatResponse.json();
                const rows = riwayatBody?.tasks;
                riwayat = Array.isArray(rows) ? rows as TendikTaskRow[] : [];
            } catch { /* ignore */ }
        }
        const recentRiwayat = riwayat.slice(0, 5);

        // Resolve assigned_tasks from the live profile when available; fall back
        // to the login-time cache only if /api/profile itself failed.
        let assignedTasks: string[] = [];
        if (profileResponse.ok) {
            try {
                const profileData = await profileResponse.json();
                const liveTasks = profileData?.user?.assigned_tasks;
                assignedTasks = Array.isArray(liveTasks) ? liveTasks : [];
                // Keep cached copies in sync so other surfaces stay coherent.
                localStorage.setItem('auth_assigned_tasks', JSON.stringify(assignedTasks));
                const liveName = profileData?.user?.name;
                if (typeof liveName === 'string' && liveName) {
                    localStorage.setItem('auth_name', liveName);
                    userName = getGreetingName(liveName) || userName;
                }
            } catch { /* fall through to cached */ }
        } else {
            try {
                const cached = JSON.parse(localStorage.getItem('auth_assigned_tasks') || '[]');
                if (Array.isArray(cached)) assignedTasks = cached;
            } catch { /* ignore */ }
        }

        // Sarpras/Kepala Lab/Laboran work in Peminjaman Ruangan, not surat
        // verification. Their greeting must not talk about "jenis surat"
        // or show empty surat-assignment chips.
        const tendikRole = localStorage.getItem('auth_tendik_role') ?? '';
        const isPeminjamanOnlyRole = ['sarpras', 'kepala_lab', 'laboran'].includes(tendikRole);
        const welcomeSubtitle = tendikRole === 'sarpras'
            ? 'Pantau dan verifikasi pengajuan peminjaman ruang kelas.'
            : tendikRole === 'kepala_lab'
                ? 'Tinjau pengajuan peminjaman laboratorium yang menjadi tanggung jawab Anda.'
                : tendikRole === 'laboran'
                    ? 'Pantau bukti pengembalian kunci dan ruangan laboratorium yang sudah selesai digunakan.'
                    : 'Tinjau dan proses dokumen administrasi surat mahasiswa.';

        if (tendikRole === 'sarpras' || tendikRole === 'kepala_lab') {
            const roomType: RoomType = tendikRole === 'sarpras' ? 'classroom' : 'laboratory';
            const peminjamanDashboard = await loadPeminjamanDashboardData(roomType);
            renderDashboardLayout(
                'Dashboard',
                renderPeminjamanDashboardContent(userName, welcomeSubtitle, peminjamanDashboard),
                role,
                'dashboard',
            );
            bindPeminjamanDashboardActions(role);
            return;
        }
        if (tendikRole === 'laboran') {
            const laboranRooms = await loadLaboranRoomSummary();
            renderDashboardLayout(
                'Dashboard',
                renderLaboranDashboardContent(userName, welcomeSubtitle, laboranRooms),
                role,
                'dashboard',
            );
            bindLaboranDashboardActions(role);
            return;
        }
        const content = `
            <div class="space-y-6 animate-fade-in pb-12 w-full max-w-[1200px] mx-auto">
                <!-- Welcome Section -->
                <div class="mt-2">
                    <h2 class="text-[28px] font-bold text-gray-800 leading-tight">Halo, ${userName}!</h2>
                    <p class="text-xs text-gray-600 mt-1 mb-3">${welcomeSubtitle}</p>
                    ${isPeminjamanOnlyRole ? '' : `
                    <div class="flex flex-wrap gap-2">
                        ${assignedTasks.length > 0
                            ? assignedTasks.map((t: string) => `<span class="bg-[#FFD700] text-gray-900 border border-yellow-400/50 text-[10px] font-bold px-3 py-1.5 rounded-md shadow-sm">${getAssignedTaskLabel(t)}</span>`).join('')
                            : '<span class="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1.5 rounded-md">Belum ada penugasan</span>'
                        }
                    </div>
                    `}
                </div>

                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
                    <!-- Total Surat Masuk -->
                    <div class="bg-[#EFF6FF] border border-blue-100 p-5 rounded-[20px] flex justify-between items-center shadow-sm hover:shadow-md transition-all cursor-pointer">
                        <div>
                            <h3 class="text-[38px] font-black text-[#0EA5E9] leading-none mb-1">${stats.total_incoming}</h3>
                            <p class="text-xs font-semibold text-gray-600">Total Surat Masuk</p>
                        </div>
                        <div class="w-14 h-14 bg-blue-400/20 rounded-xl flex items-center justify-center text-blue-600">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </div>
                    </div>

                    <!-- Perlu Anda Verifikasi -->
                    <div class="bg-[#FFF8F1] border border-orange-200/60 p-5 rounded-[20px] flex justify-between items-center shadow-sm hover:shadow-md transition-all cursor-pointer">
                        <div>
                            <h3 class="text-[38px] font-black text-[#F59E0B] leading-none mb-1">${stats.needs_verification}</h3>
                            <p class="text-xs font-semibold text-gray-600">Perlu Anda Verifikasi</p>
                        </div>
                        <div class="w-14 h-14 bg-[#FEF08A]/60 rounded-xl flex items-center justify-center text-[#D97706]">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        </div>
                    </div>

                    <!-- Selesai Bulan Ini -->
                    <div class="bg-[#F0FDF4] border border-green-200/60 p-5 rounded-[20px] flex justify-between items-center shadow-sm hover:shadow-md transition-all cursor-pointer">
                        <div>
                            <h3 class="text-[38px] font-black text-[#10B981] leading-none mb-1">${stats.finished_this_month}</h3>
                            <p class="text-xs font-semibold text-gray-600">Selesai Bulan Ini</p>
                        </div>
                        <div class="w-14 h-14 bg-green-300/40 rounded-xl flex items-center justify-center text-green-600">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                    </div>
                </div>

                <!-- Antrean Perlu Tindakan Section -->
                <div class="mt-10">
                    <div class="flex justify-end mb-2">
                        <button type="button" id="see-all-dokumen" class="text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors">Lihat Selengkapnya</button>
                    </div>
                    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div class="px-7 py-5 border-b border-gray-100 flex gap-3">
                            <div class="w-6 h-6 rounded-full border border-red-500 text-red-500 flex flex-col items-center justify-center shrink-0 mt-0.5 shadow-sm">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="6" x2="12" y2="14"></line><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                            </div>
                            <div>
                                <h2 class="text-[17px] font-bold text-gray-800">Antrean Perlu Dikerjakan</h2>
                                <p class="text-[11px] text-gray-500 mt-1">Daftar pengajuan surat yang memerlukan tindakan atau pemrosesan dari Anda</p>
                            </div>
                        </div>

                        <!-- Table -->
                        <div class="overflow-x-auto">
                            <table class="w-full text-left bg-white">
                                <thead>
                                    <tr class="border-b border-gray-100 bg-white">
                                        <th class="px-7 py-4 text-xs font-bold text-gray-700 whitespace-nowrap w-[220px]">Tanggal Masuk</th>
                                        <th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Mahasiswa</th>
                                        <th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Jenis Surat</th>
                                        <th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Status</th>
                                        <th class="px-7 py-4 w-40"></th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    ${tasks.length === 0 ? `
                                        <tr>
                                            <td colspan="5" class="px-7 py-12 text-center text-gray-400 text-sm">
                                                Belum ada pengajuan masuk yang ditugaskan kepada Anda.
                                            </td>
                                        </tr>
                                    ` : tasks.map((task: any) => `
                                        <tr class="hover:bg-gray-50/50 transition-colors">
                                            <td class="px-7 py-4 align-top">
                                                <p class="text-xs font-medium text-gray-500 mb-1">${task.submitted_at}</p>
                                                ${task.is_overdue ? `
                                                    <p class="text-[10px] font-bold text-red-500 flex items-center gap-1">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> 
                                                        > 24 jam tertunda
                                                    </p>
                                                ` : ''}
                                            </td>
                                            <td class="px-4 py-4 align-top">
                                                <p class="text-xs font-bold text-gray-700 mb-0.5">${task.student_name}</p>
                                                <p class="text-[10px] font-medium text-gray-400">${task.nim}</p>
                                            </td>
                                            <td class="px-4 py-4 align-top">
                                                <span class="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#F1F5F9] text-gray-600 border border-gray-200/60">
                                                    ${task.type}
                                                </span>
                                            </td>
                                            <td class="px-4 py-4 align-top whitespace-nowrap">
                                                <span class="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold ${task.status === 'Menunggu Verifikasi' ? 'bg-[#FEF9C3] text-[#A16207] border border-[#FDE047]' : 'bg-green-50 text-green-600 border border-green-200'}">
                                                    ${task.status}
                                                </span>
                                            </td>
                                            <td class="px-7 py-3 align-top text-right">
                                                <button class="review-btn inline-block text-center text-[10px] font-bold border-2 border-[#115E59] text-[#115E59] hover:bg-[#115E59] hover:text-white transition-colors rounded-xl px-4 py-2 w-full max-w-[140px] shadow-sm" data-id="${task.id}" data-letter-type="${task.letter_type || ''}">
                                                    Review Dokumen
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Riwayat Section (top-5 recent from /api/tendik/riwayat?scope=mine) -->
                <div class="mt-12">
                    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div class="px-7 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div class="flex gap-3 items-start">
                                <div class="w-6 h-6 rounded-full border border-blue-500 text-blue-500 flex flex-col items-center justify-center shrink-0 mt-0.5 shadow-sm">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                </div>
                                <div>
                                    <h2 class="text-[17px] font-bold text-gray-800">Riwayat</h2>
                                    <p class="text-[11px] text-gray-500 mt-1">Pengajuan terbaru yang telah Anda proses</p>
                                </div>
                            </div>
                            <button id="tendik-riwayat-see-more" type="button" class="text-xs font-bold text-[#115E59] hover:text-[#0d4a46] transition-colors underline-offset-2 hover:underline">Lihat Selengkapnya</button>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead>
                                    <tr class="border-b border-gray-100 bg-white">
                                        <th class="px-7 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Tanggal Masuk</th>
                                        <th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Nomor Surat</th>
                                        <th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Mahasiswa</th>
                                        <th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Jenis Surat</th>
                                        <th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Status</th>
                                        <th class="px-7 py-4 text-right text-xs font-bold text-gray-700">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    ${recentRiwayat.length === 0 ? `
                                        <tr>
                                            <td colspan="6" class="px-7 py-12 text-center text-gray-400 text-sm">
                                                Belum ada riwayat pengajuan yang Anda tangani.
                                            </td>
                                        </tr>
                                    ` : recentRiwayat.map(tendikRiwayatRow).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        renderDashboardLayout('Dashboard', content, role, 'dashboard');

        // "Lihat Selengkapnya" routes to the full Dokumen page (Tugas Saya tab).
        document.getElementById('see-all-dokumen')?.addEventListener('click', () => {
            import('../tendik/DokumenTendik').then(({ renderDokumenTendik }) => {
                renderDokumenTendik(role);
            });
        });

        // Riwayat "Lihat Selengkapnya" routes to the full Tendik Riwayat page.
        document.getElementById('tendik-riwayat-see-more')?.addEventListener('click', () => {
            import('../tendik/RiwayatTendik').then(({ renderRiwayatTendik }) => {
                renderRiwayatTendik(role);
            });
        });

        // Active-queue review buttons. Pass origin: 'dashboard' so the back
        // button returns here and the sidebar stays on "Dashboard".
        document.querySelectorAll<HTMLButtonElement>('.review-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.getAttribute('data-id') || '0');
                const letterType = btn.getAttribute('data-letter-type') || '';
                if (!Number.isFinite(id) || id <= 0) return;
                const renderer = resolveTendikReviewRenderer(letterType);
                renderer?.(id, { origin: 'dashboard' });
            });
        });

        // Riwayat-section "Lihat Detail" buttons also use dashboard origin so the
        // sidebar/back stay on Dashboard for rows opened from this surface.
        document.querySelectorAll<HTMLButtonElement>('.tendik-history-detail-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id || '0');
                const letterType = btn.dataset.letterType || '';
                if (!Number.isFinite(id) || id <= 0) return;
                const renderer = resolveTendikReviewRenderer(letterType);
                renderer?.(id, { origin: 'dashboard' });
            });
        });

    } catch (error) {
        console.error(error);
        renderDashboardLayout('Dashboard', `
            <div class="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div class="text-red-500 mb-4">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <h3 class="text-lg font-bold text-gray-800">Gagal Memuat Data</h3>
                <p class="text-sm text-gray-500 mt-1">Terjadi kesalahan saat memproses data dashboard.</p>
                <button onclick="window.location.reload()" class="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold">Coba Lagi</button>
            </div>
        `, role, 'dashboard');
    }
};

interface LaboranRoomSummary {
    rooms: ManagedRoom[];
    needsEdit: ManagedRoom[];
    activeCount: number;
    inactiveCount: number;
    error: string | null;
}

const roomNeedsEditReasons = (room: ManagedRoom): string[] => {
    const reasons: string[] = [];
    if (!room.is_active) reasons.push('nonaktif');
    if (!room.cover_photo) reasons.push('foto belum ada');
    if (!room.facilities_summary?.count) reasons.push('fasilitas belum diisi');
    if (!room.has_active_template) reasons.push('template belum aktif');
    if (!room.rules?.trim()) reasons.push('aturan belum diisi');
    if (!room.description?.trim()) reasons.push('deskripsi belum diisi');
    return reasons;
};

const loadLaboranRoomSummary = async (): Promise<LaboranRoomSummary> => {
    try {
        const rooms = await listManagedRooms({ type: 'laboratory' });
        const needsEdit = rooms.filter((room) => roomNeedsEditReasons(room).length > 0);
        return {
            rooms,
            needsEdit,
            activeCount: rooms.filter((room) => room.is_active).length,
            inactiveCount: rooms.filter((room) => !room.is_active).length,
            error: null,
        };
    } catch (error) {
        return {
            rooms: [],
            needsEdit: [],
            activeCount: 0,
            inactiveCount: 0,
            error: error instanceof Error ? error.message : 'Daftar ruangan laboratorium gagal dimuat.',
        };
    }
};

const renderLaboranRoomRow = (room: ManagedRoom): string => {
    const reasons = roomNeedsEditReasons(room);
    const labName = room.owning_laboratory?.name || 'Laboratorium';
    return `
        <div class="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="text-sm font-black text-gray-900">${escapeHtml(room.code)} - ${escapeHtml(room.name)}</span>
                        <span class="rounded-full px-2.5 py-1 text-[10px] font-bold ${room.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}">${room.is_active ? 'Aktif' : 'Nonaktif'}</span>
                    </div>
                    <p class="mt-1 text-xs font-medium text-gray-500">${escapeHtml(labName)} - Kapasitas ${escapeHtml(String(room.capacity || '-'))} - ${escapeHtml(room.location || '-')}</p>
                    <p class="mt-2 text-xs text-gray-500">${reasons.length > 0 ? escapeHtml(reasons.join(', ')) : 'Data utama sudah lengkap.'}</p>
                </div>
                <button type="button" data-laboran-room-action="manage" class="shrink-0 rounded-lg border border-teal-700 px-3 py-2 text-xs font-bold text-teal-700 hover:bg-teal-50">Edit</button>
            </div>
        </div>
    `;
};

const renderLaboranDashboardContent = (
    userName: string,
    welcomeSubtitle: string,
    summary: LaboranRoomSummary,
): string => {
    const previewRooms = summary.rooms.slice(0, 5);
    const editRooms = summary.needsEdit.slice(0, 5);
    return `
        <div class="space-y-6 animate-fade-in pb-12 w-full max-w-[1200px] mx-auto">
            <div class="mt-2">
                <h2 class="text-[28px] font-bold text-gray-800 leading-tight">Halo, ${escapeHtml(userName)}!</h2>
                <p class="text-xs text-gray-600 mt-1 mb-3">${escapeHtml(welcomeSubtitle)}</p>
            </div>

            <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div class="rounded-[20px] border border-blue-100 bg-[#EFF6FF] p-5 shadow-sm">
                    <h3 class="text-[38px] font-black leading-none text-[#0EA5E9]">${summary.rooms.length}</h3>
                    <p class="mt-2 text-xs font-semibold text-gray-600">Total Laboratorium</p>
                </div>
                <div class="rounded-[20px] border border-emerald-200 bg-[#F0FDF4] p-5 shadow-sm">
                    <h3 class="text-[38px] font-black leading-none text-[#10B981]">${summary.activeCount}</h3>
                    <p class="mt-2 text-xs font-semibold text-gray-600">Ruangan Tersedia</p>
                </div>
                <div class="rounded-[20px] border border-orange-200 bg-[#FFF8F1] p-5 shadow-sm">
                    <h3 class="text-[38px] font-black leading-none text-[#F59E0B]">${summary.needsEdit.length}</h3>
                    <p class="mt-2 text-xs font-semibold text-gray-600">Perlu Dilengkapi/Edit</p>
                </div>
            </div>

            ${summary.error ? `<div class="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">${escapeHtml(summary.error)}</div>` : ''}

            <section class="rounded-2xl border border-emerald-100 bg-white p-7 shadow-sm">
                <div class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div class="max-w-2xl">
                        <p class="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Bukti Pengembalian</p>
                        <h3 class="mt-2 text-xl font-bold text-gray-900">Pengembalian laboratorium selesai</h3>
                        <p class="mt-2 text-sm leading-6 text-gray-600">Jika mahasiswa sudah mengisi form pengembalian, datanya akan muncul di menu Peminjaman Ruangan. Detailnya berisi penerima kunci, waktu, catatan, dan foto bukti.</p>
                    </div>
                    <button data-laboran-room-action="returns" type="button" class="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-teal-800">Lihat Bukti Pengembalian</button>
                </div>
            </section>

            <section class="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
                <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p class="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Katalog Laboratorium</p>
                        <h3 class="mt-2 text-xl font-bold text-gray-900">Ruangan yang tersedia</h3>
                        <p class="mt-2 text-sm text-gray-600">Ringkasan ruangan laboratorium yang dapat dicek dan dilengkapi datanya.</p>
                    </div>
                    <button data-laboran-room-action="manage" type="button" class="rounded-xl border border-teal-700 px-5 py-3 text-sm font-bold text-teal-700 hover:bg-teal-50">Kelola Ruangan</button>
                </div>
                <div class="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
                    ${previewRooms.length === 0 ? '<p class="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500 lg:col-span-2">Belum ada ruangan laboratorium yang dapat ditampilkan.</p>' : previewRooms.map(renderLaboranRoomRow).join('')}
                </div>
            </section>

            <section class="rounded-2xl border border-orange-100 bg-orange-50/50 p-7 shadow-sm">
                <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p class="text-xs font-bold uppercase tracking-[0.18em] text-orange-700">Perlu Diedit</p>
                        <h3 class="mt-2 text-xl font-bold text-gray-900">Data ruangan yang perlu dilengkapi</h3>
                        <p class="mt-2 text-sm text-gray-600">Prioritas edit ditandai dari data yang belum lengkap atau ruangan yang belum aktif.</p>
                    </div>
                    <span class="rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-bold text-orange-700">Nonaktif: ${summary.inactiveCount}</span>
                </div>
                <div class="mt-5 space-y-3">
                    ${editRooms.length === 0 ? '<p class="rounded-xl border border-dashed border-orange-200 bg-white px-4 py-8 text-center text-sm text-gray-500">Semua data utama ruangan sudah lengkap.</p>' : editRooms.map(renderLaboranRoomRow).join('')}
                </div>
            </section>
        </div>
    `;
};

const bindLaboranDashboardActions = (role: string): void => {
    document.querySelectorAll<HTMLButtonElement>('[data-laboran-room-action]').forEach((button) => {
        button.addEventListener('click', () => {
            const initialTab: 'queue' | 'rooms' = button.dataset.laboranRoomAction === 'returns' ? 'queue' : 'rooms';
            import('../tendik/PeminjamanRuanganTendik').then(({ renderPeminjamanRuanganTendik }) => {
                renderPeminjamanRuanganTendik(role, { initialTab });
            });
        });
    });
};
interface PeminjamanDashboardData {
    stats: {
        totalIncoming: number;
        needsVerification: number;
        finishedThisMonth: number;
    };
    queue: TendikBooking[];
    history: TendikBooking[];
}

const peminjamanStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
        submitted: 'Menunggu Verifikasi',
        revision_requested: 'Perlu Revisi',
        approved: 'Disetujui',
        return_pending: 'Menunggu Pengembalian',
        completed: 'Selesai',
        rejected: 'Ditolak',
        cancelled: 'Dibatalkan',
    };
    return labels[status] ?? status;
};

const peminjamanStatusTone = (status: string): string => {
    if (status === 'submitted') return 'bg-[#FEF9C3] text-[#A16207] border border-[#FDE047]';
    if (status === 'completed' || status === 'return_pending') return 'bg-green-50 text-green-600 border border-green-200';
    if (status === 'rejected' || status === 'cancelled') return 'bg-red-50 text-red-600 border border-red-200';
    return 'bg-blue-50 text-blue-600 border border-blue-200';
};

const peminjamanSortTime = (booking: TendikBooking): number => {
    const value = booking.reviewed_at || booking.return_info?.returned_at || booking.updated_at || booking.created_at || booking.start_at;
    const time = Date.parse(value || '');
    return Number.isNaN(time) ? 0 : time;
};

const isFinishedThisMonth = (booking: TendikBooking): boolean => {
    if (booking.status !== 'completed') return false;
    const value = booking.return_info?.returned_at || booking.updated_at;
    const time = value ? new Date(value) : null;
    if (!time || Number.isNaN(time.getTime())) return false;
    const now = new Date();
    return time.getFullYear() === now.getFullYear() && time.getMonth() === now.getMonth();
};

const formatPeminjamanDate = (value: string | null | undefined): string => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const loadPeminjamanDashboardData = async (roomType: RoomType): Promise<PeminjamanDashboardData> => {
    const processedStatuses = ['return_pending', 'completed', 'rejected', 'revision_requested', 'cancelled'] as const;
    const [allBookings, submittedBookings, completedBookings, ...processedResponses] = await Promise.all([
        getTendikBookings({ roomType, page: 1, perPage: 5 }),
        getTendikBookings({ roomType, status: 'submitted', page: 1, perPage: 5 }),
        getTendikBookings({ roomType, status: 'completed', page: 1, perPage: 100 }),
        ...processedStatuses.map((status) => getTendikBookings({ roomType, status, page: 1, perPage: 5 })),
    ]);

    const history = processedResponses
        .flatMap((response) => response.data)
        .sort((a, b) => peminjamanSortTime(b) - peminjamanSortTime(a))
        .slice(0, 5);

    return {
        stats: {
            totalIncoming: allBookings.meta.total,
            needsVerification: submittedBookings.meta.total,
            finishedThisMonth: completedBookings.data.filter(isFinishedThisMonth).length,
        },
        queue: submittedBookings.data.slice(0, 5),
        history,
    };
};

const peminjamanQueueRow = (booking: TendikBooking): string => `
    <tr class="hover:bg-gray-50/50 transition-colors">
        <td class="px-7 py-4 align-top text-xs font-medium text-gray-500">${escapeHtml(formatPeminjamanDate(booking.created_at || booking.start_at))}</td>
        <td class="px-4 py-4 align-top">
            <p class="text-xs font-bold text-gray-700">${escapeHtml(booking.requester?.name || '-')}</p>
            <p class="mt-0.5 text-[10px] font-medium text-gray-400">${escapeHtml(booking.requester?.email || '-')}</p>
        </td>
        <td class="px-4 py-4 align-top">
            <span class="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#F1F5F9] text-gray-600 border border-gray-200/60">${escapeHtml(booking.room?.name || 'Ruangan')}</span>
        </td>
        <td class="px-4 py-4 align-top whitespace-nowrap">
            <span class="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold ${peminjamanStatusTone(booking.status)}">${escapeHtml(peminjamanStatusLabel(booking.status))}</span>
        </td>
        <td class="px-7 py-3 align-top text-right">
            <button type="button" class="peminjaman-dashboard-action inline-block text-center text-[10px] font-bold border-2 border-[#115E59] text-[#115E59] hover:bg-[#115E59] hover:text-white transition-colors rounded-xl px-4 py-2 w-full max-w-[140px] shadow-sm">Review</button>
        </td>
    </tr>
`;

const peminjamanHistoryRow = (booking: TendikBooking): string => `
    <tr class="hover:bg-gray-50/50 transition-colors">
        <td class="px-7 py-4 align-top text-xs font-medium text-gray-500">${escapeHtml(formatPeminjamanDate(booking.created_at || booking.start_at))}</td>
        <td class="px-4 py-4 align-top text-xs font-semibold text-gray-600">#${escapeHtml(String(booking.id))}</td>
        <td class="px-4 py-4 align-top">
            <p class="text-xs font-bold text-gray-700">${escapeHtml(booking.requester?.name || '-')}</p>
            <p class="mt-0.5 text-[10px] font-medium text-gray-400">${escapeHtml(booking.requester?.email || '-')}</p>
        </td>
        <td class="px-4 py-4 align-top">
            <span class="inline-flex rounded-full border border-gray-200 bg-[#F1F5F9] px-3 py-1.5 text-[10px] font-bold text-gray-600">${escapeHtml(booking.room?.name || 'Ruangan')}</span>
        </td>
        <td class="px-4 py-4 align-top">
            <span class="inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold ${peminjamanStatusTone(booking.status)}">${escapeHtml(peminjamanStatusLabel(booking.status))}</span>
        </td>
        <td class="px-7 py-3 text-right align-top"><button type="button" class="peminjaman-dashboard-action text-xs font-bold text-[#115E59] hover:underline transition-colors">Lihat Detail</button></td>
    </tr>
`;

const renderPeminjamanDashboardContent = (
    userName: string,
    welcomeSubtitle: string,
    data: PeminjamanDashboardData,
): string => `
    <div class="space-y-6 animate-fade-in pb-12 w-full max-w-[1200px] mx-auto">
        <div class="mt-2">
            <h2 class="text-[28px] font-bold text-gray-800 leading-tight">Halo, ${escapeHtml(userName)}!</h2>
            <p class="text-xs text-gray-600 mt-1 mb-3">${escapeHtml(welcomeSubtitle)}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
            <div class="bg-[#EFF6FF] border border-blue-100 p-5 rounded-[20px] flex justify-between items-center shadow-sm">
                <div>
                    <h3 class="text-[38px] font-black text-[#0EA5E9] leading-none mb-1">${data.stats.totalIncoming}</h3>
                    <p class="text-xs font-semibold text-gray-600">Total Surat Masuk</p>
                </div>
                <div class="w-14 h-14 bg-blue-400/20 rounded-xl flex items-center justify-center text-blue-600">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                </div>
            </div>
            <div class="bg-[#FFF8F1] border border-orange-200/60 p-5 rounded-[20px] flex justify-between items-center shadow-sm">
                <div>
                    <h3 class="text-[38px] font-black text-[#F59E0B] leading-none mb-1">${data.stats.needsVerification}</h3>
                    <p class="text-xs font-semibold text-gray-600">Perlu Anda Verifikasi</p>
                </div>
                <div class="w-14 h-14 bg-[#FEF08A]/60 rounded-xl flex items-center justify-center text-[#D97706]">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>
            </div>
            <div class="bg-[#F0FDF4] border border-green-200/60 p-5 rounded-[20px] flex justify-between items-center shadow-sm">
                <div>
                    <h3 class="text-[38px] font-black text-[#10B981] leading-none mb-1">${data.stats.finishedThisMonth}</h3>
                    <p class="text-xs font-semibold text-gray-600">Selesai Bulan Ini</p>
                </div>
                <div class="w-14 h-14 bg-green-300/40 rounded-xl flex items-center justify-center text-green-600">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
            </div>
        </div>

        <div class="mt-10">
            <div class="flex justify-end mb-2">
                <button type="button" class="peminjaman-dashboard-action text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors">Lihat Selengkapnya</button>
            </div>
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div class="px-7 py-5 border-b border-gray-100 flex gap-3">
                    <div class="w-6 h-6 rounded-full border border-red-500 text-red-500 flex flex-col items-center justify-center shrink-0 mt-0.5 shadow-sm">!</div>
                    <div>
                        <h2 class="text-[17px] font-bold text-gray-800">Antrean Perlu Dikerjakan</h2>
                        <p class="text-[11px] text-gray-500 mt-1">Daftar pengajuan peminjaman ruangan yang memerlukan tindakan dari Anda</p>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left bg-white">
                        <thead><tr class="border-b border-gray-100 bg-white"><th class="px-7 py-4 text-xs font-bold text-gray-700 whitespace-nowrap w-[220px]">Tanggal Masuk</th><th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Mahasiswa</th><th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Ruangan</th><th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Status</th><th class="px-7 py-4 w-40"></th></tr></thead>
                        <tbody class="divide-y divide-gray-100">${data.queue.length === 0 ? '<tr><td colspan="5" class="px-7 py-12 text-center text-gray-400 text-sm">Belum ada pengajuan peminjaman yang perlu Anda verifikasi.</td></tr>' : data.queue.map(peminjamanQueueRow).join('')}</tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="mt-12">
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div class="px-7 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div class="flex gap-3 items-start"><div class="w-6 h-6 rounded-full border border-blue-500 text-blue-500 flex flex-col items-center justify-center shrink-0 mt-0.5 shadow-sm"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div><div><h2 class="text-[17px] font-bold text-gray-800">Riwayat</h2><p class="text-[11px] text-gray-500 mt-1">Pengajuan peminjaman terbaru yang telah diproses</p></div></div>
                    <button type="button" class="peminjaman-dashboard-action text-xs font-bold text-[#115E59] hover:text-[#0d4a46] transition-colors underline-offset-2 hover:underline">Lihat Selengkapnya</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead><tr class="border-b border-gray-100 bg-white"><th class="px-7 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Tanggal Masuk</th><th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Nomor</th><th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Mahasiswa</th><th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Ruangan</th><th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Status</th><th class="px-7 py-4 text-right text-xs font-bold text-gray-700">Aksi</th></tr></thead>
                        <tbody class="divide-y divide-gray-100">${data.history.length === 0 ? '<tr><td colspan="6" class="px-7 py-12 text-center text-gray-400 text-sm">Belum ada riwayat peminjaman yang Anda tangani.</td></tr>' : data.history.map(peminjamanHistoryRow).join('')}</tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
`;

const bindPeminjamanDashboardActions = (role: string): void => {
    document.querySelectorAll<HTMLButtonElement>('.peminjaman-dashboard-action').forEach((button) => {
        button.addEventListener('click', () => {
            import('../tendik/PeminjamanRuanganTendik').then(({ renderPeminjamanRuanganTendik }) => {
                renderPeminjamanRuanganTendik(role);
            });
        });
    });
};
const tendikRiwayatRow = (task: TendikTaskRow): string => {
    const statusTone = getLetterStatusTone(task.status, 'tendik-history');
    const statusLabel = escapeHtml(getLetterStatusLabel(task.status, 'tendik-history') || '-');
    const submittedAt = escapeHtml(task.submitted_at || '-');
    const studentName = escapeHtml(task.student_name || '-');
    const nim = escapeHtml(task.nim || '-');
    const letterType = (task.letter_type ?? task.type ?? '') as string;
    const typeLabel = escapeHtml(getAssignedTaskLabel(letterType) || task.type || 'Surat Administrasi');
    const nomor = escapeHtml(task.nomor_surat || '-');
    const detailButton = resolveTendikReviewRenderer(letterType)
        ? `<button class="tendik-history-detail-btn text-xs font-bold text-[#115E59] hover:underline transition-colors" data-id="${escapeHtml(String(task.id ?? ''))}" data-letter-type="${escapeHtml(letterType)}">Lihat Detail</button>`
        : '<span class="text-xs text-gray-400">-</span>';

    return `
        <tr class="hover:bg-gray-50/50 transition-colors">
            <td class="px-7 py-4 align-top text-xs font-medium text-gray-500">${submittedAt}</td>
            <td class="px-4 py-4 align-top text-xs font-semibold text-gray-600">${nomor}</td>
            <td class="px-4 py-4 align-top">
                <p class="text-xs font-bold text-gray-700">${studentName}</p>
                <p class="mt-0.5 text-[10px] font-medium text-gray-400">${nim}</p>
            </td>
            <td class="px-4 py-4 align-top">
                <span class="inline-flex rounded-full border border-gray-200 bg-[#F1F5F9] px-3 py-1.5 text-[10px] font-bold text-gray-600">${typeLabel}</span>
            </td>
            <td class="px-4 py-4 align-top">
                <span class="inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold ${statusTone}">${statusLabel}</span>
            </td>
            <td class="px-7 py-3 text-right align-top">${detailButton}</td>
        </tr>
    `;
};
