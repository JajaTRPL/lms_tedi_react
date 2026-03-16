import { renderLogin } from '../login/Login';
import { renderSidebar } from '../components/Sidebar';

export const renderDashboardLayout = (title: string, content: string, role: string) => {
    const app = document.querySelector<HTMLDivElement>('#app')!;
    app.innerHTML = `
        <div class="flex min-h-screen bg-[#F5F7F9] font-['Inter']">
            <!-- Sidebar -->
            ${renderSidebar(role)}

            <!-- Main Content -->
            <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
                <!-- Header -->
                <header class="bg-transparent px-8 py-6">
                    <div class="flex justify-between items-center">
                        <h1 class="text-2xl font-bold text-gray-800">${title}</h1>
                        
                        <div class="flex items-center gap-6">
                            <button class="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                </svg>
                                <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>
                            
                            <div class="flex items-center gap-3">
                                <div class="text-right">
                                    <p class="text-sm font-semibold text-gray-900 leading-none">ACyTest</p>
                                    <p class="text-[10px] text-gray-500 font-medium uppercase mt-1 tracking-wider">${role.replace('_', ' ')}</p>
                                </div>
                                <div class="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden text-teal-700 font-bold">
                                    <img src="/ugm-logo.png" alt="Profile" class="w-8 h-8 object-contain">
                                </div>
                                <button id="logout-btn" class="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Keluar">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <!-- Page Content -->
                <main class="flex-1 overflow-y-auto px-8 pb-8">
                    <div id="dashboard-content" class="animate-fade-in">
                        ${content}
                    </div>
                </main>
            </div>
        </div>
    `;

    document.getElementById('logout-btn')?.addEventListener('click', () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_role');
        renderLogin();
    });
};
