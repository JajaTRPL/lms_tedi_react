import { apiFetch } from '../shared/api-client';
import { loadMahasiswaApplications } from '../shared/mahasiswa-application-list';
import { getAssignedTaskLabel, getLetterLabel, LETTER_WORKFLOW_STATUS, type TendikTaskRow } from '../shared/letter-workflow';
import { getTendikBookings } from '../mahasiswa/peminjaman/api';

export interface SuperAdminNotificationItem {
    id?: string;
    type?: 'info' | 'warning' | 'danger' | 'success';
    title: string;
    description: string;
    date: string;
    isUnread: boolean;
}

const readStorageKey = (scope = 'super_admin'): string => {
    const userId = localStorage.getItem('auth_user_id') || localStorage.getItem('auth_email') || localStorage.getItem('auth_name') || 'unknown';
    return `${scope}_read_notifications:${userId}`;
};

export const getReadNotificationIds = (scope = 'super_admin'): Set<string> => {
    try {
        const raw = localStorage.getItem(readStorageKey(scope));
        const parsed = raw ? JSON.parse(raw) : [];
        return new Set(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []);
    } catch {
        return new Set();
    }
};

export const markNotificationsRead = (ids: readonly string[], scope = 'super_admin'): void => {
    if (ids.length === 0) return;

    const readIds = getReadNotificationIds(scope);
    ids.forEach((id) => readIds.add(id));
    localStorage.setItem(readStorageKey(scope), JSON.stringify(Array.from(readIds)));
};

export const applyNotificationReadState = (
    items: readonly SuperAdminNotificationItem[],
    scope = 'super_admin',
): SuperAdminNotificationItem[] => {
    const readIds = getReadNotificationIds(scope);
    return items.map((item) => ({
        ...item,
        isUnread: item.id ? !readIds.has(item.id) : item.isUnread,
    }));
};

const NOTIFICATION_CACHE_TTL_MS = 30_000;
const notificationCache = new Map<string, { expiresAt: number; promise?: Promise<SuperAdminNotificationItem[]>; items?: SuperAdminNotificationItem[] }>();

const isProdiAcademicRole = (role: string): boolean => {
    const subRole = (localStorage.getItem('auth_sub_role') || '').toLowerCase();
    return ['kaprodi', 'sekprodi'].includes(role) || ['kaprodi', 'sekprodi'].includes(subRole);
};

const isLaboranNotificationRole = (): boolean =>
    (localStorage.getItem('auth_tendik_role') || '').toLowerCase() === 'laboran';
export const getNotificationScopeForRole = (role: string): string => {
    if (role === 'mahasiswa') return 'mahasiswa';
    if (role === 'super_admin') return 'super_admin';
    if (role.startsWith('tendik')) return isLaboranNotificationRole() ? 'laboran-return' : 'tendik';
    if (isProdiAcademicRole(role)) return 'akademik-paraf';
    return role || 'unknown';
};
const getCachedNotifications = (
    scope: string,
    loader: () => Promise<SuperAdminNotificationItem[]>,
): Promise<SuperAdminNotificationItem[]> => {
    const now = Date.now();
    const cached = notificationCache.get(scope);
    if (cached?.items && cached.expiresAt > now) {
        return Promise.resolve(applyNotificationReadState(cached.items, scope));
    }
    if (cached?.promise) return cached.promise.then((items) => applyNotificationReadState(items, scope));

    const promise = loader()
        .then((items) => {
            notificationCache.set(scope, {
                items,
                expiresAt: Date.now() + NOTIFICATION_CACHE_TTL_MS,
            });
            return items;
        })
        .catch((error) => {
            notificationCache.delete(scope);
            throw error;
        });

    notificationCache.set(scope, { expiresAt: now + NOTIFICATION_CACHE_TTL_MS, promise });
    return promise.then((items) => applyNotificationReadState(items, scope));
};

export const clearNotificationCache = (scope?: string): void => {
    if (scope) {
        notificationCache.delete(scope);
        return;
    }
    notificationCache.clear();
};

export const fetchSuperAdminNotifications = async (): Promise<SuperAdminNotificationItem[]> => {
    const response = await apiFetch('/api/super-admin/notifications');
    if (!response.ok) {
        throw new Error('Notifikasi belum berhasil dimuat. Coba muat ulang halaman.');
    }

    const payload = await response.json();
    const items = Array.isArray(payload?.data) ? payload.data : [];
    return applyNotificationReadState(items, 'super_admin');
};

const parseTime = (value: unknown): number => {
    const parsed = value ? new Date(String(value)).getTime() : 0;
    return Number.isFinite(parsed) ? parsed : 0;
};

const formatNotificationDate = (value: unknown): string => {
    const parsed = value ? new Date(String(value)) : null;
    if (!parsed || Number.isNaN(parsed.getTime())) return '-';
    return parsed.toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const reviewerName = (app: any, stage: 'tendik' | 'kaprodi' | 'kadep'): string => {
    const candidates = stage === 'tendik'
        ? [app?.tendik_approved_by_name, app?.assigned_tendik_name, app?.assignedTendik?.name, app?.assigned_tendik?.name]
        : stage === 'kaprodi'
            ? [app?.kaprodi_approved_by_name, app?.kaprodi?.name]
            : [app?.kadep_approved_by_name, app?.kadep?.name];
    const found = candidates.find((value) => typeof value === 'string' && value.trim() !== '');
    if (found) return found;
    if (stage === 'tendik') return 'Tenaga Pendidik';
    if (stage === 'kaprodi') return 'Kaprodi';
    return 'Departemen';
};

const rejectionReviewerName = (app: any): string => {
    if (typeof app?.rejected_by_name === 'string' && app.rejected_by_name.trim()) return app.rejected_by_name;
    if (!app?.tendik_approved_at) return reviewerName(app, 'tendik');
    if (!app?.kaprodi_approved_at) return reviewerName(app, 'kaprodi');
    return reviewerName(app, 'kadep');
};

const fetchLaboranReturnNotifications = async (): Promise<SuperAdminNotificationItem[]> => {
    const envelope = await getTendikBookings({
        status: 'completed',
        roomType: 'laboratory',
        page: 1,
        perPage: 30,
    });

    const items: Array<SuperAdminNotificationItem & { sortTime: number }> = envelope.data
        .filter((booking) => Boolean(booking.return_info?.returned_at))
        .map((booking) => {
            const returnedAt = booking.return_info?.returned_at || booking.updated_at || booking.end_at;
            const roomLabel = [booking.room?.code, booking.room?.name].filter(Boolean).join(' - ') || 'Laboratorium';
            const requesterName = booking.requester?.name || 'Mahasiswa';
            const returnedTo = booking.return_info?.returned_to || 'petugas laboratorium';
            const photoText = booking.return_info?.photo?.exists ? ' Foto bukti sudah tersedia.' : '';

            return {
                id: 'laboran-return:' + booking.id + ':' + (returnedAt || booking.status),
                type: 'success',
                title: 'Pengembalian laboratorium selesai',
                description: requesterName + ' sudah mengembalikan ' + roomLabel + ' kepada ' + returnedTo + '.' + photoText,
                date: formatNotificationDate(returnedAt),
                isUnread: true,
                sortTime: parseTime(returnedAt),
            };
        });

    const sorted = items
        .sort((a, b) => b.sortTime - a.sortTime)
        .map(({ sortTime: _sortTime, ...item }) => item);

    return applyNotificationReadState(sorted, 'laboran-return');
};
export const fetchTendikNotifications = async (): Promise<SuperAdminNotificationItem[]> => {
    if (isLaboranNotificationRole()) return fetchLaboranReturnNotifications();

    const response = await apiFetch('/api/tendik/dashboard/tasks');
    if (!response.ok) {
        throw new Error('Notifikasi Tendik belum berhasil dimuat. Coba muat ulang halaman.');
    }

    const payload = await response.json();
    const tasks = Array.isArray(payload?.tasks) ? payload.tasks as TendikTaskRow[] : [];
    const items: Array<SuperAdminNotificationItem & { sortTime: number }> = tasks.map((task) => {
        const letterType = String(task.letter_type || task.type || '');
        const typeLabel = getAssignedTaskLabel(letterType) || String(task.type || 'Surat Administrasi');
        const studentName = task.student_name || 'Mahasiswa';
        const submittedAt = task.submitted_at || '';
        const overdueText = task.is_overdue ? ' Pengajuan ini sudah tertunda lebih lama dan sebaiknya segera dicek.' : '';

        return {
            id: `tendik:${letterType || 'surat'}:${task.id}:${submittedAt || task.status || 'queue'}`,
            type: task.is_overdue ? 'warning' : 'info',
            title: `${typeLabel} perlu dicek`,
            description: `${studentName} mengajukan ${typeLabel}. Silakan cek untuk disetujui, direvisi, atau ditolak.${overdueText}`,
            date: submittedAt || '-',
            isUnread: true,
            sortTime: parseTime(submittedAt),
        };
    });

    const sorted = items
        .sort((a, b) => b.sortTime - a.sortTime)
        .map(({ sortTime: _sortTime, ...item }) => item);

    return applyNotificationReadState(sorted, 'tendik');
};

const fetchAkademikActionNotifications = async (options: {
    scope: 'akademik-paraf' | 'akademik-ttd';
    actionLabel: 'diparaf' | 'ditandatangani';
    actionNoun: 'paraf' | 'tanda tangan';
    reviewerLabel: string;
    errorLabel: string;
}): Promise<SuperAdminNotificationItem[]> => {
    const response = await apiFetch('/api/akademik/dashboard/tasks');
    if (!response.ok) {
        throw new Error(`${options.errorLabel} belum berhasil dimuat. Coba muat ulang halaman.`);
    }

    const payload = await response.json();
    const tasks = Array.isArray(payload?.tasks) ? payload.tasks as TendikTaskRow[] : [];
    const items: Array<SuperAdminNotificationItem & { sortTime: number }> = tasks.map((task) => {
        const letterType = String(task.letter_type || task.type || '');
        const typeLabel = getAssignedTaskLabel(letterType) || String(task.type || 'Surat Administrasi');
        const studentName = task.student_name || 'Mahasiswa';
        const submittedAt = task.submitted_at || '';
        const overdueText = task.is_overdue ? ` Pengajuan ini sudah tertunda lebih lama dan sebaiknya segera ${options.actionLabel}.` : '';

        return {
            id: `${options.scope}:${letterType || 'surat'}:${task.id}:${submittedAt || task.status || 'queue'}`,
            type: task.is_overdue ? 'warning' : 'info',
            title: `${typeLabel} perlu ${options.actionLabel}`,
            description: `${studentName} mengajukan ${typeLabel}. Pengajuan ini menunggu ${options.actionNoun} ${options.reviewerLabel}.${overdueText}`,
            date: submittedAt || '-',
            isUnread: true,
            sortTime: parseTime(submittedAt),
        };
    });

    const sorted = items
        .sort((a, b) => b.sortTime - a.sortTime)
        .map(({ sortTime: _sortTime, ...item }) => item);

    return applyNotificationReadState(sorted, options.scope);
};

export const fetchAkademikParafNotifications = async (): Promise<SuperAdminNotificationItem[]> => {
    const role = (localStorage.getItem('auth_sub_role') || localStorage.getItem('auth_role') || '').toLowerCase();
    return fetchAkademikActionNotifications({
        scope: 'akademik-paraf',
        actionLabel: 'diparaf',
        actionNoun: 'paraf',
        reviewerLabel: role === 'sekprodi' ? 'Sekprodi' : 'Kaprodi/Sekprodi',
        errorLabel: 'Notifikasi paraf',
    });
};

export const fetchAkademikTandaTanganNotifications = async (): Promise<SuperAdminNotificationItem[]> => {
    const role = (localStorage.getItem('auth_sub_role') || localStorage.getItem('auth_role') || '').toLowerCase();
    return fetchAkademikActionNotifications({
        scope: 'akademik-ttd',
        actionLabel: 'ditandatangani',
        actionNoun: 'tanda tangan',
        reviewerLabel: role === 'sekdep' ? 'Sekdep' : 'Kadep/Sekdep',
        errorLabel: 'Notifikasi tanda tangan',
    });
};
export const fetchMahasiswaNotifications = async (): Promise<SuperAdminNotificationItem[]> => {
    const loaded = await loadMahasiswaApplications((url: string) => apiFetch(url, { cache: 'no-store' }));
    const notifications: Array<SuperAdminNotificationItem & { sortTime: number }> = [];

    loaded.items.forEach((item) => {
        const app = item.raw;
        const label = getLetterLabel(item.letterType) || item.label || 'Pengajuan surat';
        const baseId = `mahasiswa:${item.letterType}:${item.id}`;

        const approvalStages: Array<{ key: 'tendik' | 'kaprodi' | 'kadep'; at?: string | null; label: string }> = [
            { key: 'tendik', at: app?.tendik_approved_at, label: reviewerName(app, 'tendik') },
            { key: 'kaprodi', at: app?.kaprodi_approved_at, label: reviewerName(app, 'kaprodi') },
            { key: 'kadep', at: app?.kadep_approved_at, label: reviewerName(app, 'kadep') },
        ];

        approvalStages.forEach((stage) => {
            if (!stage.at) return;
            notifications.push({
                id: `${baseId}:${stage.key}-approved:${stage.at}`,
                type: 'success',
                title: `${label} disetujui`,
                description: `${label} telah disetujui oleh ${stage.label}.`,
                date: formatNotificationDate(stage.at),
                isUnread: true,
                sortTime: parseTime(stage.at),
            });
        });

        if (item.status === LETTER_WORKFLOW_STATUS.REJECTED || app?.rejected_at) {
            const rejectedAt = app?.rejected_at || app?.updated_at || item.sortDate || item.displayDate;
            const reason = app?.rejection_reason ? ` Alasan: ${app.rejection_reason}` : ' Alasan belum dicantumkan.';
            notifications.push({
                id: `${baseId}:rejected:${rejectedAt || item.status}`,
                type: 'danger',
                title: `${label} ditolak`,
                description: `${label} ditolak oleh ${rejectionReviewerName(app)}.${reason}`,
                date: formatNotificationDate(rejectedAt),
                isUnread: true,
                sortTime: parseTime(rejectedAt),
            });
        }
    });

    const sorted = notifications
        .sort((a, b) => b.sortTime - a.sortTime)
        .map(({ sortTime: _sortTime, ...item }) => item);

    return applyNotificationReadState(sorted, 'mahasiswa');
};

export const fetchNotificationsForRole = async (role: string): Promise<SuperAdminNotificationItem[]> => {
    if (role === 'mahasiswa') return getCachedNotifications(getNotificationScopeForRole(role), fetchMahasiswaNotifications);
    if (role === 'super_admin') return getCachedNotifications(getNotificationScopeForRole(role), fetchSuperAdminNotifications);
    if (role.startsWith('tendik')) return getCachedNotifications(getNotificationScopeForRole(role), fetchTendikNotifications);
    if (isProdiAcademicRole(role)) return getCachedNotifications(getNotificationScopeForRole(role), fetchAkademikParafNotifications);
    return [];
};
