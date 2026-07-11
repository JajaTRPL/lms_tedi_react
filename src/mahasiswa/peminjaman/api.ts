import { apiFetch } from '../../shared/api-client';
import type {
    ApiEnvelope,
    AvailabilityItem,
    BookingPayload,
    DepartmentSummary,
    LaboratorySummary,
    LaboratoryUnit,
    LaboratoryUnitPayload,
    MahasiswaBooking,
    Room,
    RoomDetail,
    RoomManagementPayload,
    RoomListEnvelope,
    RoomTemplateInfo,
    RoomType,
    SuperAdminBooking,
    SuperAdminBookingFilters,
    SuperAdminBookingListEnvelope,
    SuperAdminRoomFilters,
    TendikBooking,
    TendikBookingFilters,
    TendikBookingListEnvelope,
    TendikReviewerProfile,
    ValidationErrors,
} from './types';

const BASE = '/api/mahasiswa/peminjaman-ruangan';
const TENDIK_REQUESTS_BASE = '/api/tendik/peminjaman-ruangan/requests';
const SUPER_ADMIN_BASE = '/api/super-admin/peminjaman-ruangan';
// Protected surat-peminjaman attachment routes (role-gated inside the backend
// controller). Built from the booking id so no storage/disk path is ever
// exposed to or trusted from the frontend.
const ATTACHMENT_BASE = '/api/peminjaman-ruangan';

export const suratPeminjamanPreviewUrl = (bookingId: number): string =>
    `${ATTACHMENT_BASE}/${bookingId}/attachment/surat-peminjaman/preview`;

export const suratPeminjamanDownloadUrl = (bookingId: number): string =>
    `${ATTACHMENT_BASE}/${bookingId}/attachment/surat-peminjaman/download`;
export const returnPhotoPreviewUrl = (bookingId: number): string =>
    `${ATTACHMENT_BASE}/${bookingId}/return-photo/preview`;

export const returnPhotoDownloadUrl = (bookingId: number): string =>
    `${ATTACHMENT_BASE}/${bookingId}/return-photo/download`;

interface AvailabilityFilters {
    from: string;
    to: string;
    roomId?: number;
    type?: RoomType;
}

interface ApiErrorPayload {
    message?: string;
    code?: string;
    errors?: ValidationErrors;
    data?: Record<string, unknown>;
}

export class PeminjamanApiError extends Error {
    readonly status: number;
    readonly code?: string;
    readonly errors?: ValidationErrors;
    readonly data?: Record<string, unknown>;

    constructor(
        message: string,
        status: number,
        code?: string,
        errors?: ValidationErrors,
        data?: Record<string, unknown>,
    ) {
        super(message);
        this.name = 'PeminjamanApiError';
        this.status = status;
        this.code = code;
        this.errors = errors;
        this.data = data;
    }
}

async function readJson<T>(response: Response, fallbackMessage: string): Promise<T> {
    const payload = await response.json().catch(() => ({})) as ApiErrorPayload;
    if (!response.ok) {
        throw new PeminjamanApiError(
            payload.message || fallbackMessage,
            response.status,
            payload.code,
            payload.errors,
            payload.data,
        );
    }

    return payload as T;
}

export async function getPeminjamanRooms(): Promise<Room[]> {
    const response = await apiFetch(`${BASE}/rooms`);
    return (await readJson<RoomListEnvelope>(
        response,
        'Gagal memuat daftar ruangan aktif.',
    )).data;
}

export async function getPeminjamanAvailability(
    filters: AvailabilityFilters,
): Promise<AvailabilityItem[]> {
    const params = new URLSearchParams({
        from: filters.from,
        to: filters.to,
    });
    if (filters.roomId !== undefined) {
        params.set('room_id', String(filters.roomId));
    }
    if (filters.type !== undefined) {
        params.set('type', filters.type);
    }

    const response = await apiFetch(`${BASE}/availability?${params.toString()}`);
    return (await readJson<ApiEnvelope<AvailabilityItem[]>>(
        response,
        'Gagal memuat kalender ketersediaan ruangan.',
    )).data;
}

export async function getPeminjamanRoomDetail(roomId: number): Promise<RoomDetail> {
    const response = await apiFetch(`${BASE}/rooms/${roomId}`);
    return (await readJson<ApiEnvelope<RoomDetail>>(
        response,
        'Gagal memuat detail ruangan.',
    )).data;
}

/**
 * Load a room photo through its authenticated media endpoint and return an
 * object URL. Only relative /api endpoint references from the backend payload
 * are accepted - anything else (accidental raw path, absolute host) is
 * rejected before any request is made. Callers own revocation.
 */
export async function fetchRoomPhotoObjectUrl(mediaUrl: string): Promise<string> {
    if (!mediaUrl.startsWith('/api/')) {
        throw new PeminjamanApiError('Foto ruangan tidak dapat dimuat.', 0);
    }

    const response = await apiFetch(mediaUrl, {
        headers: { Accept: 'image/jpeg' },
    });
    if (!response.ok) {
        throw new PeminjamanApiError('Foto ruangan tidak dapat dimuat.', response.status);
    }

    return URL.createObjectURL(await response.blob());
}

/**
 * Authenticated download of the active booking template for a room:
 * blob -> browser save. Filename is built locally from the room code and the
 * template MIME; server filenames are display metadata only.
 */
export async function downloadRoomTemplate(
    room: Pick<RoomDetail, 'id' | 'code'>,
    template?: RoomTemplateInfo | null,
): Promise<void> {
    const response = await apiFetch(`${BASE}/rooms/${room.id}/template`, {
        cache: 'no-store',
    });
    if (!response.ok) {
        const message = response.status === 404
            ? 'Template peminjaman belum tersedia untuk ruangan ini.'
            : 'Template peminjaman gagal diunduh.';
        throw new PeminjamanApiError(message, response.status);
    }

    const extension = template?.mime?.includes('wordprocessingml') ? 'docx' : 'pdf';
    const safeCode = room.code.replace(/[^A-Za-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'ruangan';
    const fileName = `template-peminjaman-${safeCode}.${extension}`;

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

export async function getMahasiswaBookings(): Promise<MahasiswaBooking[]> {
    const response = await apiFetch(`${BASE}/requests`);
    return (await readJson<ApiEnvelope<MahasiswaBooking[]>>(
        response,
        'Gagal memuat daftar pengajuan peminjaman.',
    )).data;
}

export async function getMahasiswaBooking(id: number): Promise<MahasiswaBooking> {
    const response = await apiFetch(`${BASE}/requests/${id}`);
    return (await readJson<ApiEnvelope<MahasiswaBooking>>(
        response,
        'Gagal memuat detail pengajuan peminjaman.',
    )).data;
}

export async function createMahasiswaBooking(
    payload: BookingPayload,
    suratPdf: File,
): Promise<MahasiswaBooking> {
    const formData = new FormData();
    formData.append('room_id', String(payload.room_id));
    formData.append('activity_name', payload.activity_name);
    formData.append('purpose', payload.purpose);
    formData.append('participant_count', String(payload.participant_count));
    formData.append('start_at', payload.start_at);
    formData.append('end_at', payload.end_at);
    formData.append('surat_peminjaman_pdf', suratPdf);

    const response = await apiFetch(`${BASE}/requests`, {
        method: 'POST',
        body: formData,
        isFormData: true,
    });
    return (await readJson<ApiEnvelope<MahasiswaBooking>>(
        response,
        'Gagal membuat pengajuan peminjaman.',
    )).data;
}

/**
 * Replace (or upload the first) surat peminjaman PDF for a revision. Dedicated
 * multipart route - the normal PUT edit stays file-free. Backend enforces
 * owner + revision_requested.
 */
export async function replaceSuratPeminjamanPdf(
    bookingId: number,
    suratPdf: File,
): Promise<MahasiswaBooking> {
    const formData = new FormData();
    formData.append('surat_peminjaman_pdf', suratPdf);

    const response = await apiFetch(
        `${BASE}/${bookingId}/attachment/surat-peminjaman`,
        { method: 'POST', body: formData, isFormData: true },
    );
    return (await readJson<ApiEnvelope<MahasiswaBooking>>(
        response,
        'Gagal mengganti surat peminjaman.',
    )).data;
}

/**
 * Authenticated download of the surat PDF via the protected route -> blob ->
 * browser save. Never uses a raw public storage URL. Throws PeminjamanApiError with a
 * user-facing message on 403/404/other.
 */
export async function downloadSuratPeminjamanPdf(
    bookingId: number,
    fileName = 'surat-peminjaman.pdf',
): Promise<void> {
    const response = await apiFetch(suratPeminjamanDownloadUrl(bookingId), {
        cache: 'no-store',
        headers: { Accept: 'application/pdf' },
    });
    if (!response.ok) {
        const message = response.status === 403
            ? 'Anda tidak berwenang mengunduh surat ini.'
            : response.status === 404
                ? 'Surat peminjaman tidak ditemukan.'
                : 'Surat peminjaman gagal diunduh.';
        throw new PeminjamanApiError(message, response.status);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = fileName || 'surat-peminjaman.pdf';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

export async function openReturnPhotoPreview(bookingId: number): Promise<void> {
    const response = await apiFetch(returnPhotoPreviewUrl(bookingId), {
        cache: 'no-store',
        headers: { Accept: 'image/*,*/*' },
    });
    if (!response.ok) {
        const message = response.status === 403
            ? 'Anda tidak berwenang melihat bukti pengembalian ini.'
            : response.status === 404
                ? 'Bukti foto pengembalian tidak ditemukan.'
                : 'Bukti foto pengembalian gagal dimuat.';
        throw new PeminjamanApiError(message, response.status);
    }

    const objectUrl = URL.createObjectURL(await response.blob());
    const opened = window.open(objectUrl, '_blank', 'noopener');
    if (!opened) {
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.target = '_blank';
        anchor.rel = 'noopener';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    }
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

export async function downloadReturnPhoto(
    bookingId: number,
    fileName = 'bukti-pengembalian.jpg',
): Promise<void> {
    const response = await apiFetch(returnPhotoDownloadUrl(bookingId), {
        cache: 'no-store',
        headers: { Accept: 'image/*,*/*' },
    });
    if (!response.ok) {
        const message = response.status === 403
            ? 'Anda tidak berwenang mengunduh bukti pengembalian ini.'
            : response.status === 404
                ? 'Bukti foto pengembalian tidak ditemukan.'
                : 'Bukti foto pengembalian gagal diunduh.';
        throw new PeminjamanApiError(message, response.status);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = fileName || 'bukti-pengembalian.jpg';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

export async function updateMahasiswaBooking(
    id: number,
    payload: BookingPayload,
): Promise<MahasiswaBooking> {
    const response = await apiFetch(`${BASE}/requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return (await readJson<ApiEnvelope<MahasiswaBooking>>(
        response,
        'Gagal memperbarui pengajuan peminjaman.',
    )).data;
}

export async function resubmitMahasiswaBooking(id: number): Promise<MahasiswaBooking> {
    const response = await apiFetch(`${BASE}/requests/${id}/submit`, {
        method: 'PATCH',
    });
    return (await readJson<ApiEnvelope<MahasiswaBooking>>(
        response,
        'Gagal mengirim ulang pengajuan peminjaman.',
    )).data;
}

export async function cancelMahasiswaBooking(
    id: number,
    reason: string,
): Promise<MahasiswaBooking> {
    const response = await apiFetch(`${BASE}/requests/${id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
    });
    return (await readJson<ApiEnvelope<MahasiswaBooking>>(
        response,
        'Gagal membatalkan pengajuan peminjaman.',
    )).data;
}

export async function submitMahasiswaBookingReturn(
    id: number,
    payload: { returnedTo: string; note?: string },
    photo: File,
): Promise<MahasiswaBooking> {
    const formData = new FormData();
    formData.append('returned_to', payload.returnedTo);
    if (payload.note?.trim()) formData.append('return_note', payload.note.trim());
    formData.append('return_photo', photo);

    const response = await apiFetch(`${BASE}/requests/${id}/return`, {
        method: 'POST',
        body: formData,
        isFormData: true,
    });
    return (await readJson<ApiEnvelope<MahasiswaBooking>>(
        response,
        'Gagal menyimpan pengembalian peminjaman.',
    )).data;
}
export async function getTendikReviewerProfile(): Promise<TendikReviewerProfile> {
    const response = await apiFetch('/api/profile', { cache: 'no-store' });
    const payload = await readJson<{ user?: TendikReviewerProfile }>(
        response,
        'Gagal memuat profil reviewer.',
    );
    return payload.user ?? {};
}

export async function getTendikBookings(
    filters: TendikBookingFilters = {},
): Promise<TendikBookingListEnvelope> {
    const params = new URLSearchParams();
    if (filters.status !== undefined) params.set('status', filters.status);
    if (filters.roomType !== undefined) params.set('room_type', filters.roomType);
    if (filters.roomId !== undefined) params.set('room_id', String(filters.roomId));
    if (filters.dateFrom !== undefined) params.set('date_from', filters.dateFrom);
    if (filters.dateTo !== undefined) params.set('date_to', filters.dateTo);
    if (filters.page !== undefined) params.set('page', String(filters.page));
    if (filters.perPage !== undefined) params.set('per_page', String(filters.perPage));

    const query = params.toString();
    const response = await apiFetch(`${TENDIK_REQUESTS_BASE}${query ? `?${query}` : ''}`);
    return readJson<TendikBookingListEnvelope>(
        response,
        'Gagal memuat antrean review peminjaman.',
    );
}

export async function getTendikBooking(id: number): Promise<TendikBooking> {
    const response = await apiFetch(`${TENDIK_REQUESTS_BASE}/${id}`);
    return (await readJson<ApiEnvelope<TendikBooking>>(
        response,
        'Gagal memuat detail review peminjaman.',
    )).data;
}

export async function approveTendikBooking(id: number): Promise<TendikBooking> {
    const response = await apiFetch(`${TENDIK_REQUESTS_BASE}/${id}/approve`, {
        method: 'PATCH',
    });
    return (await readJson<ApiEnvelope<TendikBooking>>(
        response,
        'Gagal menyetujui peminjaman ruangan.',
    )).data;
}

export async function reviseTendikBooking(
    id: number,
    note: string,
): Promise<TendikBooking> {
    const response = await apiFetch(`${TENDIK_REQUESTS_BASE}/${id}/revise`, {
        method: 'PATCH',
        body: JSON.stringify({ note }),
    });
    return (await readJson<ApiEnvelope<TendikBooking>>(
        response,
        'Gagal mengirim permintaan revisi.',
    )).data;
}

export async function rejectTendikBooking(
    id: number,
    reason: string,
): Promise<TendikBooking> {
    const response = await apiFetch(`${TENDIK_REQUESTS_BASE}/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
    });
    return (await readJson<ApiEnvelope<TendikBooking>>(
        response,
        'Gagal menolak peminjaman ruangan.',
    )).data;
}

export async function getSuperAdminRooms(
    filters: SuperAdminRoomFilters = {},
): Promise<Room[]> {
    const params = new URLSearchParams();
    if (filters.type !== undefined) params.set('type', filters.type);
    if (filters.laboratoryId !== undefined) {
        params.set('laboratory_id', String(filters.laboratoryId));
    }
    if (filters.search !== undefined && filters.search.trim() !== '') {
        params.set('search', filters.search.trim());
    }
    if (filters.active !== undefined) params.set('active', filters.active ? '1' : '0');

    const query = params.toString();
    const response = await apiFetch(`${SUPER_ADMIN_BASE}/rooms${query ? `?${query}` : ''}`);
    return (await readJson<RoomListEnvelope>(
        response,
        'Gagal memuat daftar ruangan.',
    )).data;
}

export async function getSuperAdminRoom(id: number): Promise<Room> {
    const response = await apiFetch(`${SUPER_ADMIN_BASE}/rooms/${id}`);
    return (await readJson<ApiEnvelope<Room>>(
        response,
        'Gagal memuat detail ruangan.',
    )).data;
}

export async function createSuperAdminRoom(
    payload: RoomManagementPayload,
): Promise<Room> {
    const response = await apiFetch(`${SUPER_ADMIN_BASE}/rooms`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return (await readJson<ApiEnvelope<Room>>(
        response,
        'Gagal membuat ruangan.',
    )).data;
}

export async function updateSuperAdminRoom(
    id: number,
    payload: RoomManagementPayload,
): Promise<Room> {
    const response = await apiFetch(`${SUPER_ADMIN_BASE}/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return (await readJson<ApiEnvelope<Room>>(
        response,
        'Gagal memperbarui ruangan.',
    )).data;
}

export async function activateSuperAdminRoom(id: number): Promise<Room> {
    const response = await apiFetch(`${SUPER_ADMIN_BASE}/rooms/${id}/activate`, {
        method: 'PATCH',
    });
    return (await readJson<ApiEnvelope<Room>>(
        response,
        'Gagal mengaktifkan ruangan.',
    )).data;
}

export async function deactivateSuperAdminRoom(id: number): Promise<Room> {
    const response = await apiFetch(`${SUPER_ADMIN_BASE}/rooms/${id}/deactivate`, {
        method: 'PATCH',
    });
    return (await readJson<ApiEnvelope<Room>>(
        response,
        'Gagal menonaktifkan ruangan.',
    )).data;
}

export async function getSuperAdminLaboratories(): Promise<LaboratorySummary[]> {
    const response = await apiFetch('/api/laboratories');
    return readJson<LaboratorySummary[]>(
        response,
        'Gagal memuat daftar laboratorium.',
    );
}

export async function getSuperAdminDepartments(): Promise<DepartmentSummary[]> {
    const response = await apiFetch('/api/super-admin/departments');
    return readJson<DepartmentSummary[]>(
        response,
        'Gagal memuat daftar departemen.',
    );
}

export async function listSuperAdminLaboratoryUnits(): Promise<LaboratoryUnit[]> {
    const response = await apiFetch('/api/super-admin/laboratories');
    return (await readJson<ApiEnvelope<LaboratoryUnit[]>>(
        response,
        'Gagal memuat unit laboratorium.',
    )).data;
}

export async function createSuperAdminLaboratoryUnit(
    payload: LaboratoryUnitPayload,
): Promise<LaboratoryUnit> {
    const response = await apiFetch('/api/super-admin/laboratories', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return (await readJson<ApiEnvelope<LaboratoryUnit>>(
        response,
        'Gagal membuat unit laboratorium.',
    )).data;
}

export async function updateSuperAdminLaboratoryUnit(
    id: number,
    payload: LaboratoryUnitPayload,
): Promise<LaboratoryUnit> {
    const response = await apiFetch(`/api/super-admin/laboratories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return (await readJson<ApiEnvelope<LaboratoryUnit>>(
        response,
        'Gagal memperbarui unit laboratorium.',
    )).data;
}

export async function toggleSuperAdminLaboratoryUnit(id: number): Promise<LaboratoryUnit> {
    const response = await apiFetch(`/api/super-admin/laboratories/${id}/toggle-active`, {
        method: 'PATCH',
    });
    return (await readJson<ApiEnvelope<LaboratoryUnit>>(
        response,
        'Gagal mengubah status unit laboratorium.',
    )).data;
}

export async function deleteSuperAdminLaboratoryUnit(id: number): Promise<void> {
    const response = await apiFetch(`/api/super-admin/laboratories/${id}`, {
        method: 'DELETE',
    });
    await readJson<{ message: string }>(
        response,
        'Gagal menghapus unit laboratorium.',
    );
}
export async function getSuperAdminBookings(
    filters: SuperAdminBookingFilters = {},
): Promise<SuperAdminBookingListEnvelope> {
    const params = new URLSearchParams();
    if (filters.status !== undefined) params.set('status', filters.status);
    if (filters.roomType !== undefined) params.set('room_type', filters.roomType);
    if (filters.roomId !== undefined) params.set('room_id', String(filters.roomId));
    if (filters.dateFrom !== undefined) params.set('date_from', filters.dateFrom);
    if (filters.dateTo !== undefined) params.set('date_to', filters.dateTo);
    if (filters.page !== undefined) params.set('page', String(filters.page));
    if (filters.perPage !== undefined) params.set('per_page', String(filters.perPage));

    const query = params.toString();
    const response = await apiFetch(`${SUPER_ADMIN_BASE}/requests${query ? `?${query}` : ''}`);
    return readJson<SuperAdminBookingListEnvelope>(
        response,
        'Gagal memuat monitoring peminjaman.',
    );
}

export async function getSuperAdminBooking(id: number): Promise<SuperAdminBooking> {
    const response = await apiFetch(`${SUPER_ADMIN_BASE}/requests/${id}`);
    return (await readJson<ApiEnvelope<SuperAdminBooking>>(
        response,
        'Gagal memuat detail monitoring peminjaman.',
    )).data;
}
