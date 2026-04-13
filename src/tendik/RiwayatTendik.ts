import { renderDashboardLayout } from '../dashboard/DashboardLayout';

export const renderRiwayatTendik = (role: string) => {
    const data = [
        { date: "Selasa, 24 Feb 2026", no: "005/SPB/2026", name: "Anugrah Aidil Fitri", nim: "23/518687/SV/23033", jenis: "Surat Beasiswa", status: "Diproses" },
        { date: "Selasa, 24 Feb 2026", no: "003/SRM/2026", name: "Syafira Naila", nim: "23/524866/SV/23423", jenis: "Surat Beasiswa", status: "Ditolak" },
        { date: "Selasa, 24 Feb 2026", no: "004/SPB/2026", name: "Muhammad Naufal Daffachri", nim: "23/510384/SV/24001", jenis: "Surat Magang", status: "Ditolak" },
        { date: "Senin, 23 Feb 2026", no: "003/SRM/2026", name: "Anugrah Aidil Fitri", nim: "23/518687/SV/23033", jenis: "Surat Magang", status: "Selesai" },
        { date: "Senin, 23 Feb 2026", no: "003/SPB/2026", name: "Syafira Naila", nim: "23/524866/SV/23423", jenis: "Surat Beasiswa", status: "Selesai" },
        { date: "Senin, 23 Feb 2026", no: "002/SRM/2026", name: "Muhammad Naufal Daffachri", nim: "23/510384/SV/24001", jenis: "Surat Beasiswa", status: "Selesai" },
        { date: "Senin, 23 Feb 2026", no: "002/SPB/2026", name: "Anugrah Aidil Fitri", nim: "23/518687/SV/23033", jenis: "Surat Keaktifan", status: "Selesai" },
        { date: "Minggu, 22 Feb 2026", no: "001/SRM/2026", name: "Syafira Naila", nim: "23/524866/SV/23423", jenis: "Surat Beasiswa", status: "Selesai" },
        { date: "Minggu, 22 Feb 2026", no: "001/SPB/2026", name: "Muhammad Naufal Daffachri", nim: "23/510384/SV/24001", jenis: "Surat Beasiswa", status: "Selesai" },
        { date: "Minggu, 22 Feb 2026", no: "001/SKM/2026", name: "Anugrah Aidil Fitri", nim: "23/518687/SV/23033", jenis: "Surat Magang", status: "Selesai" },
    ];

    const generateRows = () => {
        return data.map((item) => {
            let statusBadge = "";
            if (item.status === "Diproses") {
                statusBadge = '<span class="inline-flex items-center justify-center min-w-[70px] px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#E0F2FE] text-[#0284C7]">Diproses</span>';
            } else if (item.status === "Ditolak") {
                statusBadge = '<span class="inline-flex items-center justify-center min-w-[70px] px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#DC2626]">Ditolak</span>';
            } else {
                statusBadge = '<span class="inline-flex items-center justify-center min-w-[70px] px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#D1FAE5] text-[#059669]">Selesai</span>';
            }

            return `
            <tr class="hover:bg-gray-50/50 transition-colors">
                <td class="px-7 py-4 align-top">
                    <p class="text-xs font-semibold text-gray-500">${item.date}</p>
                </td>
                <td class="px-4 py-4 align-top">
                    <p class="text-xs font-bold text-gray-800">${item.no}</p>
                </td>
                <td class="px-4 py-4 align-top">
                    <p class="text-xs font-bold text-gray-700 mb-0.5">${item.name}</p>
                    <p class="text-[10px] font-medium text-gray-400">${item.nim}</p>
                </td>
                <td class="px-4 py-4 align-top">
                    <span class="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#F1F5F9] text-gray-600 border border-gray-200/60">
                        ${item.jenis}
                    </span>
                </td>
                <td class="px-4 py-4 align-top whitespace-nowrap">
                    ${statusBadge}
                </td>
                <td class="px-7 py-4 align-top text-right">
                    <a href="#" class="text-xs font-bold text-blue-500 hover:text-blue-700 hover:underline transition-colors block mt-0.5">Lihat Detail</a>
                </td>
            </tr>
            `;
        }).join('');
    };

    const content = `
        <div class="w-full max-w-6xl mx-auto pb-12 animate-fade-in space-y-6">
            <p class="text-gray-600 text-sm mb-4">Daftar pengajuan surat yang telah diproses</p>

            <!-- Tabs -->
            <div class="flex items-center gap-0 mb-6 bg-white rounded-xl overflow-hidden border border-gray-200 w-fit">
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
                            placeholder="Cari berdasarkan Nama, NIM, atau Nomor Surat"
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
                                <th class="px-7 py-4 text-xs font-bold text-gray-700 whitespace-nowrap w-[180px]">
                                    <button class="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                                        Tanggal Tindakan
                                        <div class="flex flex-col opacity-40"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"></polyline></svg><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="-mt-1"><polyline points="6 9 12 15 18 9"></polyline></svg></div>
                                    </button>
                                </th>
                                <th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Nomor Surat</th>
                                <th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">
                                    <button class="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                                        Mahasiswa
                                        <div class="flex flex-col opacity-40"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"></polyline></svg><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="-mt-1"><polyline points="6 9 12 15 18 9"></polyline></svg></div>
                                    </button>
                                </th>
                                <th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Jenis Surat</th>
                                <th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Status</th>
                                <th class="px-7 py-4 w-32"></th>
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

    renderDashboardLayout('Riwayat', content, role, 'riwayat');
};
