import { renderDashboardLayout } from '../dashboard/DashboardLayout';

export const renderRiwayatPengajuan = () => {
    const data = [
        { tgl: 'Selasa, 24 Feb 2026', nama: 'Surat Permohonan Beasiswa - Djarum', status: 'Diproses' },
        { tgl: 'Senin, 23 Feb 2026', nama: 'Surat Rekomendasi Magang - Shopee', status: 'Ditolak' },
        { tgl: 'Minggu, 22 Feb 2026', nama: 'Surat Rekomendasi Magang - ParagonCorp', status: 'Ditolak' },
        { tgl: 'Sabtu, 21 Feb 2026', nama: 'Surat Keaktifan Mahasiswa', status: 'Selesai' },
        { tgl: 'Jumat, 20 Feb 2026', nama: 'Surat Permohonan Beasiswa - TELADAN', status: 'Selesai' },
        { tgl: 'Kamis, 19 Feb 2026', nama: 'Surat Permohonan Beasiswa - TELADAN', status: 'Ditolak' },
        { tgl: 'Rabu, 18 Feb 2026', nama: 'Surat Permohonan Beasiswa - Bakti BCA', status: 'Selesai' },
        { tgl: 'Selasa, 17 Feb 2026', nama: 'Surat Permohonan Beasiswa - Sampoerna', status: 'Selesai' },
        { tgl: 'Senin, 16 Feb 2026', nama: 'Surat Permohonan Beasiswa - Astra', status: 'Selesai' },
        { tgl: 'Minggu, 15 Feb 2026', nama: 'Surat Permohonan Beasiswa - XL', status: 'Selesai' },
    ];

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Diproses': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Ditolak': return 'bg-red-50 text-red-600 border-red-100';
            case 'Selesai': return 'bg-teal-50 text-teal-600 border-teal-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const content = `
        <div class="space-y-6">
            <div class="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left font-['Inter']">
                        <thead>
                            <tr class="bg-white border-b border-gray-50">
                                <th class="px-8 py-5 text-[13px] font-bold text-gray-700">Tanggal Unggah</th>
                                <th class="px-8 py-5 text-[13px] font-bold text-gray-700">Nama Dokumen</th>
                                <th class="px-8 py-5 text-[13px] font-bold text-gray-700">Status</th>
                                <th class="px-8 py-5 text-[13px] font-bold text-gray-700 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            ${data.map(item => `
                                <tr class="hover:bg-gray-50/50 transition-colors group">
                                    <td class="px-8 py-5 text-sm text-gray-500 font-medium">${item.tgl}</td>
                                    <td class="px-8 py-5 text-sm font-bold text-gray-800">${item.nama}</td>
                                    <td class="px-8 py-5">
                                        <span class="${getStatusClass(item.status)} px-4 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-wider border">
                                            ${item.status}
                                        </span>
                                    </td>
                                    <td class="px-8 py-5 text-right">
                                        <a href="#" class="text-primary-teal font-bold text-sm hover:underline">Lihat Detail</a>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Pagination -->
            <div class="flex items-center justify-between px-2">
                <p class="text-sm font-bold text-gray-700">Showing <span class="text-black">1 to 10</span> of <span class="text-black">12</span> results</p>
                <div class="flex items-center gap-2">
                    <button class="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <button class="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-200 text-gray-900 font-bold border border-gray-200">1</button>
                    <button class="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">2</button>
                    <button class="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    renderDashboardLayout('Riwayat Pengajuan', content, 'mahasiswa', 'history');
};
