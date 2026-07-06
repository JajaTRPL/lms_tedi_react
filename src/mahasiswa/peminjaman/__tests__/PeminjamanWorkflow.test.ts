import { describe, expect, it } from 'vitest';
import {
    bookingFormToPayload,
    canCancelBooking,
    canEditBooking,
    canResubmitBooking,
    emptyBookingFormValues,
    validateBookingForm,
} from '../workflow';
import type {
    MahasiswaBooking,
    Room,
} from '../types';

const room: Room = {
    id: 7,
    code: 'API-KLS-07',
    name: 'Ruang Validasi',
    type: 'classroom',
    capacity: 20,
    location: 'Gedung Uji',
    description: null,
    is_active: true,
    owning_laboratory: null,
};

const validValues = {
    roomId: String(room.id),
    date: '2026-06-20',
    startTime: '10:00',
    endTime: '12:00',
    activityName: 'Rapat Organisasi',
    purpose: 'Koordinasi kegiatan.',
    participantCount: '10',
};

const booking = (
    status: MahasiswaBooking['status'],
    startAt = '2026-06-20T10:00:00+07:00',
): MahasiswaBooking => ({
    id: 11,
    room,
    activity_name: 'Rapat Organisasi',
    purpose: 'Koordinasi kegiatan.',
    participant_count: 10,
    start_at: startAt,
    end_at: '2026-06-20T12:00:00+07:00',
    status,
    reviewer: null,
    reviewed_at: null,
    revision_note: null,
    rejection_reason: null,
    cancellation_reason: null,
    created_at: '2026-06-18T09:00:00+07:00',
    updated_at: '2026-06-18T09:00:00+07:00',
});

describe('Peminjaman booking workflow rules', () => {
    it('builds the backend payload with an explicit Jakarta offset', () => {
        expect(bookingFormToPayload(validValues)).toEqual({
            room_id: room.id,
            activity_name: 'Rapat Organisasi',
            purpose: 'Koordinasi kegiatan.',
            participant_count: 10,
            start_at: '2026-06-20T10:00:00+07:00',
            end_at: '2026-06-20T12:00:00+07:00',
        });
    });

    it('blocks participant counts above selected room capacity', () => {
        const errors = validateBookingForm(
            { ...validValues, participantCount: '21' },
            [room],
            '2026-06-18',
        );

        expect(errors.participantCount).toContain('kapasitas 20');
    });

    it.each([
        ['same time', '10:00', '10:00', 'tidak boleh sama'],
        ['reversed time', '12:00', '10:00', 'lebih dari jam mulai'],
        ['cross-midnight attempt', '23:00', '01:00', 'masih di hari yang sama'],
    ])('blocks %s', (_label, startTime, endTime, message) => {
        const errors = validateBookingForm(
            { ...validValues, startTime, endTime },
            [room],
            '2026-06-18',
        );

        expect(errors.endTime).toContain(message);
    });

    it('allows edit and resubmit only for revision requests', () => {
        expect(canEditBooking(booking('revision_requested'))).toBe(true);
        expect(canResubmitBooking(booking('revision_requested'))).toBe(true);
        expect(canEditBooking(booking('submitted'))).toBe(false);
        expect(canResubmitBooking(booking('approved'))).toBe(false);
    });

    it('allows cancellation for submitted, revision, and future approved requests only', () => {
        const now = new Date('2026-06-18T02:00:00Z');
        expect(canCancelBooking(booking('submitted'), now)).toBe(true);
        expect(canCancelBooking(booking('revision_requested'), now)).toBe(true);
        expect(canCancelBooking(booking('approved'), now)).toBe(true);
        expect(canCancelBooking(
            booking('approved', '2026-06-18T09:00:00+07:00'),
            now,
        )).toBe(false);
        expect(canCancelBooking(booking('rejected'), now)).toBe(false);
        expect(canCancelBooking(booking('cancelled'), now)).toBe(false);
    });

    it('provides an empty form model for fresh requests', () => {
        expect(emptyBookingFormValues('7', '2026-06-20')).toMatchObject({
            roomId: '7',
            date: '2026-06-20',
            activityName: '',
            purpose: '',
        });
    });
});
