import { renderDashboardLayout } from '../dashboard/DashboardLayout';

export const renderDokumenTendik = (role: string) => {
    const data = [
        { date: "24 Feb 2025, 10.25", delay: "24 jam tertunda", name: "Anugrah Aidil Fitri", nim: "23/518687/SV/23033", jenis: "Surat Beasiswa" },
        { date: "24 Feb 2025, 12.25", delay: "24 jam tertunda", name: "Syafira Naila", nim: "23/524866/SV/23423", jenis: "Surat Beasiswa" },
        { date: "24 Feb 2025, 14.25", delay: "24 jam tertunda", name: "Muhammad Naufal Daffachri", nim: "23/510384/SV/24001", jenis: "Surat Magang" },
        { date: "25 Feb 2025, 07.25", delay: "", name: "Anugrah Aidil Fitri", nim: "23/518687/SV/23033", jenis: "Surat Magang" },
        { date: "25 Feb 2025, 08.25", delay: "", name: "Syafira Naila", nim: "23/524866/SV/23423", jenis: "Surat Beasiswa" },
        { date: "25 Feb 2025, 09.25", delay: "", name: "Muhammad Naufal Daffachri", nim: "23/510384/SV/24001", jenis: "Surat Beasiswa" },
        { date: "25 Feb 2025, 10.25", delay: "", name: "Anugrah Aidil Fitri", nim: "23/518687/SV/23033", jenis: "Surat Keaktifan" },
        { date: "25 Feb 2025, 11.25", delay: "", name: "Syafira Naila", nim: "23/524866/SV/23423", jenis: "Surat Beasiswa" },
        { date: "25 Feb 2025, 12.25", delay: "", name: "Muhammad Naufal Daffachri", nim: "23/510384/SV/24001", jenis: "Surat Beasiswa" },
        { date: "25 Feb 2025, 13.25", delay: "", name: "Anugrah Aidil Fitri", nim: "23/518687/SV/23033", jenis: "Surat Magang" },
    ];

    const generateRows = () => {
        return data.map((item) => {
            const delayHtml = item.delay ? `
                <div class="flex items-center gap-1 text-[#EF4444] mt-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <span class="text-[10px] font-semibold">${item.delay}</span>
                </div>
            ` : '';

            // Status is universally Menunggu Verifikasi for this view based on mockup
            const statusBadge = '<span class="inline-flex items-center justify-center min-w-[120px] px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#FEF08A]/60 text-yellow-800">Menunggu Verifikasi</span>';

            return `
            <tr class="hover:bg-gray-50/50 transition-colors">
                <td class="px-7 py-4 align-top">
                    <p class="text-xs font-semibold text-gray-500 mt-0.5">${item.date}</p>
                    ${delayHtml}
                </td>
                <td class="px-4 py-4 align-top">
                    <p class="text-xs font-bold text-gray-700 mb-0.5">${item.name}</p>
                    <p class="text-[10px] font-medium text-gray-400">${item.nim}</p>
                </td>
                <td class="px-4 py-4 align-top pt-5">
                    <span class="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#F1F5F9] text-gray-600 border border-gray-200/60">
                        ${item.jenis}
                    </span>
                </td>
                <td class="px-4 py-4 align-top pt-5 whitespace-nowrap">
                    ${statusBadge}
                </td>
                <td class="px-7 py-4 align-top text-right">
                    <button class="text-[11px] font-bold text-[#0D4A46] border-2 border-[#0D4A46] rounded-full px-5 py-1.5 hover:bg-[#0D4A46] hover:text-white transition-colors duration-200">
                        Review Dokumen
                    </button>
                </td>
            </tr>
            `;
        }).join('');
    };

    const content = `
        <div class="w-full max-w-6xl mx-auto pb-12 animate-fade-in space-y-6">
            <p class="text-gray-600 text-sm mb-4 font-medium">Daftar pengajuan surat mahasiswa yang menunggu verifikasi</p>

            <!-- Tabs -->
            <div class="flex items-center gap-0 mb-6 bg-white rounded-xl overflow-hidden border border-gray-200 w-fit shadow-sm">
                <button class="px-6 py-2.5 text-sm font-bold bg-[#0D4A46] text-white outline-none border-r border-gray-200 transition-colors">Tugas Saya</button>
                <button class="px-6 py-2.5 text-sm font-bold bg-white text-gray-600 hover:bg-gray-50 outline-none transition-colors">Semua Pengajuan</button>
            </div>

            <!-- Table Container -->
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <!-- Toolbar filters -->
                <div class="px-7 py-5 flex flex-wrap gap-4 items-center justify-between border-b border-gray-50 bg-[#F8FAFC]/50">
                    <div class="relative flex-1 min-w-[260px] max-w-md">
                        <span class="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Cari berdasarkan Nama atau NIM"
                            class="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white"
                        >
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="relative min-w-[200px]">
                            <select class="w-full appearance-none px-4 py-2.5 pr-8 text-sm font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer bg-white text-gray-700">
                                <option value="">Semua Tugas Anda</option>
                                <option value="beasiswa">Surat Beasiswa</option>
                                <option value="magang">Surat Magang</option>
                                <option value="keaktifan">Surat Keaktifan</option>
                            </select>
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </span>
                        </div>
                        <div class="relative min-w-[160px]">
                            <select class="w-full appearance-none px-4 py-2.5 pr-8 text-sm font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer bg-white text-gray-700">
                                <option value="">Semua Angkatan</option>
                                <option value="2023">2023</option>
                                <option value="2022">2022</option>
                                <option value="2021">2021</option>
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
                                <th class="px-7 py-4 text-xs font-bold text-gray-700 whitespace-nowrap w-[200px]">
                                    <button class="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                                        Tanggal Masuk
                                        <div class="flex flex-col opacity-40"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"></polyline></svg><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="-mt-1"><polyline points="6 9 12 15 18 9"></polyline></svg></div>
                                    </button>
                                </th>
                                <th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap w-[240px]">
                                    <button class="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                                        Mahasiswa
                                        <div class="flex flex-col opacity-40"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"></polyline></svg><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="-mt-1"><polyline points="6 9 12 15 18 9"></polyline></svg></div>
                                    </button>
                                </th>
                                <th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Jenis Surat</th>
                                <th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Status</th>
                                <th class="px-7 py-4"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            ${generateRows()}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Footer Pagination -->
            <div class="flex items-center justify-between mt-4 mx-2">
                <p class="text-xs font-medium text-gray-700">Menampilkan <span class="font-bold">1 - 10</span> dari <span class="font-bold">12</span> data</p>
                <div class="flex items-center gap-1">
                    <button class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <button class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-700 font-bold bg-[#E5E7EB] hover:bg-gray-300 transition-colors shadow-sm">
                        1
                    </button>
                    <button class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-700 font-bold bg-white hover:bg-gray-50 transition-colors shadow-sm">
                        2
                    </button>
                    <button class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>
            </div>

        </div>
    `;

    // Active page is 'dokumen' so the sidebar highlights the Dokumen link if CSS dictates it (the provided Sidebar.ts doesn't fully highlight, but semantically correct)
    renderDashboardLayout('Dokumen', content, role, 'dokumen');
};
