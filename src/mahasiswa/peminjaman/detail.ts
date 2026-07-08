import Toastify from 'toastify-js';
import {
    cancelMahasiswaBooking,
    downloadSuratPeminjamanPdf,
    getMahasiswaBooking,
    getPeminjamanRooms,
    replaceSuratPeminjamanPdf,
    resubmitMahasiswaBooking,
    suratPeminjamanPreviewUrl,
} from './api';
import { closeBookingWorkflow, openBookingWorkflowForm } from './booking-form';
import { renderBookingDetailDialog, renderCancelDialog } from './views';
import { validateSuratPdfFile } from './workflow';
import {
    attachProtectedPdfViewer,
    renderProtectedPdfViewer,
} from '../../shared/protected-pdf-viewer';
import type { MahasiswaBooking } from './types';

/**
 * Self-contained booking detail controller: detail dialog + edit (via the
 * shared booking form) + resubmit + cancel. Extracted from the landing page
 * so Dashboard and Riwayat Pengajuan can open the exact same workflows after
 * the landing "Pengajuan Peminjaman Saya" panel was removed. Callers pass
 * `onMutated` to refresh their own list/calendar after any state change.
 */

export interface PeminjamanDetailOptions {
    onMutated?: () => void;
}

let detailEscapeHandler: ((event: KeyboardEvent) => void) | null = null;
let cancelEscapeHandler: ((event: KeyboardEvent) => void) | null = null;
// Replacement file is held here (not the input) so it survives feedback
// updates; reset whenever a fresh detail is opened.
let pendingReplaceFile: File | null = null;
let pdfViewerEscapeHandler: ((event: KeyboardEvent) => void) | null = null;
let pdfViewerCleanup: (() => void) | null = null;

const showToast = (text: string, success: boolean): void => {
    Toastify({
        text,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: { background: success ? '#0f766e' : '#b91c1c' },
    }).showToast();
};

export const closePeminjamanDetail = (): void => {
    closeSuratPreview();
    pendingReplaceFile = null;
    document.getElementById('peminjaman-detail-root')?.remove();
    document.getElementById('peminjaman-cancel-root')?.remove();
    if (detailEscapeHandler) {
        document.removeEventListener('keydown', detailEscapeHandler);
        detailEscapeHandler = null;
    }
    if (cancelEscapeHandler) {
        document.removeEventListener('keydown', cancelEscapeHandler);
        cancelEscapeHandler = null;
    }
};

const detailRoot = (): HTMLElement => {
    document.getElementById('peminjaman-detail-root')?.remove();
    const root = document.createElement('div');
    root.id = 'peminjaman-detail-root';
    document.body.appendChild(root);
    return root;
};

const renderDetailState = (
    booking: MahasiswaBooking | null,
    loading: boolean,
    error: string | null,
    actionLoading: boolean,
    options: PeminjamanDetailOptions,
): void => {
    const root = detailRoot();
    root.innerHTML = renderBookingDetailDialog(booking, loading, error, actionLoading);

    const close = (): void => closePeminjamanDetail();
    root.querySelector('[data-workflow-overlay]')?.addEventListener('click', close);
    root.querySelector('#close-peminjaman-workflow')?.addEventListener('click', close);

    if (booking) {
        root.querySelector('#edit-peminjaman-booking')?.addEventListener('click', () => {
            void openEditForm(booking, options);
        });
        root.querySelector('#resubmit-peminjaman-booking')?.addEventListener('click', async () => {
            renderDetailState(booking, false, null, true, options);
            try {
                const updated = await resubmitMahasiswaBooking(booking.id);
                showToast('Pengajuan berhasil dikirim ulang.', true);
                options.onMutated?.();
                renderDetailState(updated, false, null, false, options);
            } catch (resubmitError) {
                renderDetailState(
                    booking,
                    false,
                    resubmitError instanceof Error
                        ? resubmitError.message
                        : 'Pengajuan gagal dikirim ulang.',
                    false,
                    options,
                );
            }
        });
        root.querySelector('#cancel-peminjaman-booking')?.addEventListener('click', () => {
            openCancelDialog(booking, options);
        });
        bindSuratControls(root, booking, options);
    }

    if (detailEscapeHandler) {
        document.removeEventListener('keydown', detailEscapeHandler);
    }
    detailEscapeHandler = (event: KeyboardEvent) => {
        if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', detailEscapeHandler);
    root.querySelector<HTMLButtonElement>('#close-peminjaman-workflow')?.focus();
};

export const closeSuratPreview = (): void => {
    if (pdfViewerCleanup) {
        pdfViewerCleanup();
        pdfViewerCleanup = null;
    }
    if (pdfViewerEscapeHandler) {
        document.removeEventListener('keydown', pdfViewerEscapeHandler);
        pdfViewerEscapeHandler = null;
    }
    document.getElementById('peminjaman-surat-preview-root')?.remove();
};

// Full-screen protected preview overlay (above the detail drawer). Reuses the
// shared authenticated PDF.js viewer — bytes are fetched via apiFetch, never a
// raw storage URL. Exported so the Tendik reviewer drawer opens the exact same
// overlay (role authorization happens in the backend preview endpoint).
export const openSuratPreview = (booking: MahasiswaBooking): void => {
    closeSuratPreview();
    const root = document.createElement('div');
    root.id = 'peminjaman-surat-preview-root';
    root.className = 'fixed inset-0 z-[300] flex flex-col bg-black/60 p-4 sm:p-8';
    root.innerHTML = `
        <div class="mx-auto flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div class="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-3">
                <p class="min-w-0 truncate text-sm font-bold text-gray-800">Pratinjau Surat Peminjaman</p>
                <button id="peminjaman-surat-preview-close" type="button" class="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Tutup pratinjau">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div class="min-h-0 flex-1 overflow-auto p-3">
                ${renderProtectedPdfViewer('peminjaman-surat-pdf-viewer', {
                    title: 'Surat Peminjaman Ruangan',
                    subtitle: `${booking.room.code} · ${booking.room.name}`,
                    loading: 'Memuat surat peminjaman...',
                })}
            </div>
        </div>
    `;
    document.body.appendChild(root);

    root.addEventListener('click', (event) => {
        if (event.target === root) closeSuratPreview();
    });
    root.querySelector('#peminjaman-surat-preview-close')?.addEventListener('click', closeSuratPreview);
    pdfViewerEscapeHandler = (event: KeyboardEvent) => {
        if (event.key === 'Escape') closeSuratPreview();
    };
    document.addEventListener('keydown', pdfViewerEscapeHandler);
    pdfViewerCleanup = attachProtectedPdfViewer({
        rootId: 'peminjaman-surat-pdf-viewer',
        endpointUrl: suratPeminjamanPreviewUrl(booking.id),
    });
};

const bindSuratControls = (
    root: HTMLElement,
    booking: MahasiswaBooking,
    options: PeminjamanDetailOptions,
): void => {
    root.querySelector('#peminjaman-surat-preview')?.addEventListener('click', () => {
        openSuratPreview(booking);
    });
    root.querySelector('#peminjaman-surat-download')?.addEventListener('click', async () => {
        try {
            await downloadSuratPeminjamanPdf(
                booking.id,
                booking.surat_peminjaman_pdf?.original_name ?? 'surat-peminjaman.pdf',
            );
        } catch (downloadError) {
            showToast(
                downloadError instanceof Error
                    ? downloadError.message
                    : 'Surat peminjaman gagal diunduh.',
                false,
            );
        }
    });

    const replaceInput = root.querySelector<HTMLInputElement>('#peminjaman-surat-replace-input');
    const replaceSubmit = root.querySelector<HTMLButtonElement>('#peminjaman-surat-replace-submit');
    const feedback = root.querySelector<HTMLElement>('#peminjaman-surat-replace-feedback');
    if (!replaceInput || !replaceSubmit) return;

    const showFeedback = (message: string, ok: boolean): void => {
        if (!feedback) return;
        feedback.textContent = message;
        feedback.classList.remove('hidden', 'text-red-600', 'text-emerald-600');
        feedback.classList.add(ok ? 'text-emerald-600' : 'text-red-600');
    };

    replaceInput.addEventListener('change', () => {
        const file = replaceInput.files?.[0] ?? null;
        const error = file ? validateSuratPdfFile(file) : null;
        pendingReplaceFile = error ? null : file;
        if (error) showFeedback(error, false);
        else if (file) showFeedback(file.name, true);
        else if (feedback) feedback.classList.add('hidden');
    });

    replaceSubmit.addEventListener('click', async () => {
        const error = validateSuratPdfFile(pendingReplaceFile);
        if (error) {
            showFeedback(error, false);
            return;
        }
        replaceSubmit.disabled = true;
        showFeedback('Mengunggah surat...', true);
        try {
            const updated = await replaceSuratPeminjamanPdf(booking.id, pendingReplaceFile!);
            pendingReplaceFile = null;
            showToast('Surat peminjaman berhasil diperbarui.', true);
            options.onMutated?.();
            renderDetailState(updated, false, null, false, options);
        } catch (replaceError) {
            replaceSubmit.disabled = false;
            showFeedback(
                replaceError instanceof Error
                    ? replaceError.message
                    : 'Surat peminjaman gagal diganti.',
                false,
            );
        }
    });
};

const openEditForm = async (
    booking: MahasiswaBooking,
    options: PeminjamanDetailOptions,
): Promise<void> => {
    closePeminjamanDetail();
    try {
        const rooms = (await getPeminjamanRooms()).filter((room) => room.is_active);
        openBookingWorkflowForm({
            rooms,
            mode: 'edit',
            booking,
            onSaved: (saved) => {
                showToast('Perbaikan pengajuan berhasil disimpan.', true);
                options.onMutated?.();
                void openPeminjamanBookingDetail(saved.id, options);
            },
        });
    } catch (roomsError) {
        showToast(
            roomsError instanceof Error
                ? roomsError.message
                : 'Daftar ruangan gagal dimuat untuk perbaikan.',
            false,
        );
        renderDetailState(booking, false, null, false, options);
    }
};

const openCancelDialog = (
    booking: MahasiswaBooking,
    options: PeminjamanDetailOptions,
): void => {
    document.getElementById('peminjaman-cancel-root')?.remove();
    const root = document.createElement('div');
    root.id = 'peminjaman-cancel-root';
    document.body.appendChild(root);

    const closeCancel = (): void => {
        root.remove();
        if (cancelEscapeHandler) {
            document.removeEventListener('keydown', cancelEscapeHandler);
            cancelEscapeHandler = null;
        }
    };

    const render = (error: string | null, submitting: boolean): void => {
        root.innerHTML = renderCancelDialog(booking, error, submitting);
        root.querySelector('[data-workflow-overlay]')?.addEventListener('click', closeCancel);
        root.querySelector('#close-peminjaman-cancel')?.addEventListener('click', closeCancel);
        root.querySelector('#peminjaman-cancel-form')?.addEventListener('submit', async (event) => {
            event.preventDefault();
            const reason = (root.querySelector('#peminjaman-cancel-reason') as HTMLTextAreaElement | null)?.value.trim() ?? '';
            if (!reason) {
                render('Alasan pembatalan wajib diisi.', false);
                return;
            }
            render(null, true);
            try {
                const updated = await cancelMahasiswaBooking(booking.id, reason);
                closeCancel();
                showToast('Pengajuan peminjaman berhasil dibatalkan.', true);
                options.onMutated?.();
                renderDetailState(updated, false, null, false, options);
            } catch (cancelError) {
                render(
                    cancelError instanceof Error
                        ? cancelError.message
                        : 'Pembatalan pengajuan gagal.',
                    false,
                );
            }
        });
        if (cancelEscapeHandler) {
            document.removeEventListener('keydown', cancelEscapeHandler);
        }
        cancelEscapeHandler = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeCancel();
        };
        document.addEventListener('keydown', cancelEscapeHandler);
        root.querySelector<HTMLTextAreaElement>('#peminjaman-cancel-reason')?.focus();
    };
    render(null, false);
};

export const openPeminjamanBookingDetail = async (
    bookingId: number,
    options: PeminjamanDetailOptions = {},
): Promise<void> => {
    closeBookingWorkflow();
    closePeminjamanDetail();
    renderDetailState(null, true, null, false, options);
    try {
        const booking = await getMahasiswaBooking(bookingId);
        renderDetailState(booking, false, null, false, options);
    } catch (error) {
        renderDetailState(
            null,
            false,
            error instanceof Error ? error.message : 'Detail pengajuan gagal dimuat.',
            false,
            options,
        );
    }
};
