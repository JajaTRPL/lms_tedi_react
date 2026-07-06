import { describe, expect, it } from 'vitest';
import {
    emptyRoomForm,
    roomFormToPayload,
    validateRoomForm,
} from '../room-form';

describe('Super Admin room form rules', () => {
    it('requires core room fields and a positive capacity', () => {
        const errors = validateRoomForm(emptyRoomForm());

        expect(errors).toMatchObject({
            code: expect.any(String),
            name: expect.any(String),
            type: expect.any(String),
            capacity: expect.any(String),
            location: expect.any(String),
        });
    });

    it('does not require a laboratory owner for classroom rooms', () => {
        const errors = validateRoomForm({
            code: 'KLS-01',
            name: 'Ruang Kelas',
            type: 'classroom',
            capacity: '30',
            location: 'Gedung',
            description: '',
            owningLaboratoryId: '',
        });

        expect(errors.owningLaboratoryId).toBeUndefined();
        expect(roomFormToPayload({
            code: ' KLS-01 ',
            name: ' Ruang Kelas ',
            type: 'classroom',
            capacity: '30',
            location: ' Gedung ',
            description: '',
            owningLaboratoryId: '9',
        }).owning_laboratory_id).toBeNull();
    });

    it('requires and serializes a laboratory owner for laboratory rooms', () => {
        const values = {
            code: 'LAB-01',
            name: 'Laboratorium',
            type: 'laboratory' as const,
            capacity: '20',
            location: 'Gedung Lab',
            description: 'Ruang praktikum',
            owningLaboratoryId: '',
        };

        expect(validateRoomForm(values).owningLaboratoryId).toContain('wajib');
        expect(roomFormToPayload({
            ...values,
            owningLaboratoryId: '7',
        }).owning_laboratory_id).toBe(7);
    });
});
