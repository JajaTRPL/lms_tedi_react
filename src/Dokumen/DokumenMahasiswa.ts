import { renderDashboardLayout } from '../dashboard/DashboardLayout';
import { renderMahasiswaDashboard } from '../dashboard/MahasiswaDashboard';

export const renderDokumenMahasiswa = () => {
    const content = `
        <div class="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">

            <div class="flex justify-between items-end">
                <div>
                    <h2 class="text-3xl font-bold text-gray-800 tracking-tight">Ajukan Surat</h2>
                    <p class="text-gray-500 mt-2">Pilih jenis surat yang ingin Anda ajukan.</p>
                </div>
                <button id="btn-back-dashboard-dokumen" class="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 hover:text-teal-600 hover:border-teal-200 transition-all shadow-sm text-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    Kembali ke Dashboard
                </button>
            </div>

            <!-- Jenis Surat Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                <!-- Surat Keterangan Aktif -->
                <div class="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition-all duration-200 cursor-pointer group">
                    <div class="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                    </div>
                    <h3 class="text-base font-bold text-gray-800 mb-1">Surat Keterangan Aktif</h3>
                    <p class="text-sm text-gray-500 mb-4">Surat yang menerangkan bahwa Anda adalah mahasiswa aktif.</p>
                    <span class="inline-flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        1-3 Hari Kerja
                    </span>
                </div>

                <!-- Surat Pengantar Magang -->
                <div class="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition-all duration-200 cursor-pointer group">
                    <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                    </div>
                    <h3 class="text-base font-bold text-gray-800 mb-1">Surat Pengantar Magang</h3>
                    <p class="text-sm text-gray-500 mb-4">Surat pengantar untuk keperluan kerja praktik atau magang.</p>
                    <span class="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        2-5 Hari Kerja
                    </span>
                </div>

                <!-- Surat Rekomendasi Beasiswa -->
                <div class="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition-all duration-200 cursor-pointer group">
                    <div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="8" r="6"></circle>
                            <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path>
                        </svg>
                    </div>
                    <h3 class="text-base font-bold text-gray-800 mb-1">Surat Rekomendasi Beasiswa</h3>
                    <p class="text-sm text-gray-500 mb-4">Surat rekomendasi dari departemen untuk pengajuan beasiswa.</p>
                    <span class="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        3-7 Hari Kerja
                    </span>
                </div>

                <!-- Surat Keterangan Lulus -->
                <div class="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition-all duration-200 cursor-pointer group">
                    <div class="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <h3 class="text-base font-bold text-gray-800 mb-1">Surat Keterangan Lulus</h3>
                    <p class="text-sm text-gray-500 mb-4">Surat keterangan bahwa Anda telah menyelesaikan studi.</p>
                    <span class="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        1-3 Hari Kerja
                    </span>
                </div>

                <!-- Surat Cuti Akademik -->
                <div class="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition-all duration-200 cursor-pointer group">
                    <div class="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </div>
                    <h3 class="text-base font-bold text-gray-800 mb-1">Surat Permohonan Cuti</h3>
                    <p class="text-sm text-gray-500 mb-4">Surat permohonan cuti akademik dari semester aktif.</p>
                    <span class="inline-flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        5-10 Hari Kerja
                    </span>
                </div>

                <!-- Surat Lainnya -->
                <div class="bg-gray-50 rounded-[24px] p-6 shadow-sm border border-gray-200 border-dashed hover:shadow-md transition-all duration-200 cursor-pointer group">
                    <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="16"></line>
                            <line x1="8" y1="12" x2="16" y2="12"></line>
                        </svg>
                    </div>
                    <h3 class="text-base font-bold text-gray-500 mb-1">Surat Lainnya</h3>
                    <p class="text-sm text-gray-400 mb-4">Permohonan surat lainnya sesuai kebutuhan Anda.</p>
                    <span class="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Segera Hadir
                    </span>
                </div>

            </div>
        </div>
    `;

    renderDashboardLayout('Ajukan Surat', content, 'mahasiswa');

    setTimeout(() => {
        document.getElementById('btn-back-dashboard-dokumen')?.addEventListener('click', () => {
            renderMahasiswaDashboard();
        });
    }, 100);
};
