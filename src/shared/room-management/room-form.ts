import { PeminjamanApiError } from '../../mahasiswa/peminjaman/api';
import { createManagedRoom, updateManagedRoom } from './api';
import { escapeHtml } from './utils';
import type {
    ManagedLaboratory,
    ManagedRoom,
    ManagedRoomType,
    RoomInfoPayload,
    RoomManagementValidationErrors,
} from './types';

interface RoomFormValues {
    code: string;
    name: string;
    type: ManagedRoomType | '';
    capacity: string;
    location: string;
    description: string;
    rules: string;
    owningLaboratoryId: string;
}

type RoomFormErrors = Partial<Record<keyof RoomFormValues | 'form', string>>;

export interface RoomFormOptions {
    mode: 'create' | 'edit';
    room?: ManagedRoom;
    laboratories: ManagedLaboratory[];
    /** Room types the current user may create (create mode only). */
    allowedTypes: ManagedRoomType[];
    onSaved: (room: ManagedRoom) => void;
}

const ROOT_ID = 'room-form-modal-root';

let escapeHandler: ((event: KeyboardEvent) => void) | null = null;

const emptyValues = (allowedTypes: ManagedRoomType[]): RoomFormValues => ({
    code: '',
    name: '',
    type: allowedTypes.length === 1 ? allowedTypes[0] : '',
    capacity: '',
    location: '',
    description: '',
    rules: '',
    owningLaboratoryId: '',
});

const roomToValues = (room: ManagedRoom): RoomFormValues => ({
    code: room.code,
    name: room.name,
    type: room.type,
    capacity: String(room.capacity),
    location: room.location,
    description: room.description ?? '',
    rules: room.rules ?? '',
    owningLaboratoryId: room.owning_laboratory ? String(room.owning_laboratory.id) : '',
});

const validate = (values: RoomFormValues): RoomFormErrors => {
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

const toPayload = (values: RoomFormValues): RoomInfoPayload => ({
    code: values.code.trim(),
    name: values.name.trim(),
    type: values.type as ManagedRoomType,
    capacity: Number(values.capacity),
    location: values.location.trim(),
    description: values.description.trim() || null,
    rules: values.rules.trim() || null,
    owning_laboratory_id: values.type === 'laboratory' ? Number(values.owningLaboratoryId) : null,
});

const mapServerErrors = (errors?: RoomManagementValidationErrors): RoomFormErrors => {
    const result: RoomFormErrors = {};
    const aliases: Record<string, keyof RoomFormValues> = {
        code: 'code',
        name: 'name',
        type: 'type',
        capacity: 'capacity',
        location: 'location',
        description: 'description',
        rules: 'rules',
        owning_laboratory_id: 'owningLaboratoryId',
    };
    Object.entries(errors ?? {}).forEach(([field, messages]) => {
        const target = aliases[field];
        if (target && messages[0]) result[target] = messages[0];
    });
    return result;
};

const selected = (actual: unknown, expected: unknown): string =>
    actual === expected ? 'selected' : '';

export const closeRoomFormModal = (): void => {
    document.getElementById(ROOT_ID)?.remove();
    if (escapeHandler) {
        document.removeEventListener('keydown', escapeHandler);
        escapeHandler = null;
    }
};

export const openRoomFormModal = (options: RoomFormOptions): void => {
    closeRoomFormModal();
    const root = document.createElement('div');
    root.id = ROOT_ID;
    document.body.appendChild(root);

    const isEdit = options.mode === 'edit';
    // Type is fixed on edit (ownership invariants); on create it is limited to
    // the user's allowed types.
    const lockType = isEdit;
    let values = isEdit && options.room ? roomToValues(options.room) : emptyValues(options.allowedTypes);
    let errors: RoomFormErrors = {};
    let submitting = false;

    const readForm = (): RoomFormValues => ({
        code: (root.querySelector('#room-form-code') as HTMLInputElement | null)?.value ?? '',
        name: (root.querySelector('#room-form-name') as HTMLInputElement | null)?.value ?? '',
        type: ((root.querySelector('#room-form-type') as HTMLSelectElement | null)?.value ?? values.type) as ManagedRoomType | '',
        capacity: (root.querySelector('#room-form-capacity') as HTMLInputElement | null)?.value ?? '',
        location: (root.querySelector('#room-form-location') as HTMLInputElement | null)?.value ?? '',
        description: (root.querySelector('#room-form-description') as HTMLTextAreaElement | null)?.value ?? '',
        rules: (root.querySelector('#room-form-rules') as HTMLTextAreaElement | null)?.value ?? '',
        owningLaboratoryId: (root.querySelector('#room-form-laboratory') as HTMLSelectElement | null)?.value ?? '',
    });

    const fieldError = (field: keyof RoomFormValues): string =>
        errors[field]
            ? `<p class="mt-1 text-xs font-semibold text-red-700">${escapeHtml(errors[field])}</p>`
            : '';

    const render = (): void => {
        const canLab = options.allowedTypes.includes('laboratory') || (isEdit && values.type === 'laboratory');
        root.innerHTML = `
            <div data-room-form-overlay class="fixed inset-0 z-[220] bg-black/50"></div>
            <section role="dialog" aria-modal="true" aria-labelledby="room-form-title" class="fixed left-1/2 top-1/2 z-[221] max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                <div class="flex items-start justify-between gap-4">
                    <h2 id="room-form-title" class="text-xl font-bold text-gray-900">${isEdit ? 'Edit Ruangan' : 'Tambah Ruangan'}</h2>
                    <button id="close-room-form" type="button" class="rounded-lg p-2 text-gray-400 hover:bg-gray-100" aria-label="Tutup formulir">×</button>
                </div>
                <form id="room-form" class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label class="text-sm font-bold text-gray-700">
                        Kode Ruangan
                        <input id="room-form-code" maxlength="100" value="${escapeHtml(values.code)}" class="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal" ${submitting ? 'disabled' : ''}>
                        ${fieldError('code')}
                    </label>
                    <label class="text-sm font-bold text-gray-700">
                        Nama Ruangan
                        <input id="room-form-name" maxlength="255" value="${escapeHtml(values.name)}" class="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal" ${submitting ? 'disabled' : ''}>
                        ${fieldError('name')}
                    </label>
                    <label class="text-sm font-bold text-gray-700">
                        Jenis Ruangan
                        <select id="room-form-type" class="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal" ${submitting || lockType ? 'disabled' : ''}>
                            ${lockType ? '' : '<option value="">Pilih jenis</option>'}
                            ${options.allowedTypes.includes('classroom') || (isEdit && values.type === 'classroom') ? `<option value="classroom" ${selected(values.type, 'classroom')}>Ruang Kelas</option>` : ''}
                            ${canLab ? `<option value="laboratory" ${selected(values.type, 'laboratory')}>Laboratorium</option>` : ''}
                        </select>
                        ${lockType ? '<p class="mt-1 text-[11px] text-gray-400">Jenis ruangan tidak dapat diubah setelah dibuat.</p>' : ''}
                        ${fieldError('type')}
                    </label>
                    <label class="text-sm font-bold text-gray-700">
                        Kapasitas
                        <input id="room-form-capacity" type="number" min="1" step="1" value="${escapeHtml(values.capacity)}" class="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal" ${submitting ? 'disabled' : ''}>
                        ${fieldError('capacity')}
                    </label>
                    <label class="text-sm font-bold text-gray-700 sm:col-span-2">
                        Lokasi
                        <input id="room-form-location" maxlength="255" value="${escapeHtml(values.location)}" class="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal" ${submitting ? 'disabled' : ''}>
                        ${fieldError('location')}
                    </label>
                    ${values.type === 'laboratory' ? `
                        <label class="text-sm font-bold text-gray-700 sm:col-span-2">
                            Laboratorium Pemilik
                            <select id="room-form-laboratory" class="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal" ${submitting || (isEdit && lockType) ? 'disabled' : ''}>
                                <option value="">${options.laboratories.length > 0 ? 'Pilih laboratorium' : 'Belum ada data laboratorium'}</option>
                                ${options.laboratories.map((lab) => `<option value="${lab.id}" ${selected(values.owningLaboratoryId, String(lab.id))}>${escapeHtml(lab.code)} · ${escapeHtml(lab.name)}</option>`).join('')}
                            </select>
                            ${isEdit ? '<p class="mt-1 text-[11px] text-gray-400">Laboratorium pemilik tidak dapat diubah setelah dibuat.</p>' : ''}
                            ${fieldError('owningLaboratoryId')}
                        </label>
                    ` : ''}
                    <label class="text-sm font-bold text-gray-700 sm:col-span-2">
                        Deskripsi
                        <textarea id="room-form-description" rows="3" maxlength="5000" class="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal" ${submitting ? 'disabled' : ''}>${escapeHtml(values.description)}</textarea>
                    </label>
                    <label class="text-sm font-bold text-gray-700 sm:col-span-2">
                        Tata Tertib Ruangan
                        <textarea id="room-form-rules" rows="3" maxlength="5000" placeholder="Aturan penggunaan ruangan yang ditampilkan ke mahasiswa." class="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal" ${submitting ? 'disabled' : ''}>${escapeHtml(values.rules)}</textarea>
                    </label>
                    ${errors.form ? `<p role="alert" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:col-span-2">${escapeHtml(errors.form)}</p>` : ''}
                    <div class="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
                        <button id="cancel-room-form" type="button" ${submitting ? 'disabled' : ''} class="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 disabled:opacity-50">Batal</button>
                        <button type="submit" ${submitting ? 'disabled' : ''} class="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60">${submitting ? 'Menyimpan...' : 'Simpan Ruangan'}</button>
                    </div>
                </form>
            </section>
        `;

        const close = (): void => { if (!submitting) closeRoomFormModal(); };
        root.querySelector('[data-room-form-overlay]')?.addEventListener('click', close);
        root.querySelector('#close-room-form')?.addEventListener('click', close);
        root.querySelector('#cancel-room-form')?.addEventListener('click', close);
        root.querySelector('#room-form-type')?.addEventListener('change', () => {
            values = readForm();
            if (values.type !== 'laboratory') values.owningLaboratoryId = '';
            errors = {};
            render();
        });
        root.querySelector('#room-form')?.addEventListener('submit', async (event) => {
            event.preventDefault();
            values = readForm();
            errors = validate(values);
            if (Object.keys(errors).length > 0) { render(); return; }
            submitting = true;
            render();
            try {
                const saved = isEdit && options.room
                    ? await updateManagedRoom(options.room.id, toPayload(values))
                    : await createManagedRoom(toPayload(values));
                closeRoomFormModal();
                options.onSaved(saved);
            } catch (error) {
                submitting = false;
                errors = error instanceof PeminjamanApiError && error.status === 422
                    ? mapServerErrors(error.errors)
                    : {};
                if (Object.keys(errors).length === 0) {
                    errors.form = error instanceof Error ? error.message : 'Ruangan gagal disimpan.';
                }
                render();
            }
        });
        root.querySelector<HTMLInputElement>('#room-form-code')?.focus();
    };

    escapeHandler = (event: KeyboardEvent): void => {
        if (event.key === 'Escape' && !submitting) closeRoomFormModal();
    };
    document.addEventListener('keydown', escapeHandler);
    render();
};
