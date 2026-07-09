import { apiFetch } from '../shared/api-client';

export interface SuperAdminNotificationItem {
    id?: string;
    type?: 'info' | 'warning' | 'danger' | 'success';
    title: string;
    description: string;
    date: string;
    isUnread: boolean;
}

const readStorageKey = (): string => {
    const userId = localStorage.getItem('auth_user_id') || localStorage.getItem('auth_email') || localStorage.getItem('auth_name') || 'unknown';
    return `super_admin_read_notifications:${userId}`;
};

export const getReadNotificationIds = (): Set<string> => {
    try {
        const raw = localStorage.getItem(readStorageKey());
        const parsed = raw ? JSON.parse(raw) : [];
        return new Set(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []);
    } catch {
        return new Set();
    }
};

export const markNotificationsRead = (ids: readonly string[]): void => {
    if (ids.length === 0) return;

    const readIds = getReadNotificationIds();
    ids.forEach((id) => readIds.add(id));
    localStorage.setItem(readStorageKey(), JSON.stringify(Array.from(readIds)));
};

export const applyNotificationReadState = (items: readonly SuperAdminNotificationItem[]): SuperAdminNotificationItem[] => {
    const readIds = getReadNotificationIds();
    return items.map((item) => ({
        ...item,
        isUnread: item.id ? !readIds.has(item.id) : item.isUnread,
    }));
};

export const fetchSuperAdminNotifications = async (): Promise<SuperAdminNotificationItem[]> => {
    const response = await apiFetch('/api/super-admin/notifications');
    if (!response.ok) {
        throw new Error('Notifikasi belum berhasil dimuat. Coba muat ulang halaman.');
    }

    const payload = await response.json();
    const items = Array.isArray(payload?.data) ? payload.data : [];
    return applyNotificationReadState(items);
};