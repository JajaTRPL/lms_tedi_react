export type RoomType = 'classroom' | 'laboratory';

export type BookingStatus =
    | 'submitted'
    | 'revision_requested'
    | 'approved'
    | 'rejected'
    | 'cancelled';

export interface LaboratorySummary {
    id: number;
    code: string;
    name: string;
}

export interface Room {
    id: number;
    code: string;
    name: string;
    type: RoomType;
    capacity: number;
    location: string;
    description: string | null;
    is_active: boolean;
    owning_laboratory: LaboratorySummary | null;
}

export interface AvailabilityRoom {
    id: number;
    code: string;
    name: string;
    type: RoomType;
}

export interface AvailabilityItem {
    booking_id: number;
    room: AvailabilityRoom;
    start_at: string;
    end_at: string;
    status: BookingStatus;
}

export interface BookingActor {
    id: number;
    name: string;
    email: string;
}

export interface BookingStatusHistory {
    id: number;
    from_status: BookingStatus | null;
    to_status: BookingStatus;
    actor: BookingActor | null;
    note: string | null;
    created_at: string | null;
}

/**
 * Safe attachment metadata for the uploaded surat peminjaman PDF. The backend
 * only ever exposes these display/URL fields — never disk/path/storage
 * internals. All fields optional so legacy rows (no attachment recorded) and
 * partial payloads normalize safely to "no attachment".
 */
export interface SuratPeminjamanPdfMeta {
    exists?: boolean;
    has_surat_peminjaman_pdf?: boolean;
    original_name?: string | null;
    size_bytes?: number | null;
    uploaded_at?: string | null;
    preview_url?: string | null;
    download_url?: string | null;
}

export interface MahasiswaBooking {
    id: number;
    room: Room;
    activity_name: string;
    purpose: string;
    participant_count: number;
    start_at: string;
    end_at: string;
    status: BookingStatus;
    reviewer: BookingActor | null;
    reviewed_at: string | null;
    revision_note: string | null;
    rejection_reason: string | null;
    cancellation_reason: string | null;
    created_at: string | null;
    updated_at: string | null;
    status_histories?: BookingStatusHistory[];
    surat_peminjaman_pdf?: SuratPeminjamanPdfMeta | null;
}

export interface TendikBooking extends MahasiswaBooking {
    requester: BookingActor | null;
}

export type SuperAdminBooking = TendikBooking;

export interface BookingPayload {
    room_id: number;
    activity_name: string;
    purpose: string;
    participant_count: number;
    start_at: string;
    end_at: string;
}

export interface ApiEnvelope<T> {
    message: string;
    data: T;
}

export interface RoomListEnvelope extends ApiEnvelope<Room[]> {
    count: number;
}

export interface PaginationMeta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

export interface TendikBookingListEnvelope extends ApiEnvelope<TendikBooking[]> {
    meta: PaginationMeta;
}

export interface SuperAdminBookingListEnvelope extends ApiEnvelope<SuperAdminBooking[]> {
    meta: PaginationMeta;
}

export interface TendikBookingFilters {
    status?: BookingStatus;
    roomType?: RoomType;
    roomId?: number;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    perPage?: number;
}

export type SuperAdminBookingFilters = TendikBookingFilters;

export interface SuperAdminRoomFilters {
    type?: RoomType;
    laboratoryId?: number;
    search?: string;
    active?: boolean;
}

export interface RoomManagementPayload {
    code: string;
    name: string;
    type: RoomType;
    capacity: number;
    location: string;
    description: string | null;
    owning_laboratory_id: number | null;
}

export type TendikReviewerRole =
    | 'persuratan'
    | 'sarpras'
    | 'kepala_lab'
    | 'laboran';

export interface TendikReviewerProfile {
    id?: number | null;
    name?: string | null;
    role?: string | null;
    tendik_role?: TendikReviewerRole | null;
}

export type ValidationErrors = Record<string, string[]>;
