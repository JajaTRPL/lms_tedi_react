import { renderDashboardLayout } from './DashboardLayout';

export const renderAkademikDashboard = (role: string) => {
    const content = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <h3 class="font-bold text-gray-900">Persetujuan Dokumen</h3>
                <p class="text-sm text-gray-500 mt-2">Tinjau dan tanda tangani dokumen permohonan.</p>
            </div>
        </div>
        
        <div class="mt-8 bg-purple-50 border border-purple-100 p-4 rounded-xl text-purple-800 text-sm italic">
            <strong>Catatan:</strong> Sebagai Pejabat (${role}), Anda mengakses menu <code>/api/akademik/</code>.
        </div>
    `;
    renderDashboardLayout('Dashboard Akademik', content, role);
};
