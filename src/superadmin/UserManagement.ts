import { renderDashboardLayout } from '../dashboard/DashboardLayout';
import Toastify from 'toastify-js';

export const renderUserManagement = async () => {
    renderDashboardLayout('Manajemen Akun', '<div class="flex items-center justify-center h-64"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>', 'super_admin');

    try {
        const response = await fetch('/api/super-admin/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Accept': 'application/json'
            }
        });
        const result = await response.json();
        const users = result.data;

        const content = `
            <div class="space-y-6 animate-fade-in pb-12">
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-xl font-bold text-gray-800">Daftar Pengguna Sistem</h2>
                        <p class="text-sm text-gray-500">Kelola semua akun pengguna yang terdaftar di sistem.</p>
                    </div>
                    <button id="add-user-btn" class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Tambah User Baru
                    </button>
                </div>

                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div class="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-4 justify-between items-center">
                        <div class="relative max-w-xs w-full">
                            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            </span>
                            <input type="text" id="user-search" placeholder="Cari nama atau email..." class="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all">
                        </div>
                        <div class="flex items-center gap-2">
                             <select id="role-filter" class="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
                                <option value="">Semua Role</option>
                                <option value="mahasiswa">Mahasiswa</option>
                                <option value="tendik">Tenaga Pendidik</option>
                                <option value="akademik">Akademik</option>
                             </select>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead class="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nama & Email</th>
                                    <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                                    <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tgl Terdaftar</th>
                                    <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="user-table-body" class="divide-y divide-gray-50">
                                ${users.map((user: any) => renderUserRow(user)).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Modal Placeholder -->
            <div id="modal-container"></div>
        `;

        renderDashboardLayout('Manajemen Akun', content, 'super_admin');
        setupUserManagementListeners(users);

    } catch (error) {
        console.error('Error fetching users:', error);
        renderDashboardLayout('Manajemen Akun', '<div class="p-8 text-center text-red-600 bg-red-50 rounded-2xl">Gagal memuat data pengguna.</div>', 'super_admin');
    }
};

const renderUserRow = (user: any) => {
    const statusClasses: any = {
        'Active': 'bg-teal-50 text-teal-600',
        'Inactive': 'bg-gray-100 text-gray-600',
        'Blocked': 'bg-red-50 text-red-600'
    };

    return `
        <tr class="hover:bg-gray-50/50 transition-colors group">
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm shrink-0">
                        ${user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p class="text-sm font-bold text-gray-800">${user.name}</p>
                        <p class="text-xs text-gray-500">${user.email}</p>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
                    ${user.role.replace('_', ' ')}
                </span>
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-lg ${statusClasses[user.status] || 'bg-gray-100 text-gray-600'} text-[10px] font-bold uppercase tracking-wider">
                    ${user.status}
                </span>
            </td>
            <td class="px-6 py-4 text-xs text-gray-500 font-medium">
                ${new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="edit-user-btn p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all" data-id="${user.id}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="block-user-btn p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" data-id="${user.id}" data-status="${user.status}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                    </button>
                    <button class="delete-user-btn p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" data-id="${user.id}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            </td>
        </tr>
    `;
};

const setupUserManagementListeners = (users: any) => {
    // Search Filter
    const searchInput = document.getElementById('user-search') as HTMLInputElement;
    const roleFilter = document.getElementById('role-filter') as HTMLSelectElement;
    const tableBody = document.getElementById('user-table-body');

    const filterUsers = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const role = roleFilter.value;
        const filtered = users.filter((u: any) =>
            (u.name.toLowerCase().includes(searchTerm) || u.email.toLowerCase().includes(searchTerm)) &&
            (role === '' || u.role.includes(role))
        );
        if (tableBody) tableBody.innerHTML = filtered.map((u: any) => renderUserRow(u)).join('');
        attachActionListeners(users);
    };

    searchInput?.addEventListener('input', filterUsers);
    roleFilter?.addEventListener('change', filterUsers);

    // Add User Button
    document.getElementById('add-user-btn')?.addEventListener('click', () => {
        renderUserModal();
    });

    attachActionListeners(users);
};

const attachActionListeners = (users: any) => {
    document.querySelectorAll('.edit-user-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = (btn as HTMLElement).dataset.id;
            const user = users.find((u: any) => u.id == id);
            if (user) renderUserModal(user);
        });
    });

    document.querySelectorAll('.block-user-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = (btn as HTMLElement).dataset.id;
            const status = (btn as HTMLElement).dataset.status;
            const endpoint = status === 'Blocked' ? `/api/super-admin/users/${id}/unblock` : `/api/super-admin/users/${id}/block`;

            try {
                const response = await fetch(endpoint, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                        'Accept': 'application/json'
                    }
                });
                const result = await response.json();
                Toastify({ text: result.message, duration: 2000, style: { background: "#10B981" } }).showToast();
                renderUserManagement();
            } catch (err) {
                console.error(err);
            }
        });
    });

    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('Apakah Anda yakin ingin menghapus user ini secara permanen?')) return;
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
                Toastify({ text: result.message, duration: 2000, style: { background: "#10B981" } }).showToast();
                renderUserManagement();
            } catch (err) {
                console.error(err);
            }
        });
    });
};

const renderUserModal = (user: any = null) => {
    const modalContainer = document.getElementById('modal-container')!;
    modalContainer.innerHTML = `
        <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div class="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-scale-in">
                <div class="bg-teal-600 px-6 py-4 flex justify-between items-center text-white">
                    <h3 class="font-bold">${user ? 'Edit User' : 'Tambah User Baru'}</h3>
                    <button id="close-modal" class="hover:bg-white/10 p-1 rounded-lg transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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
                    ${!user ? `
                    <div>
                        <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Password</label>
                        <input type="password" name="password" required class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all">
                    </div>
                    ` : ''}
                    <div>
                        <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Role</label>
                        <select name="role" required class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all">
                            <option value="mahasiswa" ${user?.role === 'mahasiswa' ? 'selected' : ''}>Mahasiswa</option>
                            <option value="tendik_1" ${user?.role === 'tendik_1' ? 'selected' : ''}>Tendik 1 (Verifikator)</option>
                            <option value="akademik" ${user?.role === 'akademik' ? 'selected' : ''}>Akademik (Pejabat)</option>
                        </select>
                    </div>
                    <div class="pt-4">
                        <button type="submit" class="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded-xl transition-all shadow-sm">
                            ${user ? 'Simpan Perubahan' : 'Buat User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('close-modal')?.addEventListener('click', () => {
        modalContainer.innerHTML = '';
    });

    const form = document.getElementById('user-form') as HTMLFormElement;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const endpoint = user ? `/api/super-admin/users/${user.id}` : '/api/super-admin/users';
        const method = user ? 'PUT' : 'POST';

        try {
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (response.ok) {
                Toastify({ text: result.message, duration: 2000, style: { background: "#10B981" } }).showToast();
                modalContainer.innerHTML = '';
                renderUserManagement();
            } else {
                Toastify({ text: result.message || 'Gagal menyimpan user', duration: 2000, style: { background: "#EF4444" } }).showToast();
            }
        } catch (err) {
            console.error(err);
        }
    });
};
