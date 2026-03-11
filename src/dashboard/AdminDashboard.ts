import { renderDashboardLayout } from './DashboardLayout';

export const renderAdminDashboard = () => {
    const content = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                <div class="w-12 h-12 bg-teal-50 text-secondary-teal rounded-xl flex items-center justify-center mb-4 group-hover:bg-secondary-teal group-hover:text-white transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                </div>
                <h3 class="font-bold text-gray-900">Kelola User</h3>
                <p class="text-sm text-gray-500 mt-2">Tambah, edit, hapus, atau blokir pengguna sistem.</p>
            </div>
            
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <h3 class="font-bold text-gray-900">Laporan Aktivitas</h3>
                <p class="text-sm text-gray-500 mt-2">Lihat log masuk dan riwayat perubahan admin.</p>
            </div>

            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                </div>
                <h3 class="font-bold text-gray-900">Import/Export</h3>
                <p class="text-sm text-gray-500 mt-2">Unggah file CSV atau unduh daftar pengguna.</p>
            </div>
        </div>
        
        <div class="mt-8 bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 text-sm italic">
            <strong>Catatan:</strong> Sebagai Super Admin, Anda memiliki akses penuh ke menu <code>/api/super-admin/</code>.
        </div>
    `;
    renderDashboardLayout('Dashboard Super Admin', content, 'super_admin');
};
