import { renderLogin } from '../login/Login';

export const renderDashboardLayout = (title: string, content: string, role: string) => {
    const app = document.querySelector<HTMLDivElement>('#app')!;
    app.innerHTML = `
        <div class="min-h-screen bg-gray-50 font-['Inter']">
            <!-- Navigation -->
            <nav class="bg-white shadow-sm border-b border-gray-200">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-16">
                        <div class="flex items-center gap-4">
                            <img src="/ugm-logo.png" alt="Logo" class="w-10 h-10 object-contain">
                            <div class="flex flex-col">
                                <span class="text-sm font-bold text-gray-900">Sistem Persuratan</span>
                                <span class="text-[10px] text-secondary-teal font-medium uppercase tracking-wider">${role.replace('_', ' ')}</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <span class="text-sm text-gray-500 hidden md:block">Selamat datang!</span>
                            <button id="logout-btn" class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                Keluar
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Page Content -->
            <main class="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div class="mb-8">
                    <h1 class="text-2xl font-bold text-gray-900">${title}</h1>
                    <p class="text-sm text-gray-500 mt-1">Gunakan panel ini untuk menguji fungsionalitas API.</p>
                </div>
                <div id="dashboard-content" class="animate-fade-in">
                    ${content}
                </div>
            </main>
        </div>
    `;

    document.getElementById('logout-btn')?.addEventListener('click', () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_role');
        renderLogin();
    });
};
