import {
    formatIsoDateKeyInJakarta,
} from '../../shared/peminjaman-calendar';
import type {
    BookingPayload,
    MahasiswaBooking,
    Room,
} from './types';

export interface BookingFormValues {
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    activityName: string;
    purpose: string;
    participantCount: string;
}

export type BookingFormErrors = Partial<Record<keyof BookingFormValues | 'form', string>>;

export const emptyBookingFormValues = (
    roomId = '',
    date = '',
): BookingFormValues => ({
    roomId,
    date,
    startTime: '',
    endTime: '',
    activityName: '',
    purpose: '',
    participantCount: '',
});

const jakartaTimeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
});

export const bookingToFormValues = (
    booking: MahasiswaBooking,
): BookingFormValues => ({
    roomId: String(booking.room.id),
    date: formatIsoDateKeyInJakarta(booking.start_at),
    startTime: jakartaTimeFormatter.format(new Date(booking.start_at)),
    endTime: jakartaTimeFormatter.format(new Date(booking.end_at)),
    activityName: booking.activity_name,
    purpose: booking.purpose,
    participantCount: String(booking.participant_count),
});

export const validateBookingForm = (
    values: BookingFormValues,
    rooms: readonly Room[],
    todayKey: string,
): BookingFormErrors => {
    const errors: BookingFormErrors = {};
    const selectedRoom = rooms.find((room) => String(room.id) === values.roomId);
    const participants = Number(values.participantCount);

    if (!selectedRoom) errors.roomId = 'Pilih ruangan aktif.';
    if (!values.date) {
        errors.date = 'Tanggal peminjaman wajib diisi.';
    } else if (values.date < todayKey) {
        errors.date = 'Tanggal peminjaman tidak boleh sudah lewat.';
    }
    if (!values.startTime) errors.startTime = 'Waktu mulai wajib diisi.';
    if (!values.endTime) errors.endTime = 'Waktu selesai wajib diisi.';
    if (!values.activityName.trim()) errors.activityName = 'Nama kegiatan wajib diisi.';
    if (!values.purpose.trim()) errors.purpose = 'Tujuan peminjaman wajib diisi.';

    if (!Number.isInteger(participants) || participants < 1) {
        errors.participantCount = 'Jumlah peserta minimal 1 orang.';
    } else if (selectedRoom && participants > selectedRoom.capacity) {
        errors.participantCount = `Jumlah peserta melebihi kapasitas ${selectedRoom.capacity} orang.`;
    }

    if (values.startTime && values.endTime) {
        if (values.startTime === values.endTime) {
            errors.endTime = 'Waktu mulai dan selesai tidak boleh sama.';
        } else if (values.endTime < values.startTime) {
            errors.endTime = 'Jam selesai harus lebih dari jam mulai dan masih di hari yang sama.';
        }
    }

    return errors;
};

const jakartaOffsetIso = (date: string, time: string): string =>
    `${date}T${time}:00+07:00`;

export const bookingFormToPayload = (
    values: BookingFormValues,
): BookingPayload => ({
    room_id: Number(values.roomId),
    activity_name: values.activityName.trim(),
    purpose: values.purpose.trim(),
    participant_count: Number(values.participantCount),
    start_at: jakartaOffsetIso(values.date, values.startTime),
    end_at: jakartaOffsetIso(values.date, values.endTime),
});

export const canEditBooking = (booking: MahasiswaBooking): boolean =>
    booking.status === 'revision_requested';

export const canResubmitBooking = canEditBooking;

// ── Surat peminjaman PDF (uploaded, never generated) ───────────────────────
export const MAX_SURAT_PDF_BYTES = 5 * 1024 * 1024;

/**
 * Client-side PDF guard — UX help only; the backend remains the source of
 * truth. Returns an Indonesian error message or null when the file is valid.
 */
export const validateSuratPdfFile = (file: File | null): string | null => {
    if (!file) return 'Surat peminjaman (PDF) wajib diunggah.';
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    if (!isPdf) return 'Berkas harus berupa PDF.';
    if (file.size > MAX_SURAT_PDF_BYTES) return 'Ukuran berkas melebihi 5 MB.';
    return null;
};

/** Replacing the uploaded surat is only allowed while a revision is requested. */
export const canReplaceSuratPdf = (booking: MahasiswaBooking): boolean =>
    booking.status === 'revision_requested';

/** True when the API reports an uploaded surat PDF; safe for legacy rows. */
export const hasSuratPeminjamanPdf = (booking: MahasiswaBooking): boolean => {
    const meta = booking.surat_peminjaman_pdf;
    return Boolean(meta && (meta.exists ?? meta.has_surat_peminjaman_pdf));
};

export const formatFileSize = (bytes: number | null | undefined): string => {
    if (!bytes || bytes <= 0) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const canCancelBooking = (
    booking: MahasiswaBooking,
    now = new Date(),
): boolean => {
    if (booking.status === 'submitted' || booking.status === 'revision_requested') {
        return true;
    }

    return booking.status === 'approved'
        && new Date(booking.start_at).getTime() > now.getTime();
};
