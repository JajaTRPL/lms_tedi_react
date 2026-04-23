import { renderDashboardLayout } from './DashboardLayout';

export const renderAkademikDashboard = (role: string) => {
    const fullName = localStorage.getItem('auth_name') || 'Dr. Umar Taufiq S.Kom., M.Cs';

    // Map role to display label
    const roleLabels: Record<string, string> = {
        'kaprodi': 'Kepala Program Studi TRPL',
        'kadep': 'Kepala Departemen Teknik Elektro dan Informatika',
        'akademik': 'Pejabat Akademik',
    };
    const roleLabel = roleLabels[role] || 'Pejabat Akademik';

    const content = `
        <div class="space-y-6 animate-fade-in pb-12 w-full max-w-[1200px] mx-auto">
            <!-- Welcome Section -->
            <div class="mt-2">
                <h2 class="text-[28px] font-bold text-gray-800 leading-tight">Halo, ${fullName}!</h2>
                <div class="flex flex-wrap gap-2 mt-3">
                    <span class="bg-[#FFD700] text-gray-900 border border-yellow-400/50 text-[10px] font-bold px-3 py-1.5 rounded-md shadow-sm">${roleLabel}</span>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
                <!-- Total Surat Masuk -->
                <div class="bg-[#EFF6FF] border border-blue-100 p-5 rounded-[20px] flex justify-between items-center shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <div>
                        <h3 class="text-[38px] font-black text-[#0EA5E9] leading-none mb-1">222</h3>
                        <p class="text-xs font-semibold text-gray-600">Total Surat Masuk</p>
                    </div>
                    <div class="w-14 h-14 bg-blue-400/20 rounded-xl flex items-center justify-center text-blue-600">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                </div>

                <!-- Menunggu Paraf -->
                <div class="bg-[#FFF8F1] border border-orange-200/60 p-5 rounded-[20px] flex justify-between items-center shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <div>
                        <h3 class="text-[38px] font-black text-[#F59E0B] leading-none mb-1">2</h3>
                        <p class="text-xs font-semibold text-gray-600">Menunggu Paraf</p>
                    </div>
                    <div class="w-14 h-14 bg-[#FEF08A]/60 rounded-xl flex items-center justify-center text-[#D97706]">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    </div>
                </div>

                <!-- Disetujui Bulan Ini -->
                <div class="bg-[#F0FDF4] border border-green-200/60 p-5 rounded-[20px] flex justify-between items-center shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <div>
                        <h3 class="text-[38px] font-black text-[#10B981] leading-none mb-1">2</h3>
                        <p class="text-xs font-semibold text-gray-600">Disetujui Bulan Ini</p>
                    </div>
                    <div class="w-14 h-14 bg-green-300/40 rounded-xl flex items-center justify-center text-green-600">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                </div>
            </div>

            <!-- Antrean Perlu Tindakan Section -->
            <div class="mt-10">
                <div class="flex justify-end mb-2">
                    <a href="#" class="text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors">Lihat Selengkapnya</a>
                </div>
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div class="px-7 py-5 border-b border-gray-100 flex gap-3">
                        <div class="w-6 h-6 rounded-full border border-red-500 text-red-500 flex flex-col items-center justify-center shrink-0 mt-0.5 shadow-sm">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="6" x2="12" y2="14"></line><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                        </div>
                        <div>
                            <h2 class="text-[17px] font-bold text-gray-800">Antrean Perlu Tindakan</h2>
                            <p class="text-[11px] text-gray-500 mt-1">Daftar pengajuan surat yang memerlukan persetujuan Anda</p>
                        </div>
                    </div>

                    <!-- Toolbar filters -->
                    <div class="px-7 py-5 flex flex-wrap gap-4 items-center justify-between border-b border-gray-50 bg-[#F8FAFC]/50">
                        <div class="relative flex-1 min-w-[260px] max-w-md">
                            <span class="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Cari berdasarkan Nama, NIM, atau Nomor Surat..."
                                class="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white"
                            >
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="relative min-w-[200px]">
                                <select class="w-full appearance-none px-4 py-2.5 pr-8 text-sm font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer bg-white text-gray-700">
                                    <option value="">Semua Jenis Surat</option>
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
                                    <th class="px-7 py-4 text-xs font-bold text-gray-700 whitespace-nowrap w-[220px]">
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
                                    <th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Jenis Surat</th>
                                    <th class="px-4 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">Status</th>
                                    <th class="px-7 py-4 w-40"></th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                ${Array(5).fill(0).map((_, i) => {
                                    const mahasiswa = [
                                        "Anugrah Aidil Fitri", "Syafira Naila", "Muhammad Naufal Daffachri", "Anugrah Aidil Fitri", "Syafira Naila"
                                    ][i];
                                    const nim = [
                                        "23/518687/SV/23033", "23/524866/SV/23423", "23/510384/SV/24001", "23/518687/SV/23033", "23/524866/SV/23423"
                                    ][i];
                                    const time = ["10.25", "10.25", "10.25", "10.25", "10.25"][i];
                                    const dateStr = i < 3 ? "24 Feb 2025" : "25 Feb 2025";
                                    const showWarning = i < 3;
                                    const jenis = ["Surat Beasiswa", "Surat Beasiswa", "Surat Magang", "Surat Magang", "Surat Beasiswa"][i];
                                    return `
                                    <tr class="hover:bg-gray-50/50 transition-colors">
                                        <td class="px-7 py-4 align-top">
                                            <p class="text-xs font-medium text-gray-500 mb-1">${dateStr}, ${time}</p>
                                            ${showWarning ? `<p class="text-[10px] font-bold text-red-500 flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> 24 jam tertunda</p>` : ''}
                                        </td>
                                        <td class="px-4 py-4 align-top">
                                            <p class="text-xs font-bold text-gray-700 mb-0.5">${mahasiswa}</p>
                                            <p class="text-[10px] font-medium text-gray-400">${nim}</p>
                                        </td>
                                        <td class="px-4 py-4 align-top">
                                            <span class="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#F1F5F9] text-gray-600 border border-gray-200/60">
                                                ${jenis}
                                            </span>
                                        </td>
                                        <td class="px-4 py-4 align-top whitespace-nowrap">
                                            <span class="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#FEF9C3] text-[#A16207] border border-[#FDE047]">
                                                Menunggu Persetujuan
                                            </span>
                                        </td>
                                        <td class="px-7 py-3 align-top text-right">
                                            <button class="text-xs font-bold border-2 border-[#115E59] text-[#115E59] hover:bg-[#115E59] hover:text-white transition-colors rounded-xl px-4 py-2 w-full max-w-[140px] shadow-sm">
                                                Review Dokumen
                                            </button>
                                        </td>
                                    </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Riwayat Persetujuan Section -->
            <div class="mt-12">
                <div class="flex justify-end mb-2">
                    <a href="#" class="text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors">Lihat Selengkapnya</a>
                </div>
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div class="px-7 py-5 border-b border-gray-100 flex gap-3 items-start">
                        <div class="w-6 h-6 rounded-full border border-blue-500 text-blue-500 flex flex-col items-center justify-center shrink-0 mt-0.5 shadow-sm">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                        <div>
                            <h2 class="text-[17px] font-bold text-gray-800">Riwayat Persetujuan</h2>
                            <p class="text-[11px] text-gray-500 mt-1">Daftar surat yang telah Anda setujui atau tolak</p>
                        </div>
                    </div>

                    <!-- Toolbar filters -->
                    <div class="px-7 py-5 flex flex-wrap gap-4 items-center justify-between border-b border-gray-50 bg-[#F8FAFC]/50">
                        <div class="relative flex-1 min-w-[260px] max-w-md">
                            <span class="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Cari berdasarkan Nama, NIM, atau Nomor Surat..."
                                class="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white"
                            >
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="relative min-w-[200px]">
                                <select class="w-full appearance-none px-4 py-2.5 pr-8 text-sm font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer bg-white text-gray-700">
                                    <option value="">Semua Jenis Surat</option>
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
                                ${Array(5).fill(0).map((_, i) => {
                                    const mahasiswa = [
                                        "Anugrah Aidil Fitri", "Syafira Naila", "Muhammad Naufal Daffachri", "Anugrah Aidil Fitri", "Syafira Naila"
                                    ][i];
                                    const nim = [
                                        "23/518687/SV/23033", "23/524866/SV/23423", "23/510384/SV/24001", "23/518687/SV/23033", "23/524866/SV/23423"
                                    ][i];
                                    const noSurat = [
                                        "001/SPB/2026", "001/SPB/2026", "001/SPB/2026", "001/SPB/2026", "001/SPB/2026"
                                    ][i];
                                    const dateStr = i === 0 ? "Selasa, 24 Feb 2026" : "Senin, 23 Feb 2026";
                                    const jenis = ["Surat Beasiswa", "Surat Beasiswa", "Surat Beasiswa", "Surat Beasiswa", "Surat Beasiswa"][i];
                                    
                                    const statusVal = ["Diproses", "Ditolak", "Selesai", "Selesai", "Selesai"][i];
                                    let statusBadge = "";
                                    if (statusVal === "Diproses") {
                                        statusBadge = '<span class="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">Diproses</span>';
                                    } else if (statusVal === "Ditolak") {
                                        statusBadge = '<span class="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold bg-red-50 text-red-500 border border-red-100">Ditolak</span>';
                                    } else {
                                        statusBadge = '<span class="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">Selesai</span>';
                                    }

                                    return `
                                    <tr class="hover:bg-gray-50/50 transition-colors">
                                        <td class="px-7 py-4 align-top">
                                            <p class="text-xs font-medium text-gray-500">${dateStr}</p>
                                        </td>
                                        <td class="px-4 py-4 align-top">
                                            <p class="text-xs font-bold text-gray-800">${noSurat}</p>
                                        </td>
                                        <td class="px-4 py-4 align-top">
                                            <p class="text-xs font-bold text-gray-700 mb-0.5">${mahasiswa}</p>
                                            <p class="text-[10px] font-medium text-gray-400">${nim}</p>
                                        </td>
                                        <td class="px-4 py-4 align-top">
                                            <span class="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold bg-[#F1F5F9] text-gray-600 border border-gray-200/60">
                                                ${jenis}
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
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    renderDashboardLayout('Dashboard', content, role, 'dashboard');
};
