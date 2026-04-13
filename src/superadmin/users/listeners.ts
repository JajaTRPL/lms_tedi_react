import Toastify from 'toastify-js';
import { state, tabConfig, type TabType } from './types';
import { refreshUsers } from './api';
import { renderFilteredRows } from './ui-utils';
import { renderUserModal, renderExportDrawer, renderImportDrawer } from './modals';

export const setupListeners = (renderContent: () => void) => {
    // --- Helper: update toolbar berdasarkan jumlah yang dipilih ---
    const updateSelectionToolbar = () => {
        const checked = document.querySelectorAll('.user-checkbox:checked');
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
            const selectAll = document.getElementById('select-all') as HTMLInputElement;
            if (selectAll) selectAll.checked = false;
        }
    };

    // --- Tab switching ---
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.activeTab = (btn as HTMLElement).dataset.tab as TabType;
            renderContent();
        });
    });

    // --- Search & Status filter ---
    const searchInput = document.getElementById('user-search') as HTMLInputElement;
    const statusFilter = document.getElementById('status-filter') as HTMLSelectElement;
    const tableBody = document.getElementById('user-table-body');

    const applyFilters = () => {
        const roles = tabConfig[state.activeTab].roles;
        if (tableBody) {
            tableBody.innerHTML = renderFilteredRows(state.allUsers, roles, searchInput?.value || '', statusFilter?.value || '');
        }
        attachActionListeners(renderContent, updateSelectionToolbar);
        updateSelectionToolbar();
    };

    searchInput?.addEventListener('input', applyFilters);
    statusFilter?.addEventListener('change', applyFilters);

    // --- Add user ---
    document.getElementById('add-user-btn')?.addEventListener('click', () => {
        renderUserModal(null, () => refreshUsers(renderContent));
    });

    // --- Dropdown Impor/Ekspor toggle ---
    document.getElementById('io-dropdown-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('io-dropdown-menu')?.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        const wrapper = document.getElementById('io-dropdown-wrapper');
        if (wrapper && !wrapper.contains(e.target as Node)) {
            document.getElementById('io-dropdown-menu')?.classList.add('hidden');
        }
        // Close all kebab menus on outside click
        const target = e.target as HTMLElement;
        if (!target.closest('.kebab-btn') && !target.closest('.kebab-menu')) {
            document.querySelectorAll('.kebab-menu').forEach(m => m.classList.add('hidden'));
        }
    });

    document.getElementById('export-btn')?.addEventListener('click', () => {
        document.getElementById('io-dropdown-menu')?.classList.add('hidden');
        renderExportDrawer();
    });

    document.getElementById('import-btn')?.addEventListener('click', () => {
        document.getElementById('io-dropdown-menu')?.classList.add('hidden');
        renderImportDrawer(() => refreshUsers(renderContent));
    });

    // --- Select all checkbox ---
    document.getElementById('select-all')?.addEventListener('change', (e) => {
        const checked = (e.target as HTMLInputElement).checked;
        document.querySelectorAll('.user-checkbox').forEach(cb => {
            (cb as HTMLInputElement).checked = checked;
        });
        updateSelectionToolbar();
    });

    // --- Batal selection ---
    document.getElementById('cancel-selection-btn')?.addEventListener('click', () => {
        document.querySelectorAll('.user-checkbox').forEach(cb => {
            (cb as HTMLInputElement).checked = false;
        });
        const selectAll = document.getElementById('select-all') as HTMLInputElement;
        if (selectAll) selectAll.checked = false;
        updateSelectionToolbar();
    });

    // --- Bulk delete ---
    document.getElementById('bulk-delete-btn')?.addEventListener('click', async () => {
        const selectedIds = Array.from(document.querySelectorAll('.user-checkbox:checked'))
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
            await refreshUsers(renderContent);
        } catch (err) {
            console.error(err);
            Toastify({ text: 'Gagal menghapus beberapa akun', duration: 2000, style: { background: '#EF4444' } }).showToast();
        }
    });

    attachActionListeners(renderContent, updateSelectionToolbar);
};

export const attachActionListeners = (renderContent: () => void, onSelectionChange?: () => void) => {
    // Checkbox changes
    document.querySelectorAll('.user-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            onSelectionChange?.();
        });
    });

    // Kebab toggle
    document.querySelectorAll('.kebab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = (btn as HTMLElement).dataset.id;
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
            const user = state.allUsers.find(u => u.id == id);
            if (user) {
                document.querySelectorAll('.kebab-menu').forEach(m => m.classList.add('hidden'));
                renderUserModal(user, () => refreshUsers(renderContent));
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
                await refreshUsers(renderContent);
            } catch (err) { console.error(err); }
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
                if (response.ok) {
                    const result = await response.json();
                    Toastify({ text: result.message || 'Akun berhasil dihapus', duration: 2000, style: { background: '#10B981' } }).showToast();
                    await refreshUsers(renderContent);
                }
            } catch (err) { console.error(err); }
        });
    });
};
