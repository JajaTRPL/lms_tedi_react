// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
    apiFetch: vi.fn(),
}));

vi.mock('../../../shared/api-client', () => ({
    apiFetch: m.apiFetch,
}));

import {
    cancelMahasiswaBooking,
    createMahasiswaBooking,
    downloadSuratPeminjamanPdf,
    getMahasiswaBooking,
    getMahasiswaBookings,
    getPeminjamanAvailability,
    getPeminjamanRooms,
    replaceSuratPeminjamanPdf,
    resubmitMahasiswaBooking,
    suratPeminjamanDownloadUrl,
    suratPeminjamanPreviewUrl,
    updateMahasiswaBooking,
    PeminjamanApiError,
} from '../api';
import apiSource from '../api.ts?raw';

const jsonResponse = (payload: unknown, status = 200): Response =>
    new Response(JSON.stringify(payload), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

const pdfFile = (name = 'surat.pdf'): File =>
    new File(['%PDF-1.4 test'], name, { type: 'application/pdf' });

const payload = {
    room_id: 4,
    activity_name: 'Pengujian API',
    purpose: 'Pengujian kontrak frontend.',
    participant_count: 8,
    start_at: '2026-06-20T10:00:00+07:00',
    end_at: '2026-06-20T12:00:00+07:00',
};

beforeEach(() => {
    m.apiFetch.mockReset();
    m.apiFetch.mockResolvedValue(jsonResponse({ message: 'ok', count: 0, data: [] }));
});

describe('Peminjaman Mahasiswa API module', () => {
    it('uses relative /api endpoints for rooms, availability, and request listing', async () => {
        await getPeminjamanRooms();
        await getPeminjamanAvailability({
            from: '2026-06-01',
            to: '2026-06-30',
            roomId: 17,
            type: 'laboratory',
        });
        await getMahasiswaBookings();

        expect(m.apiFetch).toHaveBeenNthCalledWith(1, '/api/mahasiswa/peminjaman-ruangan/rooms');
        expect(m.apiFetch).toHaveBeenNthCalledWith(
            2,
            '/api/mahasiswa/peminjaman-ruangan/availability?from=2026-06-01&to=2026-06-30&room_id=17&type=laboratory',
        );
        expect(m.apiFetch).toHaveBeenNthCalledWith(3, '/api/mahasiswa/peminjaman-ruangan/requests');
    });

    it('sends create as multipart FormData with all fields plus the surat PDF', async () => {
        const file = pdfFile();
        await createMahasiswaBooking(payload, file);

        const [url, options] = m.apiFetch.mock.calls[0];
        expect(url).toBe('/api/mahasiswa/peminjaman-ruangan/requests');
        expect(options.method).toBe('POST');
        expect(options.isFormData).toBe(true);
        expect(options.body).toBeInstanceOf(FormData);
        const body = options.body as FormData;
        expect(body.get('room_id')).toBe('4');
        expect(body.get('activity_name')).toBe('Pengujian API');
        expect(body.get('participant_count')).toBe('8');
        expect(body.get('start_at')).toBe('2026-06-20T10:00:00+07:00');
        expect(body.get('surat_peminjaman_pdf')).toBe(file);
        // No JSON body / Content-Type is set for uploads (browser sets boundary).
        expect(typeof options.body).not.toBe('string');
    });

    it('keeps the normal PUT edit file-free (JSON body)', async () => {
        await updateMahasiswaBooking(9, payload);
        await resubmitMahasiswaBooking(9);
        await cancelMahasiswaBooking(9, 'Kegiatan dibatalkan.');
        await getMahasiswaBooking(9);

        expect(m.apiFetch.mock.calls[0]).toEqual([
            '/api/mahasiswa/peminjaman-ruangan/requests/9',
            { method: 'PUT', body: JSON.stringify(payload) },
        ]);
        expect(m.apiFetch.mock.calls[1]).toEqual([
            '/api/mahasiswa/peminjaman-ruangan/requests/9/submit',
            { method: 'PATCH' },
        ]);
        expect(m.apiFetch.mock.calls[2]).toEqual([
            '/api/mahasiswa/peminjaman-ruangan/requests/9/cancel',
            { method: 'PATCH', body: JSON.stringify({ reason: 'Kegiatan dibatalkan.' }) },
        ]);
        expect(m.apiFetch.mock.calls[3]).toEqual(['/api/mahasiswa/peminjaman-ruangan/requests/9']);
    });

    it('replaces the surat via the dedicated multipart attachment route', async () => {
        m.apiFetch.mockResolvedValueOnce(jsonResponse({ message: 'ok', data: { id: 9 } }));
        const file = pdfFile('revisi.pdf');
        await replaceSuratPeminjamanPdf(9, file);

        const [url, options] = m.apiFetch.mock.calls[0];
        expect(url).toBe('/api/mahasiswa/peminjaman-ruangan/9/attachment/surat-peminjaman');
        expect(options.method).toBe('POST');
        expect(options.isFormData).toBe(true);
        expect((options.body as FormData).get('surat_peminjaman_pdf')).toBe(file);
    });

    it('builds protected preview/download URLs from the booking id only', () => {
        expect(suratPeminjamanPreviewUrl(9))
            .toBe('/api/peminjaman-ruangan/9/attachment/surat-peminjaman/preview');
        expect(suratPeminjamanDownloadUrl(9))
            .toBe('/api/peminjaman-ruangan/9/attachment/surat-peminjaman/download');
    });

    it('downloads the surat via the protected route as an authenticated blob', async () => {
        const createObjectURL = vi.fn(() => 'blob:surat');
        const revokeObjectURL = vi.fn();
        (URL as any).createObjectURL = createObjectURL;
        (URL as any).revokeObjectURL = revokeObjectURL;
        m.apiFetch.mockResolvedValueOnce(new Response(
            new Blob(['%PDF'], { type: 'application/pdf' }),
            { status: 200 },
        ));

        await downloadSuratPeminjamanPdf(9, 'surat.pdf');

        expect(m.apiFetch).toHaveBeenCalledWith(
            '/api/peminjaman-ruangan/9/attachment/surat-peminjaman/download',
            expect.objectContaining({ cache: 'no-store' }),
        );
        expect(createObjectURL).toHaveBeenCalled();
        expect(revokeObjectURL).toHaveBeenCalled();
    });

    it('maps download 403/404 to a user-facing message', async () => {
        m.apiFetch.mockResolvedValueOnce(new Response('', { status: 403 }));
        await expect(downloadSuratPeminjamanPdf(9)).rejects.toThrow('Anda tidak berwenang mengunduh surat ini.');

        m.apiFetch.mockResolvedValueOnce(new Response('', { status: 404 }));
        await expect(downloadSuratPeminjamanPdf(9)).rejects.toThrow('Surat peminjaman tidak ditemukan.');
    });

    it('surfaces the backend message for non-success responses', async () => {
        m.apiFetch.mockResolvedValueOnce(jsonResponse({ message: 'Rentang tanggal tidak valid.' }, 422));

        await expect(getPeminjamanAvailability({
            from: '2026-06-30',
            to: '2026-06-01',
        })).rejects.toThrow('Rentang tanggal tidak valid.');
    });

    it('preserves backend status, code, and validation fields', async () => {
        m.apiFetch.mockResolvedValueOnce(jsonResponse({
            message: 'Validasi gagal.',
            code: 'booking_conflict',
            errors: { participant_count: ['Jumlah peserta terlalu besar.'] },
            data: { conflicts: [{ booking_id: 1 }] },
        }, 409));

        const error = await getPeminjamanAvailability({
            from: '2026-06-20',
            to: '2026-06-20',
        }).catch((reason: unknown) => reason);

        expect(error).toBeInstanceOf(PeminjamanApiError);
        expect(error).toMatchObject({
            status: 409,
            code: 'booking_conflict',
            errors: { participant_count: ['Jumlah peserta terlalu besar.'] },
        });
    });

    it('never targets a legacy route or a raw storage URL', () => {
        expect(apiSource).not.toContain('VITE_API_BASE_URL');
        expect(apiSource).not.toContain('localhost');
        expect(apiSource).not.toContain('/api/room-bookings');
        expect(apiSource).not.toContain('/storage');
        expect(apiSource).toContain('/api/mahasiswa/peminjaman-ruangan');
        expect(apiSource).toContain('/attachment/surat-peminjaman');
    });
});
