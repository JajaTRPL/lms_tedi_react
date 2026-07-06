import type {
    Room,
    RoomManagementPayload,
    RoomType,
    ValidationErrors,
} from '../../mahasiswa/peminjaman/types';

export interface RoomFormValues {
    code: string;
    name: string;
    type: RoomType | '';
    capacity: string;
    location: string;
    description: string;
    owningLaboratoryId: string;
}

export type RoomFormErrors = Partial<Record<keyof RoomFormValues | 'form', string>>;

export const emptyRoomForm = (): RoomFormValues => ({
    code: '',
    name: '',
    type: '',
    capacity: '',
    location: '',
    description: '',
    owningLaboratoryId: '',
});

export const roomToFormValues = (room: Room): RoomFormValues => ({
    code: room.code,
    name: room.name,
    type: room.type,
    capacity: String(room.capacity),
    location: room.location,
    description: room.description ?? '',
    owningLaboratoryId: room.owning_laboratory
        ? String(room.owning_laboratory.id)
        : '',
});

export const validateRoomForm = (values: RoomFormValues): RoomFormErrors => {
    const errors: RoomFormErrors = {};
    const capacity = Number(values.capacity);

    if (!values.code.trim()) errors.code = 'Kode ruangan wajib diisi.';
    if (!values.name.trim()) errors.name = 'Nama ruangan wajib diisi.';
    if (!values.type) errors.type = 'Jenis ruangan wajib dipilih.';
    if (!values.capacity.trim()) {
        errors.capacity = 'Kapasitas ruangan wajib diisi.';
    } else if (!Number.isInteger(capacity) || capacity < 1) {
        errors.capacity = 'Kapasitas harus berupa bilangan bulat positif.';
    }
    if (!values.location.trim()) errors.location = 'Lokasi ruangan wajib diisi.';
    if (values.type === 'laboratory' && !values.owningLaboratoryId) {
        errors.owningLaboratoryId = 'Laboratorium pemilik wajib dipilih.';
    }

    return errors;
};

export const roomFormToPayload = (
    values: RoomFormValues,
): RoomManagementPayload => ({
    code: values.code.trim(),
    name: values.name.trim(),
    type: values.type as RoomType,
    capacity: Number(values.capacity),
    location: values.location.trim(),
    description: values.description.trim() || null,
    owning_laboratory_id: values.type === 'laboratory'
        ? Number(values.owningLaboratoryId)
        : null,
});

export const mapRoomValidationErrors = (
    errors?: ValidationErrors,
): RoomFormErrors => {
    const result: RoomFormErrors = {};
    const aliases: Record<string, keyof RoomFormValues> = {
        code: 'code',
        name: 'name',
        type: 'type',
        capacity: 'capacity',
        location: 'location',
        description: 'description',
        owning_laboratory_id: 'owningLaboratoryId',
    };

    Object.entries(errors ?? {}).forEach(([field, messages]) => {
        const target = aliases[field];
        if (target && messages[0]) result[target] = messages[0];
    });
    return result;
};
