import type { AcademicPeriod } from './types';
import { showSuccess, showError } from '../../shared/toast';
import { deleteAcademicPeriod, toggleAcademicPeriod } from './api';
import { renderAcademicPeriodModal } from './modals';
import { renderAcademicPeriodTable } from './ui-utils';
import {
    formatLocalDateLong,
    isCurrentToday,
    isExpired,
    isFuture,
} from './state';

/**
 * Build a confirm() message that explains the consequence of toggling this
 * specific period at the time of the click. Returns the user's confirm choice.
 */
const confirmToggleAction = (period: AcademicPeriod): boolean => {
    if (period.is_active) {
        // Toggling OFF
        if (isCurrentToday(period)) {
            return confirm(
                'Periode ini sedang berjalan hari ini.\n\n'
                + 'Setelah dinonaktifkan, tidak ada periode berjalan hari ini sampai Anda mengaktifkan periode lain yang tanggalnya mencakup hari ini.\n\n'
                + 'Lanjutkan menonaktifkan?'
            );
        }
        return confirm('Apakah Anda yakin ingin menonaktifkan periode akademik ini?');
    }

    // Toggling ON
    if (isFuture(period)) {
        return confirm(
            `Periode ini baru mulai pada ${formatLocalDateLong(period.start_date)}.\n\n`
            + 'Jika diaktifkan sekarang, periode ini TETAP BELUM menjadi periode berjalan sampai tanggal tersebut. Sistem akan menganggap tidak ada periode berjalan hari ini.\n\n'
            + 'Lanjutkan mengaktifkan?'
        );
    }
    if (isExpired(period)) {
        return confirm(
            `Periode ini sudah berakhir pada ${formatLocalDateLong(period.end_date)}.\n\n`
            + 'Jika diaktifkan sekarang, periode ini TETAP TIDAK menjadi periode berjalan hari ini. Rendering surat yang membutuhkan periode akademik akan mengisi nilai kosong.\n\n'
            + 'Lanjutkan mengaktifkan?'
        );
    }
    // Date range covers today → activating makes it the current period.
    return confirm(
        'Periode ini akan menjadi periode berjalan hari ini. Periode aktif lainnya akan otomatis dinonaktifkan.\n\n'
        + 'Lanjutkan mengaktifkan?'
    );
};

const escapeConfirmHtml = (value: unknown): string => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const formatSemesterLabel = (period: AcademicPeriod): string =>
    `${period.semester_type === 'ganjil' ? 'Ganjil' : 'Genap'} ${period.academic_year}`;

const openDeletePeriodModal = (period: AcademicPeriod): Promise<boolean> => new Promise((resolve) => {
    document.getElementById('ap-delete-confirm-root')?.remove();
    const root = document.createElement('div');
    root.id = 'ap-delete-confirm-root';
    document.body.appendChild(root);

    let settled = false;
    const close = (confirmed: boolean): void => {
        if (settled) return;
        settled = true;
        document.removeEventListener('keydown', handleEscape);
        root.remove();
        resolve(confirmed);
    };
    const handleEscape = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') close(false);
    };

    const currentWarning = isCurrentToday(period)
        ? `<div class="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
            Periode ini sedang berjalan hari ini. Jika dihapus, sistem tidak memiliki periode berjalan sampai Anda mengaktifkan periode lain yang valid.
        </div>`
        : '';

    root.innerHTML = `
        <div data-ap-delete-overlay class="fixed inset-0 z-[260] bg-black/50"></div>
        <section role="dialog" aria-modal="true" aria-labelledby="ap-delete-confirm-title" class="fixed left-1/2 top-1/2 z-[261] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
            <div class="flex items-start gap-4">
                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>
                </div>
                <div class="min-w-0">
                    <p class="text-xs font-bold uppercase tracking-wider text-red-600">Hapus Periode Akademik</p>
                    <h2 id="ap-delete-confirm-title" class="mt-1 text-lg font-bold text-gray-900">${escapeConfirmHtml(formatSemesterLabel(period))}</h2>
                    <p class="mt-2 text-sm leading-6 text-gray-600">Periode ${escapeConfirmHtml(formatLocalDateLong(period.start_date))} sampai ${escapeConfirmHtml(formatLocalDateLong(period.end_date))} akan dihapus permanen.</p>
                </div>
            </div>
            ${currentWarning}
            <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button id="cancel-ap-delete" type="button" class="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50">Batal</button>
                <button id="confirm-ap-delete" type="button" class="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700">Hapus Periode</button>
            </div>
        </section>
    `;

    root.querySelector('[data-ap-delete-overlay]')?.addEventListener('click', () => close(false));
    root.querySelector('#cancel-ap-delete')?.addEventListener('click', () => close(false));
    root.querySelector('#confirm-ap-delete')?.addEventListener('click', () => close(true));
    document.addEventListener('keydown', handleEscape);
    root.querySelector<HTMLButtonElement>('#cancel-ap-delete')?.focus();
});
const attachRowListeners = (periods: AcademicPeriod[], onRefresh: () => void): void => {
    document.querySelectorAll('.ap-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt((btn as HTMLElement).dataset.id ?? '');
            const period = periods.find(p => p.id === id);
            if (period) renderAcademicPeriodModal(period, onRefresh);
        });
    });

    document.querySelectorAll('.ap-toggle-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = parseInt((btn as HTMLElement).dataset.id ?? '');
            const period = periods.find(p => p.id === id);
            if (!period) return;
            if (!confirmToggleAction(period)) return;
            try {
                const response = await toggleAcademicPeriod(id);
                const result = await response.json();
                if (response.ok) {
                    showSuccess(result.message);
                    onRefresh();
                } else {
                    const errors = result.errors as Record<string, string[]> | undefined;
                    if (errors) {
                        showError(Object.values(errors).flat().join(' '));
                    } else {
                        showError(result.message || 'Gagal mengubah status periode');
                    }
                }
            } catch (err) {
                console.error(err);
                showError('Terjadi kesalahan jaringan');
            }
        });
    });

    document.querySelectorAll('.ap-delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = parseInt((btn as HTMLElement).dataset.id ?? '');
            const period = periods.find(p => p.id === id);
            if (!period) return;
            if (!await openDeletePeriodModal(period)) return;
            try {
                const response = await deleteAcademicPeriod(id);
                const result = await response.json();
                if (response.ok) {
                    showSuccess(result.message);
                    onRefresh();
                } else {
                    showError(result.message || 'Gagal menghapus periode akademik');
                }
            } catch (err) {
                console.error(err);
                showError('Terjadi kesalahan jaringan');
            }
        });
    });
};

export const setupAcademicPeriodListeners = (
    periods: AcademicPeriod[],
    onRefresh: () => void
): void => {
    document.getElementById('ap-add-btn')?.addEventListener('click', () => {
        renderAcademicPeriodModal(null, onRefresh);
    });

    const searchInput = document.getElementById('ap-search') as HTMLInputElement | null;
    const typeFilter = document.getElementById('ap-type-filter') as HTMLSelectElement | null;
    const activeFilter = document.getElementById('ap-active-filter') as HTMLSelectElement | null;

    const applyFilters = (): void => {
        const query = (searchInput?.value ?? '').toLowerCase();
        const typeVal = typeFilter?.value ?? '';
        const activeVal = activeFilter?.value ?? '';

        const filtered = periods.filter(p => {
            const matchQuery = !query || p.academic_year.toLowerCase().includes(query);
            const matchType = !typeVal || p.semester_type === typeVal;
            const matchActive = activeVal === '' || String(p.is_active) === activeVal;
            return matchQuery && matchType && matchActive;
        });

        const tbody = document.getElementById('ap-table-body');
        if (tbody) tbody.innerHTML = renderAcademicPeriodTable(filtered);
        attachRowListeners(periods, onRefresh);
    };

    searchInput?.addEventListener('input', applyFilters);
    typeFilter?.addEventListener('change', applyFilters);
    activeFilter?.addEventListener('change', applyFilters);

    attachRowListeners(periods, onRefresh);
};
