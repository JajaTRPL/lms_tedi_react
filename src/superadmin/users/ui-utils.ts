export const getRoleBadge = (user: any) => {
    const role = user.role;
    const subRole = user.sub_role;

    let label = role.charAt(0).toUpperCase() + role.slice(1);

    if (role === 'super_admin') {
        label = 'Super Admin';
    } else if (role === 'mahasiswa') {
        label = 'Mahasiswa';
    } else if (role === 'tendik') {
        label = 'Tendik';
    } else if (role === 'akademik' || ['kadep', 'kaprodi', 'sekdep', 'sekprodi'].includes(role)) {
        label = 'Akademik';
        if (subRole) {
            const subLabels: Record<string, string> = {
                kadep: 'Kadep',
                kaprodi: 'Kaprodi',
                sekdep: 'Sekdep',
                sekprodi: 'Sekprodi'
            };
            label += ` (${subLabels[subRole] || subRole})`;
        }
    }
    return label;
};

export const getStatusBadge = (status: string) => {
    const config: Record<string, string> = {
        'Active': 'bg-green-100 text-green-700',
        'Inactive': 'bg-red-100 text-red-700',
        'Blocked': 'bg-yellow-100 text-yellow-700'
    };
    const color = config[status] || 'bg-gray-100 text-gray-700';
    return `<span class="px-2 py-0.5 rounded-full text-[10px] font-medium ${color}">${status}</span>`;
};

export const renderUserRow = (user: any) => {
    return `
        <tr class="hover:bg-gray-50/70 transition-colors group" data-id="${user.id}">
            <td class="px-6 py-3.5">
                <input type="checkbox" class="user-checkbox w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer" data-id="${user.id}">
            </td>
            <td class="px-4 py-3.5">
                <span class="text-sm font-semibold text-gray-800">${user.name}</span>
            </td>
            <td class="px-4 py-3.5">
                <span class="text-sm text-gray-400">${user.email}</span>
            </td>
            <td class="px-4 py-3.5">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100">
                    ${getRoleBadge(user)}
                </span>
            </td>
            <td class="px-4 py-3.5">
                ${getStatusBadge(user.status || 'Active')}
            </td>
            <td class="px-4 py-3.5 text-right">
                <div class="relative inline-block">
                    <button class="kebab-btn p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all" data-id="${user.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg>
                    </button>
                    <div class="kebab-menu hidden absolute right-0 top-8 z-[100] w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-sm" data-id="${user.id}">
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

export const renderFilteredRows = (users: any[], roles: string[], search = '', statusFilter = '') => {
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
