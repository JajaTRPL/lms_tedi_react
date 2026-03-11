import { renderDashboardLayout } from './DashboardLayout';

export const renderMahasiswaDashboard = () => {
    const content = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                <div class="w-12 h-12 bg-teal-50 text-secondary-teal rounded-xl flex items-center justify-center mb-4 group-hover:bg-secondary-teal group-hover:text-white transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <h3 class="font-bold text-gray-900">Pengajuan Beasiswa</h3>
                <p class="text-sm text-gray-500 mt-2">Isi formulir pengajuan beasiswa departemen.</p>
            </div>
            
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <h3 class="font-bold text-gray-900">Jadwal Skripsi/Tugas Akhir</h3>
                <p class="text-sm text-gray-500 mt-2">Lihat jadwal sidang dan bimbingan.</p>
            </div>
        </div>
        
        <div class="mt-8 bg-teal-50 border border-teal-100 p-4 rounded-xl text-teal-800 text-sm italic">
            <strong>Catatan:</strong> Sebagai Mahasiswa, Anda mengakses menu <code>/api/mahasiswa/</code>.
        </div>
    `;
    renderDashboardLayout('Dashboard Mahasiswa', content, 'mahasiswa');
};
