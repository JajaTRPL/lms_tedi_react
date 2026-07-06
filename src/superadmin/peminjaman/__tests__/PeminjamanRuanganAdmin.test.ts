// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
    getLabs: vi.fn(),
    getRooms: vi.fn(),
    getRoom: vi.fn(),
    createRoom: vi.fn(),
    updateRoom: vi.fn(),
    activateRoom: vi.fn(),
    deactivateRoom: vi.fn(),
    getBookings: vi.fn(),
    getBooking: vi.fn(),
    downloadSurat: vi.fn(),
    attachViewer: vi.fn(() => () => {}),
    renderLayout: vi.fn(),
    toasts: [] as string[],
}));

vi.mock('../../../dashboard/DashboardLayout', () => ({
    renderDashboardLayout: (
        title: string,
        content: string,
        role: string,
        activePage: string,
    ) => {
        m.renderLayout(title, content, role, activePage);
        document.body.innerHTML = content;
    },
}));

vi.mock('../../../mahasiswa/peminjaman/api', () => {
    class MockPeminjamanApiError extends Error {
        readonly status: number;
        readonly code?: string;
        readonly errors?: Record<string, string[]>;

        constructor(
            message: string,
            status: number,
            code?: string,
            errors?: Record<string, string[]>,
        ) {
            super(message);
            this.status = status;
            this.code = code;
            this.errors = errors;
        }
    }

    return {
        getSuperAdminLaboratories: m.getLabs,
        getSuperAdminRooms: m.getRooms,
        getSuperAdminRoom: m.getRoom,
        createSuperAdminRoom: m.createRoom,
        updateSuperAdminRoom: m.updateRoom,
        activateSuperAdminRoom: m.activateRoom,
        deactivateSuperAdminRoom: m.deactivateRoom,
        getSuperAdminBookings: m.getBookings,
        getSuperAdminBooking: m.getBooking,
        // Requester-side exports pulled in transitively via the shared
        // booking detail/form modules — not exercised by the admin page.
        getMahasiswaBooking: vi.fn(),
        getPeminjamanRooms: vi.fn(),
        createMahasiswaBooking: vi.fn(),
        updateMahasiswaBooking: vi.fn(),
        cancelMahasiswaBooking: vi.fn(),
        resubmitMahasiswaBooking: vi.fn(),
        replaceSuratPeminjamanPdf: vi.fn(),
        downloadSuratPeminjamanPdf: m.downloadSurat,
        suratPeminjamanPreviewUrl: (id: number) =>
            `/api/peminjaman-ruangan/${id}/attachment/surat-peminjaman/preview`,
        PeminjamanApiError: MockPeminjamanApiError,
    };
});

vi.mock('../../../shared/protected-pdf-viewer', () => ({
    renderProtectedPdfViewer: () => '<div data-protected-pdf-viewer></div>',
    attachProtectedPdfViewer: m.attachViewer,
}));

vi.mock('toastify-js', () => ({
    default: vi.fn((options: { text: string }) => ({
        showToast: () => m.toasts.push(options.text),
    })),
}));

import { PeminjamanApiError } from '../../../mahasiswa/peminjaman/api';
import type {
    Room,
    SuperAdminBooking,
} from '../../../mahasiswa/peminjaman/types';
import { renderPeminjamanRuanganAdmin } from '../../PeminjamanRuanganAdmin';
import pageSource from '../../PeminjamanRuanganAdmin.ts?raw';

const labs = [
    { id: 7, code: 'LAB-UJI', name: 'Laboratorium <script>uji</script>' },
];

const room = (overrides: Partial<Room> = {}): Room => ({
    id: 12,
    code: 'ROOM-12',
    name: 'Ruang <img src=x onerror=unsafe()>',
    type: 'classroom',
    capacity: 30,
    location: 'Gedung <script>unsafe()</script>',
    description: 'Deskripsi aman.',
    is_active: true,
    owning_laboratory: null,
    ...overrides,
});

const booking = (overrides: Partial<SuperAdminBooking> = {}): SuperAdminBooking => ({
    id: 44,
    room: room(),
    requester: {
        id: 20,
        name: 'Pemohon <script>unsafe()</script>',
        email: 'pemohon@example.test',
    },
    activity_name: 'Kegiatan <img src=x onerror=unsafe()>',
    purpose: 'Tujuan <script>unsafe()</script>',
    participant_count: 20,
    start_at: '2026-06-25T09:00:00+07:00',
    end_at: '2026-06-25T11:00:00+07:00',
    status: 'submitted',
    reviewer: null,
    reviewed_at: null,
    revision_note: null,
    rejection_reason: null,
    cancellation_reason: null,
    created_at: '2026-06-18T09:00:00+07:00',
    updated_at: '2026-06-18T09:00:00+07:00',
    status_histories: [{
        id: 1,
        from_status: null,
        to_status: 'submitted',
        actor: null,
        note: 'Riwayat <b>aman</b>',
        created_at: '2026-06-18T09:00:00+07:00',
    }],
    ...overrides,
});

const bookingEnvelope = (items: SuperAdminBooking[] = [booking()]) => ({
    message: 'ok',
    data: items,
    meta: {
        current_page: 1,
        per_page: 10,
        total: items.length,
        last_page: 1,
    },
});

const flush = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
};

const setValue = (id: string, value: string): void => {
    const element = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    element.value = value;
};

const changeValue = (id: string, value: string): void => {
    setValue(id, value);
    document.getElementById(id)?.dispatchEvent(new Event('change', { bubbles: true }));
};

const submit = (id: string): void => {
    document.getElementById(id)?.dispatchEvent(new Event('submit', {
        bubbles: true,
        cancelable: true,
    }));
};

const openRoomForm = (): void => {
    document.getElementById('admin-peminjaman-add-room')?.click();
};

const fillRoomForm = (type: 'classroom' | 'laboratory' = 'classroom'): void => {
    setValue('admin-room-code', type === 'classroom' ? 'KLS-01' : 'LAB-01');
    setValue('admin-room-name', type === 'classroom' ? 'Ruang Kelas' : 'Laboratorium');
    changeValue('admin-room-type', type);
    setValue('admin-room-capacity', '30');
    setValue('admin-room-location', 'Gedung Uji');
    setValue('admin-room-description', 'Deskripsi');
    if (type === 'laboratory') setValue('admin-room-laboratory', '7');
};

const openMonitoring = (): void => {
    document.getElementById('admin-peminjaman-tab-monitoring')?.click();
};

beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    Object.values(m).forEach((value) => {
        if (typeof value === 'function' && 'mockReset' in value) value.mockReset();
    });
    m.toasts = [];
    m.getLabs.mockResolvedValue(labs);
    m.getRooms.mockResolvedValue([room()]);
    m.getRoom.mockResolvedValue(room());
    m.createRoom.mockResolvedValue(room());
    m.updateRoom.mockResolvedValue(room());
    m.activateRoom.mockResolvedValue(room({ is_active: true }));
    m.deactivateRoom.mockResolvedValue(room({ is_active: false }));
    m.getBookings.mockResolvedValue(bookingEnvelope());
    m.getBooking.mockResolvedValue(booking());
});

describe('Super Admin Peminjaman room management', () => {
    it('renders loading, empty, error/retry, and success room states', async () => {
        let resolveRooms!: (value: Room[]) => void;
        m.getRooms.mockReturnValueOnce(new Promise((resolve) => {
            resolveRooms = resolve;
        }));
        const rendering = renderPeminjamanRuanganAdmin();
        expect(document.querySelector('[data-admin-room-state="loading"]')).not.toBeNull();
        resolveRooms([]);
        await rendering;
        expect(document.querySelector('[data-admin-room-state="empty"]')).not.toBeNull();

        m.getRooms
            .mockRejectedValueOnce(new Error('Data ruangan gagal.'))
            .mockResolvedValueOnce([room()]);
        await renderPeminjamanRuanganAdmin();
        expect(document.querySelector('[data-admin-room-state="error"]')).not.toBeNull();
        document.getElementById('admin-peminjaman-retry-rooms')?.click();
        await flush();
        expect(document.querySelector('[data-admin-room-state="success"]')).not.toBeNull();
    });

    it('calls room filters with type, status, search, and laboratory', async () => {
        await renderPeminjamanRuanganAdmin();
        setValue('admin-peminjaman-room-search', 'ruang uji');
        setValue('admin-peminjaman-room-type', 'laboratory');
        setValue('admin-peminjaman-room-active', 'false');
        setValue('admin-peminjaman-room-laboratory', '7');
        submit('admin-peminjaman-room-filters');
        await flush();

        expect(m.getRooms).toHaveBeenCalledWith({
            type: 'laboratory',
            laboratoryId: 7,
            active: false,
            search: 'ruang uji',
        });
    });

    it('renders minimal laboratory data and safely escapes room text', async () => {
        await renderPeminjamanRuanganAdmin();
        expect(document.body.textContent).toContain('LAB-UJI · Laboratorium <script>uji</script>');
        expect(document.body.textContent).toContain('Ruang <img src=x onerror=unsafe()>');
        expect(document.querySelector('script')).toBeNull();
        expect(document.querySelector('img[src="x"]')).toBeNull();
    });

    it('renders and retries a denied laboratory catalog request', async () => {
        m.getLabs
            .mockRejectedValueOnce(new PeminjamanApiError('Forbidden', 403))
            .mockResolvedValueOnce(labs);
        await renderPeminjamanRuanganAdmin();

        expect(document.body.textContent).toContain('tidak memiliki akses');
        document.getElementById('admin-peminjaman-retry-laboratories')?.click();
        await flush();
        expect(document.body.textContent).toContain('LAB-UJI');
    });

    it('validates required room fields before create', async () => {
        await renderPeminjamanRuanganAdmin();
        openRoomForm();
        submit('admin-room-form');

        expect(m.createRoom).not.toHaveBeenCalled();
        expect(document.body.textContent).toContain('Kode ruangan wajib diisi.');
        expect(document.body.textContent).toContain('Kapasitas ruangan wajib diisi.');
    });

    it('creates a classroom without requiring or sending a laboratory owner', async () => {
        await renderPeminjamanRuanganAdmin();
        openRoomForm();
        fillRoomForm('classroom');
        submit('admin-room-form');
        await flush();

        expect(m.createRoom).toHaveBeenCalledWith({
            code: 'KLS-01',
            name: 'Ruang Kelas',
            type: 'classroom',
            capacity: 30,
            location: 'Gedung Uji',
            description: 'Deskripsi',
            owning_laboratory_id: null,
        });
    });

    it('requires a laboratory owner and creates a laboratory with the selected owner', async () => {
        await renderPeminjamanRuanganAdmin();
        openRoomForm();
        fillRoomForm('laboratory');
        setValue('admin-room-laboratory', '');
        submit('admin-room-form');
        expect(m.createRoom).not.toHaveBeenCalled();
        expect(document.body.textContent).toContain('Laboratorium pemilik wajib dipilih.');

        setValue('admin-room-laboratory', '7');
        submit('admin-room-form');
        await flush();
        expect(m.createRoom).toHaveBeenCalledWith(expect.objectContaining({
            type: 'laboratory',
            owning_laboratory_id: 7,
        }));
    });

    it('renders backend 422 field errors during create', async () => {
        m.createRoom.mockRejectedValueOnce(new PeminjamanApiError(
            'Validasi gagal.',
            422,
            undefined,
            { code: ['Kode ruangan sudah digunakan.'] },
        ));
        await renderPeminjamanRuanganAdmin();
        openRoomForm();
        fillRoomForm();
        submit('admin-room-form');
        await flush();

        expect(document.body.textContent).toContain('Kode ruangan sudah digunakan.');
    });

    it('loads detail and updates a room through the edit form', async () => {
        await renderPeminjamanRuanganAdmin();
        document.querySelector<HTMLButtonElement>('[data-admin-room-detail="12"]')?.click();
        await flush();
        document.getElementById('edit-admin-peminjaman-room')?.click();
        setValue('admin-room-name', 'Nama Diperbarui');
        submit('admin-room-form');
        await flush();

        expect(m.updateRoom).toHaveBeenCalledWith(12, expect.objectContaining({
            name: 'Nama Diperbarui',
        }));
    });

    it('activates and deactivates through separate confirmed actions', async () => {
        await renderPeminjamanRuanganAdmin();
        document.querySelector<HTMLButtonElement>('[data-admin-room-detail="12"]')?.click();
        await flush();
        document.getElementById('toggle-admin-peminjaman-room')?.click();
        document.getElementById('confirm-admin-room-status')?.click();
        await flush();
        expect(m.deactivateRoom).toHaveBeenCalledWith(12);

        m.getRoom.mockResolvedValue(room({ is_active: false }));
        document.getElementById('close-admin-peminjaman-drawer')?.click();
        document.querySelector<HTMLButtonElement>('[data-admin-room-detail="12"]')?.click();
        await flush();
        document.getElementById('toggle-admin-peminjaman-room')?.click();
        document.getElementById('confirm-admin-room-status')?.click();
        await flush();
        expect(m.activateRoom).toHaveBeenCalledWith(12);
    });

    it('shows a clear deactivation 409 conflict without optimistic state', async () => {
        m.deactivateRoom.mockRejectedValueOnce(new PeminjamanApiError(
            'Conflict',
            409,
            'booking_conflict',
        ));
        await renderPeminjamanRuanganAdmin();
        document.querySelector<HTMLButtonElement>('[data-admin-room-detail="12"]')?.click();
        await flush();
        document.getElementById('toggle-admin-peminjaman-room')?.click();
        document.getElementById('confirm-admin-room-status')?.click();
        await flush();

        expect(document.body.textContent).toContain(
            'memiliki peminjaman disetujui yang akan datang',
        );
        expect(m.getRooms).toHaveBeenCalledTimes(1);
    });
});

describe('Super Admin booking monitoring', () => {
    it('renders loading, empty, error/retry, and success monitoring states', async () => {
        let resolveBookings!: (value: ReturnType<typeof bookingEnvelope>) => void;
        m.getBookings.mockReturnValueOnce(new Promise((resolve) => {
            resolveBookings = resolve;
        }));
        const rendering = renderPeminjamanRuanganAdmin();
        openMonitoring();
        expect(document.querySelector('[data-admin-booking-state="loading"]')).not.toBeNull();
        resolveBookings(bookingEnvelope([]));
        await rendering;
        openMonitoring();
        expect(document.querySelector('[data-admin-booking-state="empty"]')).not.toBeNull();

        m.getBookings
            .mockRejectedValueOnce(new Error('Monitoring gagal.'))
            .mockResolvedValueOnce(bookingEnvelope());
        await renderPeminjamanRuanganAdmin();
        openMonitoring();
        expect(document.querySelector('[data-admin-booking-state="error"]')).not.toBeNull();
        document.getElementById('admin-peminjaman-retry-bookings')?.click();
        await flush();
        expect(document.querySelector('[data-admin-booking-state="success"]')).not.toBeNull();
    });

    it('renders all requests and calls monitoring filters', async () => {
        await renderPeminjamanRuanganAdmin();
        openMonitoring();
        expect(document.querySelector('[data-admin-booking-state="success"]')).not.toBeNull();
        expect(document.body.textContent).toContain('Kegiatan <img src=x onerror=unsafe()>');

        setValue('admin-peminjaman-booking-status', 'approved');
        setValue('admin-peminjaman-booking-room-type', 'classroom');
        setValue('admin-peminjaman-booking-room-id', '12');
        setValue('admin-peminjaman-booking-date-from', '2026-06-20');
        setValue('admin-peminjaman-booking-date-to', '2026-06-30');
        submit('admin-peminjaman-booking-filters');
        await flush();

        expect(m.getBookings).toHaveBeenLastCalledWith({
            status: 'approved',
            roomType: 'classroom',
            roomId: 12,
            dateFrom: '2026-06-20',
            dateTo: '2026-06-30',
            page: 1,
            perPage: 10,
        });
    });

    it('renders requester, room, activity, purpose, status, and history safely', async () => {
        await renderPeminjamanRuanganAdmin();
        openMonitoring();
        document.querySelector<HTMLButtonElement>('[data-admin-booking-detail="44"]')?.click();
        await flush();

        expect(document.body.textContent).toContain('Pemohon <script>unsafe()</script>');
        expect(document.body.textContent).toContain('Riwayat <b>aman</b>');
        expect(document.body.textContent).toContain('Monitoring saja');
        expect(document.querySelector('script')).toBeNull();
        expect(document.querySelector('img[src="x"]')).toBeNull();
        expect(document.getElementById('approve-tendik-peminjaman')).toBeNull();
        expect(document.getElementById('revise-tendik-peminjaman')).toBeNull();
        expect(document.getElementById('reject-tendik-peminjaman')).toBeNull();
    });

    it('shows surat PDF metadata with protected preview/download and no upload/replace UI', async () => {
        const withPdf = booking({
            status: 'revision_requested',
            surat_peminjaman_pdf: {
                exists: true,
                original_name: 'Surat <b>Final</b>.pdf',
                size_bytes: 204800,
                uploaded_at: '2026-06-18T10:00:00+07:00',
            },
        });
        m.getBooking.mockResolvedValue(withPdf);
        await renderPeminjamanRuanganAdmin();
        openMonitoring();
        document.querySelector<HTMLButtonElement>('[data-admin-booking-detail="44"]')?.click();
        await flush();

        expect(document.body.textContent).toContain('Surat Peminjaman');
        expect(document.body.textContent).toContain('Surat <b>Final</b>.pdf');
        expect(document.querySelector('b')).toBeNull();
        expect(document.body.textContent).toContain('200.0 KB');
        // Monitoring stays read-only: no replacement upload even on revision.
        expect(document.getElementById('peminjaman-surat-replace-input')).toBeNull();
        expect(document.getElementById('peminjaman-surat-replace-submit')).toBeNull();

        document.getElementById('peminjaman-surat-preview')?.click();
        expect(document.getElementById('peminjaman-surat-preview-root')).not.toBeNull();
        expect(m.attachViewer).toHaveBeenCalledWith(expect.objectContaining({
            endpointUrl: '/api/peminjaman-ruangan/44/attachment/surat-peminjaman/preview',
        }));

        document.getElementById('peminjaman-surat-download')?.click();
        await flush();
        expect(m.downloadSurat).toHaveBeenCalledWith(44, 'Surat <b>Final</b>.pdf');
    });

    it('shows a safe empty state when the surat is missing', async () => {
        await renderPeminjamanRuanganAdmin();
        openMonitoring();
        document.querySelector<HTMLButtonElement>('[data-admin-booking-detail="44"]')?.click();
        await flush();

        expect(document.body.textContent).toContain('Surat peminjaman belum tersedia.');
        expect(document.getElementById('peminjaman-surat-preview')).toBeNull();
        expect(document.getElementById('peminjaman-surat-download')).toBeNull();
    });

    it('renders monitoring 403 and detail 404 errors', async () => {
        m.getBookings.mockRejectedValueOnce(new PeminjamanApiError('Forbidden', 403));
        await renderPeminjamanRuanganAdmin();
        openMonitoring();
        expect(document.body.textContent).toContain('tidak memiliki akses');

        m.getBookings.mockResolvedValue(bookingEnvelope());
        m.getBooking.mockRejectedValueOnce(new PeminjamanApiError('Not found', 404));
        await renderPeminjamanRuanganAdmin();
        openMonitoring();
        document.querySelector<HTMLButtonElement>('[data-admin-booking-detail="44"]')?.click();
        await flush();
        expect(document.body.textContent).toContain('tidak ditemukan');
    });

    it('contains no approval workflow, delete action, separate API origin, or localhost dependency', () => {
        expect(pageSource).not.toContain('approveTendikBooking');
        expect(pageSource).not.toContain('reviseTendikBooking');
        expect(pageSource).not.toContain('rejectTendikBooking');
        expect(pageSource).not.toContain('deleteSuperAdminRoom');
        expect(pageSource).not.toContain('VITE_API_BASE_URL');
        expect(pageSource).not.toContain('localhost');
        // Surat access is read-only and stays on the protected application API.
        expect(pageSource).not.toContain('replaceSuratPeminjamanPdf');
        expect(pageSource).not.toContain('/storage');
        expect(pageSource).not.toContain('/api/room-bookings');
        expect(pageSource).not.toContain('window.open');
        expect(pageSource).not.toContain('<iframe');
    });
});
