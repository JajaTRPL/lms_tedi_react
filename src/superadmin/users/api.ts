import Toastify from 'toastify-js';
import { state } from './types';

export const refreshUsers = async (onSuccess: () => void) => {
    try {
        const response = await fetch('/api/super-admin/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Accept': 'application/json'
            }
        });
        const result = await response.json();
        state.allUsers = result.data;
        onSuccess();
    } catch (err) {
        console.error(err);
        Toastify({
            text: "Gagal memuat data terbaru",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: { background: "#EF4444" }
        }).showToast();
    }
};

export const deleteUser = async (userId: number, onSuccess: () => void) => {
    try {
        const response = await fetch(`/api/super-admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            Toastify({
                text: "User berhasil dihapus",
                duration: 3000,
                style: { background: "#10B981" }
            }).showToast();
            onSuccess();
        }
    } catch (err) {
        console.error(err);
    }
};

export const bulkDeleteUsers = async (userIds: number[], onSuccess: () => void) => {
    try {
        const response = await fetch('/api/super-admin/users/bulk-delete', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ ids: userIds })
        });

        if (response.ok) {
            Toastify({
                text: `${userIds.length} user berhasil dihapus`,
                duration: 3000,
                style: { background: "#10B981" }
            }).showToast();
            onSuccess();
        }
    } catch (err) {
        console.error(err);
    }
};
