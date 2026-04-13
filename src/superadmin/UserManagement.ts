import { renderDashboardLayout } from '../dashboard/DashboardLayout';
import Toastify from 'toastify-js';

// Track active tab
let activeTab: 'tendik' | 'akademik' | 'mahasiswa' = 'tendik';
let allUsers: any[] = [];

export const renderUserManagement = async () => {
    renderDashboardLayout('Manajemen Akun', '<div class="flex items-center justify-center h-64"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>', 'super_admin', 'users');

    try {
        const response = await fetch('/api/super-admin/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Accept': 'application/json'
            }
        });
        const result = await response.json();
        allUsers = result.data;

        renderContent();

    } catch (error) {
        console.error('Error fetching users:', error);
        renderDashboardLayout('Manajemen Akun', '<div class="p-8 text-center text-red-600 bg-red-50 rounded-2xl">Gagal memuat data pengguna.</div>', 'super_admin', 'users');
    }
};

const renderContent = () => {
    const tabConfig: Record<string, { label: string; roles: string[]; icon: string; title: string; subtitle: string }> = {
        tendik: {
            label: 'Tenaga Pendidik',
            roles: ['tendik'],
            icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
            title: 'Daftar Akun Tenaga Pendidik',
            subtitle: 'Kelola Penugasan Tenaga Pendidik',
        },
        akademik: {
            label: 'Akademik',
            roles: ['kadep', 'kaprodi', 'sekdep', 'sekprodi', 'akademik'],
            icon: '<path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4"></path>',
            title: 'Daftar Akun Akademik',
            subtitle: 'Kelola Akun Staf Akademik & Pimpinan',
        },
        mahasiswa: {
            label: 'Mahasiswa',
            roles: ['mahasiswa'],
            icon: '<path d="M12 14l9-5-9-5-9 5 9 5zm0 7V9"></path>',
            title: 'Daftar Akun Mahasiswa',
            subtitle: 'Kelola Akun Mahasiswa Terdaftar',
        },
    };

    const cfg = tabConfig[activeTab];

    const content = `
        <div class="space-y-5 animate-fade-in pb-12">
            <!-- Tab Bar + Export -->
            <div class="flex items-end justify-between border-b border-gray-200 w-full">
                <div class="flex gap-1">
                    ${Object.entries(tabConfig).map(([key, val]) => `
                        <button
                            id="tab-${key}"
                            data-tab="${key}"
                            class="tab-btn px-5 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === key
                                ? 'border-teal-700 text-teal-700'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }"
                        >${val.label}</button>
                    `).join('')}
                </div>
                <div class="pb-3 flex items-center gap-2 ml-4">
                    <button id="export-btn" class="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-teal-700 transition-all flex items-center gap-1.5 shadow-sm">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Ekspor
                    </button>
                    <button id="import-btn" class="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-teal-700 transition-all flex items-center gap-1.5 shadow-sm">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        Impor
                    </button>
                </div>
            </div>

            <!-- Table Card -->
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <!-- Card Header -->
                <div class="px-6 py-5 border-b border-gray-100">
                    <div class="flex items-center gap-3 mb-1">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D9488" stroke-width="2">${cfg.icon}</svg>
                        <h2 class="text-base font-bold text-gray-800">${cfg.title}</h2>
                    </div>
                    <p class="text-xs text-gray-400 ml-7">${cfg.subtitle}</p>
                </div>

                <!-- Toolbar: Normal mode -->
                <div id="toolbar-normal" class="px-6 py-4 flex flex-wrap gap-3 items-center justify-between border-b border-gray-50">
                    <div class="relative flex-1 min-w-[220px] max-w-md">
                        <span class="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </span>
                        <input
                            type="text"
                            id="user-search"
                            placeholder="Cari berdasarkan Nama..."
                            class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        >
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="relative">
                            <select id="status-filter" class="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer bg-white text-gray-600">
                                <option value="">Semua Status</option>
                                <option value="Active">Aktif</option>
                                <option value="Inactive">Nonaktif</option>
                                <option value="Blocked">Suspended</option>
                            </select>
                            <span class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </span>
                        </div>
                        <button id="add-user-btn" class="flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Tambah Akun
                        </button>
                    </div>
                </div>

                <!-- Toolbar: Selection mode (hidden by default) -->
                <div id="toolbar-selection" class="hidden px-6 py-4 flex items-center justify-between border-b border-gray-50">
                    <span id="selection-count" class="text-sm font-semibold text-gray-700">0 akun dipilih</span>
                    <div class="flex items-center gap-3">
                        <button id="cancel-selection-btn" class="px-4 py-1.5 text-sm font-semibold border-2 border-teal-700 text-teal-700 rounded-xl hover:bg-teal-50 transition-all">
                            Batal
                        </button>
                        <button id="bulk-delete-btn" class="px-4 py-1.5 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all shadow-sm">
                            Hapus
                        </button>
                    </div>
                </div>

                <!-- Table -->
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="border-b border-gray-100">
                                <th class="px-6 py-3 w-10">
                                    <input type="checkbox" id="select-all" class="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer">
                                </th>
                                <th class="px-4 py-3 text-xs font-semibold text-gray-500">
                                    <button class="flex items-center gap-1 hover:text-gray-700 transition-colors" id="sort-name">
                                        Nama
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 5 5 12"></polyline></svg>
                                    </button>
                                </th>
                                <th class="px-4 py-3 text-xs font-semibold text-gray-500">Email</th>
                                <th class="px-4 py-3 text-xs font-semibold text-gray-500">Peran</th>
                                <th class="px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                                <th class="px-4 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody id="user-table-body" class="divide-y divide-gray-50">
                            ${renderFilteredRows(allUsers, cfg.roles)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Modal Placeholder -->
        <div id="modal-container"></div>

        <!-- Drawer Placeholder -->
        <div id="drawer-container"></div>
    `;

    renderDashboardLayout('Manajemen Akun', content, 'super_admin', 'users');
    setupListeners();
};

const renderFilteredRows = (users: any[], roles: string[], search = '', statusFilter = '') => {
    const filtered = users.filter(u => {
        const matchRole = roles.some(r => u.role === r || u.role?.startsWith(r));
        const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchStatus = !statusFilter || u.status === statusFilter;
        return matchRole && matchSearch && matchStatus;
    });

    if (filtered.length === 0) {
        return `<tr><td colspan="6" class="px-6 py-12 text-center text-sm text-gray-400">Tidak ada data pengguna.</td></tr>`;
    }

    return filtered.map(user => renderUserRow(user)).join('');
};

const getRoleBadge = (role: string) => {
    const roleMap: Record<string, string> = {
        tendik: 'Tenaga Pendidik',
        kadep: 'Ketua Departemen',
        kaprodi: 'Ketua Prodi',
        sekdep: 'Sekretaris Dep.',
        sekprodi: 'Sekretaris Prodi',
        akademik: 'Akademik',
        mahasiswa: 'Mahasiswa',
        super_admin: 'Super Admin',
    };
    return roleMap[role] || role;
};

const getStatusBadge = (status: string) => {
    if (status === 'Active') {
        return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100">Aktif</span>`;
    } else if (status === 'Inactive') {
        return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">Nonaktif</span>`;
    } else if (status === 'Blocked') {
        return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-500 border border-red-100">Suspended</span>`;
    }
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-500">${status}</span>`;
};

const renderUserRow = (user: any) => {
    return `
        <tr class="hover:bg-gray-50/70 transition-colors group" data-id="${user.id}">
            <td class="px-6 py-3.5">
                <input type="checkbox" class="row-checkbox w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer" data-id="${user.id}">
            </td>
            <td class="px-4 py-3.5">
                <span class="text-sm font-semibold text-gray-800">${user.name}</span>
            </td>
            <td class="px-4 py-3.5">
                <span class="text-sm text-gray-400">${user.email}</span>
            </td>
            <td class="px-4 py-3.5">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100">
                    ${getRoleBadge(user.role)}
                </span>
            </td>
            <td class="px-4 py-3.5">
                ${getStatusBadge(user.status)}
            </td>
            <td class="px-4 py-3.5 text-right">
                <div class="relative inline-block">
                    <button class="kebab-btn p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all" data-id="${user.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg>
                    </button>
                    <div class="kebab-menu hidden absolute right-0 top-8 z-50 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-sm" data-id="${user.id}">
                        <button class="edit-user-btn w-full flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-teal-700 transition-colors" data-id="${user.id}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            Edit
                        </button>
                        <button class="block-user-btn w-full flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 transition-colors" data-id="${user.id}" data-status="${user.status}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                            ${user.status === 'Blocked' ? 'Aktifkan' : 'Suspend'}
                        </button>
                        <div class="h-px bg-gray-100 my-1"></div>
                        <button class="delete-user-btn w-full flex items-center gap-2.5 px-4 py-2 text-red-500 hover:bg-red-50 transition-colors" data-id="${user.id}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            Hapus
                        </button>
                    </div>
                </div>
            </td>
        </tr>
    `;
};

const setupListeners = () => {
    const tabConfig: Record<string, { roles: string[] }> = {
        tendik:   { roles: ['tendik'] },
        akademik: { roles: ['kadep', 'kaprodi', 'sekdep', 'sekprodi', 'akademik'] },
        mahasiswa: { roles: ['mahasiswa'] },
    };

    // --- Helper: update toolbar berdasarkan jumlah yang dipilih ---
    const updateSelectionToolbar = () => {
        const checked = document.querySelectorAll('.row-checkbox:checked');
        const count = checked.length;
        const toolbarNormal = document.getElementById('toolbar-normal');
        const toolbarSelection = document.getElementById('toolbar-selection');
        const countLabel = document.getElementById('selection-count');

        if (count > 0) {
            toolbarNormal?.classList.add('hidden');
            toolbarSelection?.classList.remove('hidden');
            if (countLabel) countLabel.textContent = `${count} akun dipilih`;
        } else {
            toolbarNormal?.classList.remove('hidden');
            toolbarSelection?.classList.add('hidden');
            // Reset select-all
            const selectAll = document.getElementById('select-all') as HTMLInputElement;
            if (selectAll) selectAll.checked = false;
        }
    };

    // --- Tab switching ---
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            activeTab = (btn as HTMLElement).dataset.tab as typeof activeTab;
            renderContent();
        });
    });

    // --- Search & Status filter ---
    const searchInput = document.getElementById('user-search') as HTMLInputElement;
    const statusFilter = document.getElementById('status-filter') as HTMLSelectElement;
    const tableBody = document.getElementById('user-table-body');

    const applyFilters = () => {
        const roles = tabConfig[activeTab].roles;
        if (tableBody) {
            tableBody.innerHTML = renderFilteredRows(allUsers, roles, searchInput?.value || '', statusFilter?.value || '');
        }
        attachActionListeners(updateSelectionToolbar);
        // Setelah filter diapply, update toolbar (semua checkbox uncheck setelah re-render)
        updateSelectionToolbar();
    };

    searchInput?.addEventListener('input', applyFilters);
    statusFilter?.addEventListener('change', applyFilters);

    // --- Add user ---
    document.getElementById('add-user-btn')?.addEventListener('click', () => {
        renderUserModal();
    });

    // --- Export button ---
    document.getElementById('export-btn')?.addEventListener('click', () => {
        renderExportDrawer();
    });

    // --- Import button ---
    document.getElementById('import-btn')?.addEventListener('click', () => {
        renderImportDrawer();
    });

    // --- Select all checkbox ---
    document.getElementById('select-all')?.addEventListener('change', (e) => {
        const checked = (e.target as HTMLInputElement).checked;
        document.querySelectorAll('.row-checkbox').forEach(cb => {
            (cb as HTMLInputElement).checked = checked;
        });
        updateSelectionToolbar();
    });

    // --- Batal selection ---
    document.getElementById('cancel-selection-btn')?.addEventListener('click', () => {
        document.querySelectorAll('.row-checkbox').forEach(cb => {
            (cb as HTMLInputElement).checked = false;
        });
        const selectAll = document.getElementById('select-all') as HTMLInputElement;
        if (selectAll) selectAll.checked = false;
        updateSelectionToolbar();
    });

    // --- Bulk delete ---
    document.getElementById('bulk-delete-btn')?.addEventListener('click', async () => {
        const selectedIds = Array.from(document.querySelectorAll('.row-checkbox:checked'))
            .map(cb => (cb as HTMLElement).dataset.id);
        if (selectedIds.length === 0) return;
        if (!confirm(`Hapus ${selectedIds.length} akun secara permanen?`)) return;

        try {
            await Promise.all(selectedIds.map(id =>
                fetch(`/api/super-admin/users/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                        'Accept': 'application/json'
                    }
                })
            ));
            Toastify({ text: `${selectedIds.length} akun berhasil dihapus`, duration: 2500, style: { background: '#10B981' } }).showToast();
            await refreshUsers();
        } catch (err) {
            console.error(err);
            Toastify({ text: 'Gagal menghapus beberapa akun', duration: 2000, style: { background: '#EF4444' } }).showToast();
        }
    });

    // --- Sort by name ---
    let sortAsc = true;
    document.getElementById('sort-name')?.addEventListener('click', () => {
        allUsers.sort((a, b) => sortAsc
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        );
        sortAsc = !sortAsc;
        applyFilters();
    });

    // --- Close kebab menus on outside click ---
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.kebab-btn') && !target.closest('.kebab-menu')) {
            document.querySelectorAll('.kebab-menu').forEach(m => m.classList.add('hidden'));
        }
    });

    attachActionListeners(updateSelectionToolbar);
};


const attachActionListeners = (onSelectionChange?: () => void) => {
    // --- Row checkbox change → update toolbar ---
    document.querySelectorAll('.row-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            onSelectionChange?.();
        });
    });

    // Kebab toggle
    document.querySelectorAll('.kebab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = (btn as HTMLElement).dataset.id;
            // Close all other menus
            document.querySelectorAll('.kebab-menu').forEach(m => {
                if ((m as HTMLElement).dataset.id !== id) m.classList.add('hidden');
            });
            const menu = document.querySelector(`.kebab-menu[data-id="${id}"]`);
            menu?.classList.toggle('hidden');
        });
    });

    // Edit
    document.querySelectorAll('.edit-user-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = (btn as HTMLElement).dataset.id;
            const user = allUsers.find(u => u.id == id);
            if (user) {
                document.querySelectorAll('.kebab-menu').forEach(m => m.classList.add('hidden'));
                renderUserModal(user);
            }
        });
    });

    // Block / Unblock
    document.querySelectorAll('.block-user-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = (btn as HTMLElement).dataset.id;
            const status = (btn as HTMLElement).dataset.status;
            const endpoint = status === 'Blocked'
                ? `/api/super-admin/users/${id}/unblock`
                : `/api/super-admin/users/${id}/block`;
            try {
                const response = await fetch(endpoint, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                        'Accept': 'application/json'
                    }
                });
                const result = await response.json();
                Toastify({ text: result.message, duration: 2000, style: { background: '#10B981' } }).showToast();
                await refreshUsers();
            } catch (err) {
                console.error(err);
            }
        });
    });

    // Delete
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('Apakah Anda yakin ingin menghapus akun ini secara permanen?')) return;
            const id = (btn as HTMLElement).dataset.id;
            try {
                const response = await fetch(`/api/super-admin/users/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                        'Accept': 'application/json'
                    }
                });
                const result = await response.json();
                Toastify({ text: result.message, duration: 2000, style: { background: '#10B981' } }).showToast();
                await refreshUsers();
            } catch (err) {
                console.error(err);
            }
        });
    });
};

const refreshUsers = async () => {
    try {
        const response = await fetch('/api/super-admin/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Accept': 'application/json'
            }
        });
        const result = await response.json();
        allUsers = result.data;
        renderContent();
    } catch (err) {
        console.error(err);
    }
};

const renderUserModal = (user: any = null) => {
    const modalContainer = document.getElementById('modal-container')!;
    modalContainer.innerHTML = `
        <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div class="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
                <div class="bg-teal-700 px-6 py-4 flex justify-between items-center text-white sticky top-0 z-10">
                    <h3 class="font-bold">${user ? 'Edit Akun' : 'Tambah Akun Baru'}</h3>
                    <button id="close-modal" class="hover:bg-white/10 p-1 rounded-lg transition-colors">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <form id="user-form" class="p-6 space-y-4">
                    <div>
                        <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nama Lengkap</label>
                        <input type="text" name="name" value="${user?.name || ''}" required class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Email</label>
                        <input type="email" name="email" value="${user?.email || ''}" required class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Role</label>
                        <select id="modal-role-select" name="role" required class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all">
                            <option value="mahasiswa" ${user?.role === 'mahasiswa' ? 'selected' : ''}>Mahasiswa</option>
                            <option value="tendik" ${user?.role === 'tendik' ? 'selected' : ''}>Tenaga Pendidik (Tendik)</option>
                            <option value="kadep" ${user?.role === 'kadep' ? 'selected' : ''}>Ketua Departemen (Kadep)</option>
                            <option value="kaprodi" ${user?.role === 'kaprodi' ? 'selected' : ''}>Ketua Program Studi (Kaprodi)</option>
                            <option value="sekdep" ${user?.role === 'sekdep' ? 'selected' : ''}>Sekretaris Departemen (Sekdep)</option>
                            <option value="sekprodi" ${user?.role === 'sekprodi' ? 'selected' : ''}>Sekretaris Program Studi (Sekprodi)</option>
                        </select>
                    </div>

                    <!-- Mahasiswa Fields -->
                    <div id="mahasiswa-fields" class="${user?.role === 'mahasiswa' || !user ? '' : 'hidden'} space-y-4 pt-2 border-t border-gray-50">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">NIM</label>
                                <input type="text" name="nim" value="${user?.mahasiswa_profile?.nim || ''}" class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all" placeholder="Contoh: 21/123...">
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tgl Lahir</label>
                                <input type="date" name="tanggal_lahir" value="${user?.mahasiswa_profile?.tanggal_lahir || ''}" class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all">
                            </div>
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fakultas</label>
                            <input type="text" name="fakultas" value="${user?.mahasiswa_profile?.fakultas || ''}" class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Program Studi</label>
                            <input type="text" name="program_studi" value="${user?.mahasiswa_profile?.program_studi || ''}" class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all">
                        </div>
                    </div>

                    <!-- Tendik Fields -->
                    <div id="tendik-fields" class="${user?.role === 'tendik' ? '' : 'hidden'} space-y-4 pt-2 border-t border-gray-50">
                        <label class="block text-[10px] font-bold text-gray-400 uppercase mb-2">Penugasan Verifikasi Dokumen</label>
                        <div class="grid grid-cols-1 gap-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            ${[
                                'Surat Keterangan Aktif',
                                'Surat Pengantar Magang',
                                'Surat Permohonan Beasiswa',
                                'Surat Keterangan Lulus',
                                'Surat Permohonan Cuti',
                                'Surat Keterangan Pengganti KTM',
                                'Surat Rekomendasi',
                                'Surat Bebas Pustaka'
                            ].map(task => `
                                <label class="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" name="assigned_tasks" value="${task}" ${user?.assigned_tasks?.includes(task) ? 'checked' : ''} class="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500">
                                    <span class="text-xs text-gray-600 group-hover:text-teal-700 transition-colors">${task}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <div id="password-field" class="${!user ? '' : 'hidden'}">
                        <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Password</label>
                        <div class="relative">
                            <input type="password" id="modal-password-input" name="password" ${!user ? 'required' : ''} class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all">
                            <p id="password-hint" class="text-[9px] text-gray-400 mt-1 hidden italic">Auto-generated: [NIM] + [TglLahir]</p>
                        </div>
                    </div>

                    <div class="pt-4">
                        <button type="submit" class="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm">
                            ${user ? 'Simpan Perubahan' : 'Buat Akun'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const roleSelect = document.getElementById('modal-role-select') as HTMLSelectElement;
    const mhsFields = document.getElementById('mahasiswa-fields')!;
    const tendikFields = document.getElementById('tendik-fields')!;
    const passInput = document.getElementById('modal-password-input') as HTMLInputElement;
    const passHint = document.getElementById('password-hint')!;

    const updateVisibility = () => {
        const isMhs = roleSelect.value === 'mahasiswa';
        const isTendik = roleSelect.value === 'tendik';
        mhsFields.classList.toggle('hidden', !isMhs);
        tendikFields.classList.toggle('hidden', !isTendik);
        if (!user) {
            if (isMhs) {
                passInput.readOnly = true;
                passInput.placeholder = 'Auto-generated';
                passHint.classList.remove('hidden');
            } else {
                passInput.readOnly = false;
                passInput.placeholder = '';
                passHint.classList.add('hidden');
            }
        }
    };

    roleSelect.addEventListener('change', updateVisibility);
    updateVisibility();

    document.getElementById('close-modal')?.addEventListener('click', () => {
        modalContainer.innerHTML = '';
    });

    const form = document.getElementById('user-form') as HTMLFormElement;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data: any = Object.fromEntries(formData.entries());

        const assignedTasks = Array.from(form.querySelectorAll('input[name="assigned_tasks"]:checked')).map((cb: any) => cb.value);
        if (data.role === 'tendik') {
            data.assigned_tasks = assignedTasks;
        } else {
            delete data.assigned_tasks;
        }

        if (!user && data.role === 'mahasiswa') {
            const nim = (data.nim as string).replace(/[^a-zA-Z0-9]/g, '');
            const dob = (data.tanggal_lahir as string).replace(/[^0-9]/g, '');
            const dobParts = (data.tanggal_lahir as string).split('-');
            const dobFormatted = dobParts.length === 3 ? `${dobParts[2]}${dobParts[1]}${dobParts[0]}` : dob;
            data.password = `${nim}${dobFormatted}`;
        }

        const endpoint = user ? `/api/super-admin/users/${user.id}` : '/api/super-admin/users';
        const method = user ? 'PUT' : 'POST';

        try {
            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (response.ok) {
                Toastify({ text: result.message, duration: 2000, style: { background: '#10B981' } }).showToast();
                modalContainer.innerHTML = '';
                await refreshUsers();
            } else {
                Toastify({ text: result.message || 'Gagal menyimpan akun', duration: 2000, style: { background: '#EF4444' } }).showToast();
            }
        } catch (err) {
            console.error(err);
        }
    });
};

// ─── Helper: tutup drawer ─────────────────────────────────────────────────────
const DRAWER_ID = 'global-drawer-root';

const closeDrawer = () => {
    const container = document.getElementById(DRAWER_ID);
    if (!container) return;
    const overlay = container.querySelector('.drawer-overlay') as HTMLElement;
    const panel   = container.querySelector('.drawer-panel') as HTMLElement;
    if (overlay) overlay.style.opacity = '0';
    if (panel)   panel.style.transform = 'translateX(100%)';
    setTimeout(() => {
        container.remove();
    }, 300);
};

const getOrCreateDrawerRoot = (): HTMLElement => {
    let root = document.getElementById(DRAWER_ID);
    if (!root) {
        root = document.createElement('div');
        root.id = DRAWER_ID;
        document.body.appendChild(root);
    }
    return root;
};

// ─── Ekspor Drawer ────────────────────────────────────────────────────────────
function renderExportDrawer() {
    const container = getOrCreateDrawerRoot();
    container.innerHTML = `
        <!-- Overlay -->
        <div class="drawer-overlay fixed inset-0 bg-black/40 z-[200]" style="opacity:0; transition: opacity 0.3s ease;"></div>

        <!-- Panel -->
        <div class="drawer-panel fixed top-0 right-0 h-full w-[420px] bg-white z-[201] flex flex-col shadow-2xl" style="transform: translateX(100%); transition: transform 0.3s ease;">
            <!-- Header -->
            <div class="flex items-start justify-between px-7 pt-8 pb-4">
                <div>
                    <h2 class="text-xl font-bold text-gray-900">Ekspor Data Pengguna</h2>
                    <p class="text-sm text-gray-500 mt-1">Unduh data pengguna dari sistem dalam format file</p>
                </div>
                <button id="close-export-drawer" class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all mt-0.5">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <!-- Body -->
            <div class="flex-1 overflow-y-auto px-7 py-4 space-y-6">
                <p class="text-xs text-gray-500">Pilih data yang ingin diunduh dari sistem</p>

                <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-700">Jenis Pengguna</label>
                    <div class="relative">
                        <select id="export-user-type" class="w-full appearance-none px-4 py-2.5 pr-10 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700">
                            <option value="">Semua Pengguna</option>
                            <option value="tendik">Tenaga Pendidik</option>
                            <option value="akademik">Akademik</option>
                            <option value="mahasiswa">Mahasiswa</option>
                        </select>
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </span>
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-700">Format File</label>
                    <div class="relative">
                        <select id="export-format" class="w-full appearance-none px-4 py-2.5 pr-10 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700">
                            <option value="csv">CSV</option>
                            <option value="xlsx">XLSX (Excel)</option>
                        </select>
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </span>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="border-t border-gray-100 px-7 py-5 flex items-center justify-end gap-3">
                <button id="cancel-export-btn" class="px-5 py-2 text-sm font-semibold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all">
                    Batal
                </button>
                <button id="confirm-export-btn" class="px-5 py-2 text-sm font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-xl transition-all shadow-sm">
                    Ekspor
                </button>
            </div>
        </div>
    `;

    // Animate in — double rAF agar transisi pasti terpicu setelah paint awal
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const overlay = container.querySelector('.drawer-overlay') as HTMLElement;
            const panel   = container.querySelector('.drawer-panel') as HTMLElement;
            if (overlay) overlay.style.opacity = '1';
            if (panel)   panel.style.transform = 'translateX(0)';
        });
    });

    // Close handlers
    container.querySelector('.drawer-overlay')?.addEventListener('click', closeDrawer);
    document.getElementById('close-export-drawer')?.addEventListener('click', closeDrawer);
    document.getElementById('cancel-export-btn')?.addEventListener('click', closeDrawer);

    // Confirm export
    document.getElementById('confirm-export-btn')?.addEventListener('click', () => {
        const format    = (document.getElementById('export-format') as HTMLSelectElement)?.value || 'csv';
        const userType  = (document.getElementById('export-user-type') as HTMLSelectElement)?.value || '';
        const url = `/api/super-admin/users/export?format=${format}${userType ? '&role=' + userType : ''}`;

        // Trigger download
        const a = document.createElement('a');
        a.href = url;
        a.setAttribute('download', `users_export.${format}`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        Toastify({ text: 'Mengunduh data...', duration: 2000, style: { background: '#10B981' } }).showToast();
        closeDrawer();
    });
};

// ─── Impor Drawer ─────────────────────────────────────────────────────────────
function renderImportDrawer() {
    const container = getOrCreateDrawerRoot();
    container.innerHTML = `
        <!-- Overlay -->
        <div class="drawer-overlay fixed inset-0 bg-black/40 z-[200]" style="opacity:0; transition: opacity 0.3s ease;"></div>

        <!-- Panel -->
        <div class="drawer-panel fixed top-0 right-0 h-full w-[420px] bg-white z-[201] flex flex-col shadow-2xl" style="transform: translateX(100%); transition: transform 0.3s ease;">
            <!-- Header -->
            <div class="flex items-start justify-between px-7 pt-8 pb-4">
                <div>
                    <h2 class="text-xl font-bold text-gray-900">Impor Data Pengguna</h2>
                    <p class="text-sm text-gray-500 mt-1 leading-relaxed">Unggah file untuk menambahkan atau<br>memperbarui data pengguna secara massal</p>
                </div>
                <button id="close-import-drawer" class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all mt-0.5">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <!-- Body -->
            <div class="flex-1 overflow-y-auto px-7 py-4 space-y-6">
                <!-- Template Data -->
                <div class="space-y-2">
                    <p class="text-sm font-semibold text-gray-700">Template Data</p>
                    <p class="text-xs text-gray-400">Unduh template file untuk memastikan format data sesuai dengan sistem</p>
                    <button id="download-template-btn" class="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-teal-700 text-teal-700 rounded-xl text-sm font-semibold hover:bg-teal-50 transition-all">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        Unduh Template
                    </button>
                </div>

                <hr class="border-gray-100">

                <!-- Upload Area -->
                <div class="space-y-2">
                    <p class="text-sm font-semibold text-gray-700">Unggah File</p>
                    <div
                        id="drop-zone"
                        class="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all"
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <div class="text-center">
                            <p id="drop-zone-text" class="text-sm font-medium text-gray-600">Seret file ke area ini atau klik untuk mengunggah</p>
                            <p class="text-xs text-gray-400 mt-1">Format yang didukung: .CSV / .XLSX</p>
                        </div>
                        <input type="file" id="import-file-input" accept=".csv,.xlsx" class="hidden">
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="border-t border-gray-100 px-7 py-5 flex items-center justify-end gap-3">
                <button id="cancel-import-btn" class="px-5 py-2 text-sm font-semibold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all">
                    Batal
                </button>
                <button id="confirm-import-btn" class="px-5 py-2 text-sm font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-xl transition-all shadow-sm">
                    Impor
                </button>
            </div>
        </div>
    `;

    // Animate in — double rAF agar transisi pasti terpicu setelah paint awal
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const overlay = container.querySelector('.drawer-overlay') as HTMLElement;
            const panel   = container.querySelector('.drawer-panel') as HTMLElement;
            if (overlay) overlay.style.opacity = '1';
            if (panel)   panel.style.transform = 'translateX(0)';
        });
    });

    // Close handlers
    container.querySelector('.drawer-overlay')?.addEventListener('click', closeDrawer);
    document.getElementById('close-import-drawer')?.addEventListener('click', closeDrawer);
    document.getElementById('cancel-import-btn')?.addEventListener('click', closeDrawer);

    // Download template
    document.getElementById('download-template-btn')?.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = '/api/super-admin/users/import-template';
        a.setAttribute('download', 'template_import_users.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        Toastify({ text: 'Mengunduh template...', duration: 2000, style: { background: '#10B981' } }).showToast();
    });

    // Drag & drop / click-to-upload
    const dropZone  = document.getElementById('drop-zone')!;
    const fileInput = document.getElementById('import-file-input') as HTMLInputElement;
    const dropText  = document.getElementById('drop-zone-text')!;

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-teal-400', 'bg-teal-50');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-teal-400', 'bg-teal-50');
    });
    dropZone.addEventListener('drop', (e: DragEvent) => {
        e.preventDefault();
        dropZone.classList.remove('border-teal-400', 'bg-teal-50');
        const file = e.dataTransfer?.files[0];
        if (file) {
            dropText.textContent = `File dipilih: ${file.name}`;
            dropZone.classList.add('border-teal-500', 'bg-teal-50/50');
        }
    });

    fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (file) {
            dropText.textContent = `File dipilih: ${file.name}`;
            dropZone.classList.add('border-teal-500', 'bg-teal-50/50');
        }
    });

    // Confirm import
    document.getElementById('confirm-import-btn')?.addEventListener('click', async () => {
        const file = fileInput.files?.[0];
        if (!file) {
            Toastify({ text: 'Pilih file terlebih dahulu', duration: 2000, style: { background: '#F59E0B' } }).showToast();
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/super-admin/users/import', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Accept': 'application/json'
                },
                body: formData
            });
            const result = await response.json();
            if (response.ok) {
                Toastify({ text: result.message || 'Impor berhasil!', duration: 2500, style: { background: '#10B981' } }).showToast();
                closeDrawer();
                await refreshUsers();
            } else {
                Toastify({ text: result.message || 'Gagal mengimpor data', duration: 2500, style: { background: '#EF4444' } }).showToast();
            }
        } catch (err) {
            console.error(err);
            Toastify({ text: 'Terjadi kesalahan saat mengimpor', duration: 2000, style: { background: '#EF4444' } }).showToast();
        }
    });
};

