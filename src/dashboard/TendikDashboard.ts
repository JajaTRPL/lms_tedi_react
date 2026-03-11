import { renderDashboardLayout } from './DashboardLayout';

export const renderTendikDashboard = (role: string) => {
    const content = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <h3 class="font-bold text-gray-900">Verifikasi Berkas</h3>
                <p class="text-sm text-gray-500 mt-2">Periksa kelengkapan berkas mahasiswa.</p>
            </div>
        </div>
        
        <div class="mt-8 bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 text-sm italic">
            <strong>Catatan:</strong> Sebagai Tendik (${role}), Anda mengakses menu <code>/api/tendik/</code>.
        </div>
    `;
    renderDashboardLayout('Dashboard Tendik', content, role);
};
