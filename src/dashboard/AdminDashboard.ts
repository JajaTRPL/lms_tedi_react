import { renderDashboardLayout } from './DashboardLayout';

let refreshInterval: any = null;

export const renderAdminDashboard = async () => {
    // Clear existing interval if any
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }

    // Set global clear function for other components to use
    (window as any).clearDashboardInterval = () => {
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
    };

    // Initial loading state
    renderDashboardLayout('Dashboard', '<div class="flex items-center justify-center h-64"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>', 'super_admin');

    const updateDashboardData = async (isInitial = false) => {
        try {
            const response = await fetch('/api/super-admin/dashboard/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Accept': 'application/json'
                }
            });
            const stats = await response.json();

            const content = `
                <div class="space-y-8 animate-fade-in pb-12">
                    <!-- Welcome Section -->
                    <div class="flex justify-between items-center">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-800">Halo, ${localStorage.getItem('auth_name')}!</h2>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-2">
                                Super Admin
                            </span>
                        </div>
                        <div class="flex flex-col items-end">
                            <div class="flex items-center gap-2 text-teal-600 animate-pulse">
                                <span class="relative flex h-2 w-2">
                                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                  <span class="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                                </span>
                                <span class="text-[10px] font-bold uppercase tracking-widest">Live Updates</span>
                            </div>
                            <p class="text-[10px] text-gray-400 mt-1">Terakhir diperbarui: ${new Date().toLocaleTimeString('id-ID')}</p>
                        </div>
                    </div>

                    <!-- User Count Cards -->
                    <div>
                        <h3 class="text-sm font-bold text-gray-700 mb-1">Total Pengguna Aktif</h3>
                        <p class="text-xs text-gray-500 mb-4">Jumlah pengguna Aktif berdasarkan peran dalam sistem.</p>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            ${renderCountCard('Mahasiswa', stats.user_counts?.mahasiswa || 0, 'bg-blue-50 text-blue-600')}
                            ${renderCountCard('Tenaga Pendidik', stats.user_counts?.tendik || 0, 'bg-indigo-50 text-indigo-600')}
                            ${renderCountCard('Akademik', stats.user_counts?.akademik || 0, 'bg-purple-50 text-purple-600')}
                            ${renderCountCard('Admin', stats.user_counts?.super_admin || 0, 'bg-teal-50 text-teal-600')}
                        </div>
                    </div>

                    <!-- Account Status Section -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div class="lg:col-span-1 space-y-4">
                            <h3 class="text-sm font-bold text-gray-700">Status Akun Pengguna</h3>
                            <p class="text-xs text-gray-500">Distribusi status akun pengguna pada sistem.</p>
                            
                            ${renderStatusBar('Aktif', stats.status_distribution?.active?.count || 0, stats.status_distribution?.active?.percentage || 0, 'bg-teal-500')}
                            ${renderStatusBar('Nonaktif', stats.status_distribution?.nonaktif?.count || 0, stats.status_distribution?.nonaktif?.percentage || 0, 'bg-gray-400')}
                            ${renderStatusBar('Suspended', stats.status_distribution?.suspended?.count || 0, stats.status_distribution?.suspended?.percentage || 0, 'bg-red-500')}
                        </div>

                        <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center justify-center relative shadow-sm">
                            <div class="relative w-48 h-48">
                                <!-- Simple SVG Donut Chart -->
                                <svg viewBox="0 0 36 36" class="w-full h-full transform -rotate-90">
                                    <circle cx="18" cy="18" r="16" fill="transparent" stroke="#E5E7EB" stroke-width="3"></circle>
                                    <circle cx="18" cy="18" r="16" fill="transparent" stroke="#0D9488" stroke-width="3" 
                                        stroke-dasharray="${stats.status_distribution?.active?.percentage || 0} 100"></circle>
                                </svg>
                                <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span class="text-3xl font-black text-gray-800">${stats.user_counts?.total || 0}</span>
                                    <span class="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">Total User</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr class="border-gray-200">

                    <!-- Activity Line Charts -->
                    <div class="space-y-6">
                        <div>
                            <h3 class="text-sm font-bold text-gray-700">Laporan Aktivitas Sistem</h3>
                            <p class="text-xs text-gray-500">Menampilkan aktivitas penggunaan sistem (Update Otomatis setiap 30 Detik).</p>
                        </div>

                        <!-- Tabs Placeholder -->
                        <div class="flex p-1 bg-gray-100 rounded-xl w-full max-w-2xl">
                            <button class="flex-1 py-1.5 text-xs font-bold bg-white text-gray-800 rounded-lg shadow-sm">Hari Ini</button>
                            <button class="flex-1 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">Minggu Ini</button>
                            <button class="flex-1 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">1 Bulan</button>
                            <button class="flex-1 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">3 Bulan</button>
                            <button class="flex-1 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">6 Bulan</button>
                            <button class="flex-1 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">12 Bulan</button>
                        </div>

                        <!-- Charts Grid -->
                        <div class="space-y-4">
                            ${renderChartCard('Aktivitas Login', 'Total aktivitas login pengguna ke sistem pada periode yang dipilih', stats.activity_stats || { labels: [], data: [] })}
                            ${renderChartCard('Pengajuan Surat', 'Jumlah pengajuan surat yang masuk ke sistem pada periode yang dipilih', stats.scholarship_stats || { labels: [], data: [] })}
                        </div>

                        <!-- Approval Durations -->
                        <div class="bg-gray-400/10 rounded-2xl overflow-hidden border border-gray-200">
                            <div class="bg-gray-400/40 px-6 py-3">
                                <h4 class="text-xs font-bold text-gray-700">Rata-rata Durasi Persetujuan Surat</h4>
                                <p class="text-[10px] text-gray-500 uppercase tracking-tight">Rata-rata waktu yang dibutuhkan untuk memproses persetujuan surat</p>
                            </div>
                            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                ${renderDurationBox('Tenaga Pendidik', stats.approval_durations?.tendik || { days: 0, hours: 0, minutes: 0 })}
                                ${renderDurationBox('Akademik', stats.approval_durations?.akademik || { days: 0, hours: 0, minutes: 0 })}
                            </div>
                            <div class="px-6 py-2 bg-white/50 border-t border-gray-200 flex items-center gap-2">
                                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                 <p class="text-[10px] text-gray-500 italic">Data diperbarui secara real-time dari sistem.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const container = document.getElementById('dashboard-content');
            if (container) {
                container.innerHTML = content;
            }
        } catch (error) {
            console.error('Error updating dashboard data:', error);
            if (isInitial) {
                renderDashboardLayout('Dashboard', '<div class="p-8 text-center text-red-600 bg-red-50 rounded-2xl">Gagal memuat statistik dashboard.</div>', 'super_admin');
            }
        }
    };

    // Initial fetch
    await updateDashboardData(true);

    // Set interval for refreshes
    refreshInterval = setInterval(() => updateDashboardData(), 30000);
};

const renderCountCard = (title: string, count: number, colorClass: string) => `
    <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start">
        <div>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">${title}</p>
            <p class="text-2xl font-black text-gray-800">${count}</p>
            <p class="text-[10px] text-gray-400 font-medium">User Terdaftar</p>
        </div>
        <div class="w-10 h-10 ${colorClass} rounded-xl flex items-center justify-center opacity-80">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
    </div>
`;

const renderStatusBar = (label: string, count: number, percentage: number, color: string) => `
    <div class="bg-white px-5 py-4 rounded-2xl border border-gray-100 shadow-sm space-y-2">
        <div class="flex justify-between items-center">
            <span class="text-xs font-bold text-gray-700">${label}</span>
            <span class="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-xs font-black text-gray-800 truncate">${count}</span>
        </div>
        <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div class="${color} h-full" style="width: ${percentage}%"></div>
        </div>
        <p class="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">${percentage}% dari total user</p>
    </div>
`;

const renderChartCard = (title: string, sub: string, data: any) => `
    <div class="bg-gray-400/20 rounded-2xl overflow-hidden border border-gray-200">
        <div class="px-6 py-4">
            <h4 class="text-xs font-bold text-gray-700">${title}</h4>
            <p class="text-[10px] text-gray-500 uppercase tracking-tight">${sub}</p>
        </div>
        <div class="bg-white mx-4 mb-4 p-6 rounded-xl border border-gray-100 flex flex-col items-center">
            <div class="w-full h-32 flex items-end gap-1 relative">
                <!-- Simple SVG Area/Line representation -->
                <svg viewBox="0 0 700 120" class="w-full h-full">
                    <path d="M0 100 ${data.data.map((d: any, i: number) => `L ${i * 100} ${100 - (d * 5)}`).join(' ')} L 600 100 Z" fill="rgba(13, 148, 136, 0.1)" />
                    <path d="M0 100 ${data.data.map((d: any, i: number) => `L ${i * 100} ${100 - (d * 5)}`).join(' ')}" fill="none" stroke="#0D9488" stroke-width="2" />
                    ${data.data.map((d: any, i: number) => `<circle cx="${i * 100}" cy="${100 - (d * 5)}" r="3" fill="white" stroke="#0D9488" stroke-width="2" />`).join('')}
                </svg>
                <div class="absolute bottom-0 w-full flex justify-between px-0.5 pointer-events-none">
                    ${data.labels.map((l: string) => `<span class="text-[8px] text-gray-300 font-bold uppercase">${l}</span>`).join('')}
                </div>
            </div>
            <div class="flex items-center gap-2 mt-4">
                <span class="w-2 h-2 rounded-full bg-teal-500"></span>
                <span class="text-[10px] font-bold text-gray-400">USER</span>
            </div>
        </div>
    </div>
`;

const renderDurationBox = (label: string, dur: any) => `
    <div class="bg-white/70 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
        <span class="text-xs font-bold text-gray-600">${label}</span>
        <div class="flex items-end gap-1">
            <span class="text-xl font-black text-gray-800 leading-none">${String(dur.days).padStart(2, '0')}</span><span class="text-[8px] font-bold text-gray-400 mb-1">Hari</span>
            <span class="text-xl font-black text-gray-800 leading-none ml-2">${String(dur.hours).padStart(2, '0')}</span><span class="text-[8px] font-bold text-gray-400 mb-1">Jam</span>
            <span class="text-xl font-black text-gray-800 leading-none ml-2">${String(dur.minutes).padStart(2, '0')}</span><span class="text-[8px] font-bold text-gray-400 mb-1">Menit</span>
        </div>
    </div>
`;
