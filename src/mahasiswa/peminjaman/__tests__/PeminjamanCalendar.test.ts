import { describe, expect, it } from 'vitest';
import {
    countApprovedByFilter,
    getDayAvailability,
    getDensityBucket,
    normalizeAvailabilityByDate,
} from '../../../shared/peminjaman-calendar';
import type { AvailabilityItem } from '../types';

const availability = (
    bookingId: number,
    type: 'classroom' | 'laboratory',
    status: AvailabilityItem['status'],
    startAt: string,
): AvailabilityItem => ({
    booking_id: bookingId,
    room: {
        id: bookingId,
        code: `API-${bookingId}`,
        name: `API Room ${bookingId}`,
        type,
    },
    start_at: startAt,
    end_at: '2026-06-20T12:00:00+07:00',
    status,
});

describe('Peminjaman calendar normalization', () => {
    it('normalizes API arrays into Asia/Jakarta date-indexed items', () => {
        const indexed = normalizeAvailabilityByDate([
            availability(1, 'classroom', 'approved', '2026-06-19T18:00:00Z'),
            availability(2, 'laboratory', 'approved', '2026-06-20T13:00:00+07:00'),
        ]);

        expect(indexed.get('2026-06-20')?.map((item) => item.booking_id))
            .toEqual([1, 2]);
    });

    it('counts only approved bookings for calendar density', () => {
        const items = [
            availability(1, 'classroom', 'approved', '2026-06-20T08:00:00+07:00'),
            availability(2, 'classroom', 'submitted', '2026-06-20T10:00:00+07:00'),
            availability(3, 'laboratory', 'revision_requested', '2026-06-20T13:00:00+07:00'),
        ];

        expect(countApprovedByFilter(items, 'all')).toBe(1);
        expect(getDensityBucket(countApprovedByFilter(items, 'all'))).toBe('low');
    });

    it('applies the same room-type filter to density and daily items', () => {
        const items = [
            availability(1, 'classroom', 'approved', '2026-06-20T08:00:00+07:00'),
            availability(2, 'laboratory', 'approved', '2026-06-20T10:00:00+07:00'),
            availability(3, 'laboratory', 'cancelled', '2026-06-20T13:00:00+07:00'),
        ];
        const indexed = normalizeAvailabilityByDate(items);

        expect(countApprovedByFilter(items, 'classroom')).toBe(1);
        expect(getDayAvailability(indexed, '2026-06-20', 'classroom')
            .map((item) => item.booking_id)).toEqual([1]);

        expect(countApprovedByFilter(items, 'laboratory')).toBe(1);
        expect(getDayAvailability(indexed, '2026-06-20', 'laboratory')
            .map((item) => item.booking_id)).toEqual([2]);
    });
});
