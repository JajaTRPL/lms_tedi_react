import type {
    ManagedRoom,
    ManagedRoomDetail,
    ManagedRoomFacility,
    ManagedRoomPhoto,
    ManagedRoomTemplate,
    RoomAuditEntry,
    RoomFacilityCondition,
    RoomManagementFlags,
} from './types';

export const escapeHtml = (value: unknown): string => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

/**
 * All management flags default to false: an absent/partial backend payload
 * must never grant an action. Actions are shown only when explicitly allowed.
 */
export const normalizeFlags = (
    flags?: Partial<RoomManagementFlags> | null,
): RoomManagementFlags => ({
    can_edit_info: flags?.can_edit_info === true,
    can_manage_media: flags?.can_manage_media === true,
    can_manage_facilities: flags?.can_manage_facilities === true,
    can_manage_templates: flags?.can_manage_templates === true,
    can_create: flags?.can_create === true,
    can_deactivate: flags?.can_deactivate === true,
    can_activate: flags?.can_activate === true,
});

export const normalizeRoom = (raw: ManagedRoom): ManagedRoom => ({
    ...raw,
    management_flags: normalizeFlags(raw.management_flags),
    cover_photo: raw.cover_photo ?? null,
    facilities_summary: raw.facilities_summary ?? { count: 0, items: [] },
    has_active_template: raw.has_active_template === true,
});

export const normalizeRoomDetail = (raw: ManagedRoomDetail): ManagedRoomDetail => ({
    ...normalizeRoom(raw),
    photos: Array.isArray(raw.photos) ? raw.photos : [],
    facilities: Array.isArray(raw.facilities) ? raw.facilities : [],
    active_template: raw.active_template ?? null,
});

const CONDITION_LABELS: Record<RoomFacilityCondition, string> = {
    baik: 'Baik',
    perlu_perbaikan: 'Perlu perbaikan',
    rusak: 'Rusak',
};

const CONDITION_TONES: Record<RoomFacilityCondition, string> = {
    baik: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    perlu_perbaikan: 'border-amber-100 bg-amber-50 text-amber-700',
    rusak: 'border-red-100 bg-red-50 text-red-600',
};

export const isFacilityCondition = (value: unknown): value is RoomFacilityCondition =>
    value === 'baik' || value === 'perlu_perbaikan' || value === 'rusak';

export const facilityConditionLabel = (condition?: string | null): string | null =>
    isFacilityCondition(condition) ? CONDITION_LABELS[condition] : null;

export const facilityConditionTone = (condition?: string | null): string =>
    isFacilityCondition(condition)
        ? CONDITION_TONES[condition]
        : 'border-gray-200 bg-gray-50 text-gray-600';

export const formatFileSize = (bytes?: number | null): string => {
    if (bytes === null || bytes === undefined || Number.isNaN(bytes) || bytes < 0) {
        return '-';
    }
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const templateFormatLabel = (mime?: string | null): string =>
    mime?.includes('wordprocessingml') ? 'DOCX' : 'PDF';

export const formatAuditDateTime = (iso?: string | null): string => {
    if (!iso) return '-';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '-';
    return `${date.toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })} WIB`;
};

const AUDIT_SUBJECT_LABELS: Record<string, string> = {
    room: 'Ruangan',
    photo: 'Foto',
    facility: 'Fasilitas',
    template: 'Template',
};

const AUDIT_ACTION_LABELS: Record<string, string> = {
    created: 'Ditambahkan',
    updated: 'Diperbarui',
    activated: 'Diaktifkan',
    deactivated: 'Dinonaktifkan',
    uploaded: 'Diunggah',
    deleted: 'Dihapus',
    cover_set: 'Dijadikan sampul',
    reordered: 'Diurutkan ulang',
    synced: 'Disimpan',
    type_created: 'Jenis fasilitas ditambahkan',
};

/**
 * Human Indonesian summary for an audit entry, e.g. "Foto · Diunggah".
 * Falls back to the raw token when no mapping exists, never showing raw JSON.
 */
export const auditEntryLabel = (entry: RoomAuditEntry): string => {
    const subject = AUDIT_SUBJECT_LABELS[entry.subject_type] ?? entry.subject_type;
    const action = AUDIT_ACTION_LABELS[entry.action] ?? entry.action;
    return `${subject} · ${action}`;
};

/** True when the room has no photos recorded — drives a data-health badge. */
export const roomMissingPhoto = (room: ManagedRoom): boolean => !room.cover_photo;

export const roomMissingFacilities = (room: ManagedRoom): boolean =>
    (room.facilities_summary?.count ?? 0) === 0;

export const roomMissingTemplate = (room: ManagedRoom): boolean =>
    room.has_active_template !== true;

/** Photos sorted by their catalog order for gallery/management display. */
export const orderedPhotos = (photos: ManagedRoomPhoto[]): ManagedRoomPhoto[] =>
    [...photos].sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0));

/** Template versions newest-first for the history list. */
export const orderedTemplates = (templates: ManagedRoomTemplate[]): ManagedRoomTemplate[] =>
    [...templates].sort((left, right) => right.version - left.version);

export const facilityDisplayList = (facilities: ManagedRoomFacility[]): ManagedRoomFacility[] =>
    facilities.filter((facility) => Boolean(facility?.name));
