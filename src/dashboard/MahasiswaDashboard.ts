import { renderDashboardLayout } from './DashboardLayout';

export const renderMahasiswaDashboard = () => {
    const content = `
        <div class="space-y-6">
            <!-- Banner Section -->
            <div class="relative overflow-hidden bg-primary-teal rounded-[32px] p-8 text-white min-h-[200px] flex flex-col justify-center">
                <div class="relative z-10">
                    <h2 class="text-2xl font-bold mb-2">Periode Semester Genap 2025/2026</h2>
                    <p class="text-white/80">24 February 2026</p>
                </div>
                <!-- Decorative Elements -->
                <div class="absolute right-0 top-0 w-64 h-full bg-white/10 rounded-l-full transform translate-x-1/2"></div>
                <div class="absolute right-12 top-12 w-32 h-32 bg-secondary-teal rounded-full blur-2xl opacity-50"></div>
            </div>

            <!-- Status Cards Section -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-12 relative z-20 px-4">
                <!-- Rejected Status -->
                <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
                    <h3 class="text-sm font-bold text-gray-800 mb-4 self-start">Status Pengajuan</h3>
                    <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4 text-white">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </div>
                    <p class="text-[12px] font-bold text-gray-900 mb-1">Administrasi Beasiswamu Ditolak!</p>
                    <p class="text-[10px] text-gray-500 mb-4 line-clamp-2">mohon maaf, Surat Rekomendasi Beasiswamu belum memenuhi kriteria untuk disetujui.</p>
                    <div class="flex items-center gap-1 text-[10px] font-bold text-gray-400 mt-auto">
                        Ajukan surat lain <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </div>
                </div>

                <!-- In Progress Status -->
                <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
                    <h3 class="text-sm font-bold text-gray-800 mb-4 self-start">Status Pengajuan</h3>
                    <div class="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mb-4 text-white">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </div>
                    <p class="text-[12px] font-bold text-gray-900 mb-1">Administrasi Beasiswamu Diproses!</p>
                    <p class="text-[10px] text-gray-500 mb-4 line-clamp-2">Surat Rekomendasi Beasiswamu sedang dalam proses pemberkasan.</p>
                    <div class="flex items-center gap-1 text-[10px] font-bold text-gray-400 mt-auto">
                        Ajukan surat lain <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </div>
                </div>

                <!-- Accepted Status -->
                <div class="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
                    <h3 class="text-sm font-bold text-gray-800 mb-4 self-start">Status Pengajuan</h3>
                    <div class="w-16 h-16 bg-[#3D4E4E] rounded-full flex items-center justify-center mb-4 text-white">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <p class="text-[12px] font-bold text-gray-900 mb-1">Administrasi Beasiswamu Diterima!</p>
                    <p class="text-[10px] text-gray-500 mb-4 line-clamp-2">Selamat, Surat Rekomendasi Beasiswamu disetujui.</p>
                    <div class="flex items-center gap-1 text-[10px] font-bold text-gray-400 mt-auto">
                        Ajukan surat lain <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </div>
                </div>
            </div>

            <!-- Report Activity Section -->
            <div class="mt-8">
                <h3 class="text-xl font-bold text-gray-800 mb-6">Report Activity</h3>
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="text-[12px] font-bold text-gray-400 border-b border-gray-50">
                                <th class="px-6 py-4 uppercase tracking-wider">Aksi</th>
                                <th class="px-6 py-4 uppercase tracking-wider">No</th>
                                <th class="px-6 py-4 uppercase tracking-wider">Tanggal Pengajuan</th>
                                <th class="px-6 py-4 uppercase tracking-wider">Status Pengajuan</th>
                                <th class="px-6 py-4 uppercase tracking-wider">Catatan</th>
                                <th class="px-6 py-4 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            ${[1, 2, 3, 4].map(i => `
                                <tr class="hover:bg-gray-50 transition-colors">
                                    <td class="px-6 py-4">
                                        <div class="w-8 h-8 bg-[#3D4E4E] text-white rounded-lg flex items-center justify-center">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-600">${i}</td>
                                    <td class="px-6 py-4 text-sm text-gray-600">30 - 04 - 2024</td>
                                    <td class="px-6 py-4 text-sm text-gray-600">Sedang dalam proses Review</td>
                                    <td class="px-6 py-4 text-sm text-gray-500 italic max-w-xs truncate">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor</td>
                                    <td class="px-6 py-4 text-sm">
                                        ${i === 4 ? `
                                            <span class="font-bold text-[#3D4E4E]">Selesai</span>
                                        ` : `
                                            <button class="w-8 h-8 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center hover:bg-teal-200 transition-colors">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                            </button>
                                        `}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    renderDashboardLayout('Dashboard', content, 'mahasiswa');
};
