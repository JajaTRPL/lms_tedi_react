import { renderDashboardLayout } from '../dashboard/DashboardLayout';

export const renderLetterMonitoring = () => {
    const content = `
        <div class="space-y-6 animate-fade-in pb-12 w-full max-w-6xl mx-auto">
            <p class="text-gray-500 text-sm mb-6 -mt-2">Memantau status dan progres pengajuan surat dalam sistem</p>

            <!-- Time Period Tabs -->
            <div class="flex items-center gap-1 border-b border-gray-200 pb-4">
                <button class="px-6 py-2 text-sm font-semibold text-white rounded-xl shadow-sm" style="background-color: #0d4a46">Hari Ini</button>
                <button class="px-6 py-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">Minggu Ini</button>
                <button class="px-6 py-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">1 Bulan</button>
                <button class="px-6 py-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">3 Bulan</button>
                <button class="px-6 py-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">6 Bulan</button>
                <button class="px-6 py-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">12 Bulan</button>
            </div>

            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                <!-- Surat Masuk -->
                <div class="bg-[#EFF6FF] border border-blue-100 p-6 rounded-2xl flex justify-between items-start cursor-pointer hover:shadow-sm transition-all">
                    <div class="flex-1">
                        <p class="text-sm font-bold text-gray-700 mb-1">Surat Masuk</p>
                        <h3 class="text-[40px] font-black text-gray-800 mb-3 leading-none">22</h3>
                        <p class="text-[11px] text-gray-500 max-w-[200px] leading-snug">Jumlah pengajuan surat yang masuk pada periode yang dipilih</p>
                    </div>
                    <div class="w-[72px] h-[72px] bg-blue-300/40 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner mt-1">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
                    </div>
                </div>

                <!-- Menunggu Persetujuan Akademik -->
                <div class="bg-[#FEF9C3]/40 border border-yellow-200/50 p-6 rounded-2xl flex justify-between items-start cursor-pointer hover:shadow-sm transition-all">
                    <div class="flex-1">
                        <p class="text-sm font-bold text-gray-700 mb-1">Menunggu Persetujuan Akademik</p>
                        <h3 class="text-[40px] font-black text-gray-800 mb-3 leading-none">22</h3>
                        <p class="text-[11px] text-gray-500 max-w-[220px] leading-snug">Surat yang sedang menunggu persetujuan dari pihak akademik</p>
                    </div>
                    <div class="w-[72px] h-[72px] bg-yellow-300/50 rounded-2xl flex items-center justify-center text-yellow-600 shadow-inner mt-1">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                </div>

                <!-- Perlu Revisi -->
                <div class="bg-[#FFEDD5]/40 border border-orange-200/50 p-6 rounded-2xl flex justify-between items-start cursor-pointer hover:shadow-sm transition-all">
                    <div class="flex-1">
                        <p class="text-sm font-bold text-gray-700 mb-1">Perlu Revisi</p>
                        <h3 class="text-[40px] font-black text-gray-800 mb-3 leading-none">2</h3>
                        <p class="text-[11px] text-gray-500 max-w-[200px] leading-snug">Surat yang dikembalikan kepada mahasiswa untuk diperbaiki</p>
                    </div>
                    <div class="w-[72px] h-[72px] bg-orange-200/60 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner mt-1">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    </div>
                </div>

                <!-- Surat Selesai -->
                <div class="bg-[#ECFDF5]/50 border border-green-200/50 p-6 rounded-2xl flex justify-between items-start cursor-pointer hover:shadow-sm transition-all">
                    <div class="flex-1">
                        <p class="text-sm font-bold text-gray-700 mb-1">Surat Selesai</p>
                        <h3 class="text-[40px] font-black text-gray-800 mb-3 leading-none">222</h3>
                        <p class="text-[11px] text-gray-500 max-w-[240px] leading-snug">Surat yang telah selesai diproses dan dapat digunakan oleh mahasiswa</p>
                    </div>
                    <div class="w-[72px] h-[72px] bg-emerald-200/60 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner mt-1">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                </div>
            </div>

            <!-- List Section: Daftar Surat Melebihi Batas Proses -->
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm mt-10 overflow-hidden">
                <div class="px-6 py-5 border-b border-gray-100 flex gap-3">
                    <div class="w-6 h-6 rounded-full border border-red-500 text-red-500 flex flex-col items-center justify-center shrink-0 mt-0.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="6" x2="12" y2="14"></line><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                    </div>
                    <div>
                        <h2 class="text-base font-bold text-gray-800">Daftar Surat Melebihi Batas Proses</h2>
                        <p class="text-[11px] text-gray-500 mt-1">Pengajuan surat yang belum diproses lebih dari 3 hari</p>
                    </div>
                </div>
                
                <!-- Toolbar filters -->
                <div class="px-6 py-5 flex flex-wrap gap-4 items-center justify-between border-b border-gray-50">
                    <div class="relative flex-1 min-w-[220px] max-w-md">
                        <span class="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Cari berdasarkan Nama..."
                            class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        >
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="relative min-w-[220px]">
                            <select class="w-full appearance-none px-4 py-2 pr-8 text-sm font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer bg-white text-gray-700">
                                <option value="">Semua Jenis Surat</option>
                                <option value="Surat Beasiswa">Surat Beasiswa</option>
                                <option value="Magang">Magang</option>
                                <option value="Keaktifan">Keaktifan</option>
                            </select>
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </span>
                        </div>
                        <div class="relative min-w-[220px]">
                            <select class="w-full appearance-none px-4 py-2 pr-8 text-sm font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer bg-white text-gray-700">
                                <option value="">Semua Status</option>
                                <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                                <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
                                <option value="Menunggu Tanda Tangan">Menunggu Tanda Tangan</option>
                            </select>
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Table -->
                <div class="overflow-x-auto">
                    <table class="w-full text-left bg-white">
                        <thead>
                            <tr class="border-b border-gray-100 bg-white">
                                <th class="px-6 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">
                                    <button class="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                                        Tanggal Masuk
                                        <div class="flex flex-col opacity-40"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"></polyline></svg><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="-mt-1"><polyline points="6 9 12 15 18 9"></polyline></svg></div>
                                    </button>
                                </th>
                                <th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">
                                    <button class="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                                        Mahasiswa
                                        <div class="flex flex-col opacity-40"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"></polyline></svg><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="-mt-1"><polyline points="6 9 12 15 18 9"></polyline></svg></div>
                                    </button>
                                </th>
                                <th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Status</th>
                                <th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Penanggung Jawab</th>
                                <th class="px-4 py-4 w-20"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <!-- Rows from design -->
                            <tr class="hover:bg-gray-50/50 transition-colors">
                                <td class="px-6 py-4">
                                    <p class="text-xs font-semibold text-gray-500 mb-0.5">25 Feb 2025, 10.25</p>
                                    <p class="text-[10px] font-bold text-red-500 flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> 4 hari tertunda</p>
                                </td>
                                <td class="px-4 py-4">
                                    <p class="text-sm font-semibold text-gray-700 mb-0.5">Anugrah Aidil Fitri</p>
                                    <p class="text-[11px] text-gray-400">23/518687/SV/23033</p>
                                </td>
                                <td class="px-4 py-4 whitespace-nowrap">
                                    <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-[#FEF9C3] text-yellow-700" style="border: 1px solid #FDE047">
                                        Menunggu Verifikasi
                                    </span>
                                </td>
                                <td class="px-4 py-4">
                                    <p class="text-xs font-medium text-gray-600">Fajar</p>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <a href="#" class="text-xs font-bold text-blue-500 hover:text-blue-700 hover:underline transition-colors">Lihat Detail</a>
                                </td>
                            </tr>
                            <tr class="hover:bg-gray-50/50 transition-colors">
                                <td class="px-6 py-4">
                                    <p class="text-xs font-semibold text-gray-500 mb-0.5">25 Feb 2025, 11.25</p>
                                    <p class="text-[10px] font-bold text-red-500 flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> 4 hari tertunda</p>
                                </td>
                                <td class="px-4 py-4">
                                    <p class="text-sm font-semibold text-gray-700 mb-0.5">Muhammad Naufal Daffachri</p>
                                    <p class="text-[11px] text-gray-400">23/510384/SV/24001</p>
                                </td>
                                <td class="px-4 py-4 whitespace-nowrap">
                                    <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-[#FEF9C3] text-yellow-700" style="border: 1px solid #FDE047">
                                        Menunggu Verifikasi
                                    </span>
                                </td>
                                <td class="px-4 py-4">
                                    <p class="text-xs font-medium text-gray-600">Fajar</p>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <a href="#" class="text-xs font-bold text-blue-500 hover:text-blue-700 hover:underline transition-colors">Lihat Detail</a>
                                </td>
                            </tr>
                            <tr class="hover:bg-gray-50/50 transition-colors">
                                <td class="px-6 py-4">
                                    <p class="text-xs font-semibold text-gray-500 mb-0.5">25 Feb 2025, 12.25</p>
                                    <p class="text-[10px] font-bold text-red-500 flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> 4 hari tertunda</p>
                                </td>
                                <td class="px-4 py-4">
                                    <p class="text-sm font-semibold text-gray-700 mb-0.5">Syafira Naila</p>
                                    <p class="text-[11px] text-gray-400">23/524866/SV/23423</p>
                                </td>
                                <td class="px-4 py-4 whitespace-nowrap">
                                    <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-[#FEF9C3] text-yellow-700" style="border: 1px solid #FDE047">
                                        Menunggu Verifikasi
                                    </span>
                                </td>
                                <td class="px-4 py-4">
                                    <p class="text-xs font-medium text-gray-600">Fajar</p>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <a href="#" class="text-xs font-bold text-blue-500 hover:text-blue-700 hover:underline transition-colors">Lihat Detail</a>
                                </td>
                            </tr>
                            <tr class="hover:bg-gray-50/50 transition-colors">
                                <td class="px-6 py-4">
                                    <p class="text-xs font-semibold text-gray-500 mb-0.5">26 Feb 2025, 10.25</p>
                                    <p class="text-[10px] font-bold text-red-500 flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> 3 hari tertunda</p>
                                </td>
                                <td class="px-4 py-4">
                                    <p class="text-sm font-semibold text-gray-700 mb-0.5">Anugrah Aidil Fitri</p>
                                    <p class="text-[11px] text-gray-400">23/518687/SV/23033</p>
                                </td>
                                <td class="px-4 py-4 whitespace-nowrap">
                                    <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-[#FEF9C3] text-yellow-700" style="border: 1px solid #FDE047">
                                        Menunggu Persetujuan
                                    </span>
                                </td>
                                <td class="px-4 py-4">
                                    <p class="text-xs font-medium text-gray-600">Dr. Umar Taufiq S.Kom., M.Cs</p>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <a href="#" class="text-xs font-bold text-blue-500 hover:text-blue-700 hover:underline transition-colors">Lihat Detail</a>
                                </td>
                            </tr>
                            <tr class="hover:bg-gray-50/50 transition-colors">
                                <td class="px-6 py-4">
                                    <p class="text-xs font-semibold text-gray-500 mb-0.5">26 Feb 2025, 11.25</p>
                                    <p class="text-[10px] font-bold text-red-500 flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> 3 hari tertunda</p>
                                </td>
                                <td class="px-4 py-4">
                                    <p class="text-sm font-semibold text-gray-700 mb-0.5">Syafira Naila</p>
                                    <p class="text-[11px] text-gray-400">23/524866/SV/23423</p>
                                </td>
                                <td class="px-4 py-4 whitespace-nowrap">
                                    <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-[#FEF9C3] text-yellow-700" style="border: 1px solid #FDE047">
                                        Menunggu Tanda Tangan
                                    </span>
                                </td>
                                <td class="px-4 py-4">
                                    <p class="text-xs font-medium text-gray-600">Ir. Yuris Mulya Saputra, S.T., M.Sc., Ph.D</p>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <a href="#" class="text-xs font-bold text-blue-500 hover:text-blue-700 hover:underline transition-colors">Lihat Detail</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination -->
                <div class="px-6 py-5 flex items-center justify-between border-t border-gray-100 bg-[#F5F7F9]/10">
                    <p class="text-xs font-medium text-gray-600">Menampilkan <span class="font-bold">1 - 5</span> dari <span class="font-bold">8</span> data</p>
                    <div class="flex items-center gap-1">
                        <button class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <button class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-800 font-bold bg-white hover:bg-gray-50 transition-colors">
                            1
                        </button>
                        <button class="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-gray-600 font-bold bg-transparent hover:bg-gray-50 transition-colors">
                            2
                        </button>
                        <button class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors bg-white">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    renderDashboardLayout('Monitoring Surat', content, 'super_admin', 'monitoring');
};
