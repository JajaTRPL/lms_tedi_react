export const renderSidebar = (currentRole: string) => {
    if (currentRole !== 'mahasiswa') return '';
    return `
        <aside class="w-64 bg-primary-teal text-white min-h-screen flex flex-col sticky top-0 h-screen overflow-y-auto">
            <div class="p-6 flex items-center gap-4">
                <img src="/ugm-logo.png" alt="UGM Logo" class="w-10 h-10 object-contain brightness-0 invert">
                <span class="text-xl font-bold tracking-tight">Surat DTEDI</span>
            </div>

            <nav class="flex-1 mt-6 px-4 space-y-2">
                <a href="#" id="sidebar-dashboard-link" class="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl text-white transition-all duration-200">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span class="font-medium">Dashboard</span>
                </a>

                <a href="#" class="flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white rounded-xl transition-all duration-200">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span class="font-medium">Panduan</span>
                </a>

                <div class="relative group">
                    <button id="sidebar-dokumen-link" class="w-full flex items-center justify-between px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white rounded-xl transition-all duration-200">
                        <div class="flex items-center gap-3">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span class="font-medium">Dokumen</span>
                        </div>
                    </button>
                </div>

                <a href="#" class="flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white rounded-xl transition-all duration-200">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 21h18"></path>
                        <path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3"></path>
                        <path d="M19 21v-4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4"></path>
                    </svg>
                    <span class="font-medium">Peminjaman Ruang</span>
                </a>

                <a href="#" class="flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white rounded-xl transition-all duration-200">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <span class="font-medium">Pengumuman</span>
                </a>
            </nav>
        </aside>
    `;
};
