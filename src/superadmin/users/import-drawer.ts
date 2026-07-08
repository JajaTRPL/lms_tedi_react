import { closeDrawer, getOrCreateDrawerRoot } from './drawer-utils';
import { apiFetch } from '../../shared/api-client';
import { showSuccess, showError, showInfo } from '../../shared/toast';
import { escapeHtml } from './ui-utils';

/**
 * SuperAdmin verified-Mahasiswa import drawer.
 *
 * Flow: unduh template (CSV/XLSX) → unggah file → validasi (dry-run di server,
 * tidak menulis data) → ringkasan Baru/Diperbarui/Dilewati/Gagal → modal
 * konfirmasi → impor. Riwayat impor + laporan error diambil dari server
 * (batch), bukan dari payload klien.
 */

interface ImportSummary {
    total: number;
    valid: number;
    invalid: number;
    create: number;
    update: number;
    skip: number;
    fail: number;
}

interface InvalidRow {
    row: number;
    data?: { name?: string; email?: string; nim?: string; study_program_code?: string };
    errors: string[];
}

const TEMPLATE_FILES: Record<string, string> = {
    csv: 'template_import_mahasiswa_verified_v2.csv',
    xlsx: 'template_import_mahasiswa_verified_v2.xlsx',
};

const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => window.URL.revokeObjectURL(url), 500);
};

const isAcceptedFile = (name: string): boolean => {
    const lower = name.toLowerCase();
    return lower.endsWith('.csv') || lower.endsWith('.xlsx');
};

const statusLabel = (status: string): string => {
    const labels: Record<string, string> = {
        validated: 'Tervalidasi',
        completed: 'Selesai',
        failed: 'Gagal',
        cancelled: 'Dibatalkan',
    };
    return labels[status] ?? status;
};

export function renderImportDrawer(onRefresh: () => void) {
    const container = getOrCreateDrawerRoot();
    let batchId = '';
    let fileHash = '';
    let summary: ImportSummary | null = null;
    let selectedFile: File | null = null;
    let historyPage = 1;
    // Mode perbarui data aktif is limited to Primary Super Admin (also
    // enforced server-side); secondary admins see the option disabled.
    const isPrimaryAdmin = localStorage.getItem('auth_role_level') === 'primary';

    container.innerHTML = `
        <div class="drawer-overlay fixed inset-0 bg-black/40 z-[200]" style="opacity:0; transition: opacity 0.3s ease;"></div>
        <div class="drawer-panel fixed top-0 right-0 h-full w-[520px] max-w-full bg-white z-[201] flex flex-col shadow-2xl" style="transform: translateX(100%); transition: transform 0.3s ease;" role="dialog" aria-label="Impor Data Mahasiswa">
            <div class="flex items-start justify-between px-7 pt-8 pb-4">
                <div>
                    <h2 class="text-xl font-bold text-gray-900">Impor Data Mahasiswa</h2>
                    <p id="import-drawer-subtitle" class="text-sm text-gray-500 mt-1">Unggah data resmi kampus agar akun mahasiswa dikenali sebelum login</p>
                </div>
                <div class="flex items-center gap-1 mt-0.5">
                    <button id="open-import-history" class="px-2.5 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50 rounded-lg transition-all">Riwayat Impor</button>
                    <button id="close-import-drawer" aria-label="Tutup" class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>
            <div id="import-step-upload" class="flex-1 overflow-y-auto px-7 py-4 space-y-5">
                <div class="space-y-2">
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Template</p>
                    <p class="text-xs text-gray-400">Gunakan template resmi agar kolom dan format data sesuai.</p>
                    <div class="grid grid-cols-2 gap-2">
                        <button id="download-template-csv-btn" class="flex items-center justify-center gap-2 px-3 py-2.5 border border-teal-700 text-teal-700 rounded-xl text-sm font-semibold hover:bg-teal-50 transition-all">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Template CSV
                        </button>
                        <button id="download-template-xlsx-btn" class="flex items-center justify-center gap-2 px-3 py-2.5 border border-teal-700 text-teal-700 rounded-xl text-sm font-semibold hover:bg-teal-50 transition-all">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Template Excel
                        </button>
                    </div>
                    <p class="text-[11px] leading-relaxed text-gray-400">Menggunakan Google Sheets? Pilih File &rarr; Download &rarr; CSV (.csv) atau Microsoft Excel (.xlsx), lalu unggah file di sini.</p>
                </div>
                <hr class="border-gray-100">
                <div class="space-y-2">
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Unggah File</p>
                    <div id="drop-zone" role="button" tabindex="0" aria-label="Pilih file CSV atau XLSX untuk diunggah" class="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 transition-all">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-gray-300"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <p class="text-sm font-medium text-gray-500">Seret file atau klik untuk mengunggah</p>
                        <p class="text-[10px] text-gray-400">CSV (maks 2MB) atau Excel .xlsx (maks 5MB) &bull; Maks 5.000 baris &bull; .xls tidak didukung</p>
                        <input type="file" id="import-file-input" accept=".csv,.xlsx" aria-label="Pilih file CSV atau XLSX" class="hidden">
                    </div>
                    <div id="file-preview" class="hidden bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                        <div class="flex items-center gap-2.5 min-w-0">
                            <div class="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-teal-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                            </div>
                            <div class="min-w-0">
                                <p id="file-name" class="text-sm font-medium text-gray-700 truncate"></p>
                                <p id="file-size" class="text-[10px] text-gray-400"></p>
                            </div>
                        </div>
                        <button id="remove-file-btn" aria-label="Hapus file" class="p-1 text-gray-400 hover:text-red-500 transition-colors shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>
                <div class="bg-gray-50 rounded-xl p-4 space-y-2">
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Kolom Template</p>
                    <div class="flex flex-wrap gap-1.5">
                        <span class="text-[10px] bg-teal-100 text-teal-700 font-semibold px-2 py-0.5 rounded-md">name*</span>
                        <span class="text-[10px] bg-teal-100 text-teal-700 font-semibold px-2 py-0.5 rounded-md">email*</span>
                        <span class="text-[10px] bg-teal-100 text-teal-700 font-semibold px-2 py-0.5 rounded-md">nim*</span>
                        <span class="text-[10px] bg-teal-100 text-teal-700 font-semibold px-2 py-0.5 rounded-md">study_program_code*</span>
                        <span class="text-[10px] bg-gray-200 text-gray-600 font-semibold px-2 py-0.5 rounded-md">tanggal_lahir</span>
                    </div>
                    <p class="text-[10px] text-gray-400">* = wajib &bull; Email harus @mail.ugm.ac.id atau @ugm.ac.id</p>
                    <p class="text-[10px] leading-relaxed text-blue-700">Akun hasil impor tidak diberi password bawaan. Mahasiswa dapat login dengan Google UGM atau mengatur password melalui Lupa Kata Sandi.</p>
                </div>
                <div class="bg-amber-50 border border-amber-100 rounded-xl p-3.5 space-y-2.5">
                    <label class="flex items-start gap-2.5 ${isPrimaryAdmin ? 'cursor-pointer' : 'opacity-60'}">
                        <input type="checkbox" id="override-existing-checkbox" class="mt-0.5 accent-teal-700" ${isPrimaryAdmin ? '' : 'disabled'}>
                        <span class="min-w-0">
                            <span class="block text-sm font-semibold text-gray-700">Perbarui data mahasiswa aktif jika berbeda dari file</span>
                            <span class="block text-[11px] leading-relaxed text-amber-700 mt-0.5">Gunakan hanya jika file resmi kampus memang menjadi acuan terbaru. Perubahan akan tercatat di riwayat impor.</span>
                            ${isPrimaryAdmin ? '' : '<span class="block text-[11px] font-semibold text-amber-700 mt-0.5">Hanya Primary Super Admin yang dapat menggunakan mode ini.</span>'}
                        </span>
                    </label>
                    <div id="override-reason-wrap" class="hidden">
                        <label for="override-reason-input" class="block text-xs font-semibold text-gray-600 mb-1">Alasan penggunaan mode perbarui data <span class="text-red-500" aria-hidden="true">*</span></label>
                        <textarea id="override-reason-input" rows="2" class="w-full text-sm border border-amber-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-white" placeholder="Contoh: Sinkronisasi data resmi kampus semester ganjil 2026"></textarea>
                        <p class="text-[10px] text-gray-400 mt-1">Alasan wajib diisi (minimal 5 karakter) dan tercatat di riwayat impor serta log audit.</p>
                    </div>
                </div>
            </div>
            <div id="import-step-preview" class="flex-1 overflow-y-auto px-7 py-4 space-y-4 hidden">
                <div id="preview-summary" class="space-y-3" role="status" aria-live="polite"></div>
                <div id="preview-errors" class="space-y-2"></div>
            </div>
            <div id="import-step-history" class="flex-1 overflow-y-auto px-7 py-4 space-y-3 hidden">
                <div class="flex items-center justify-between gap-2">
                    <div class="relative">
                        <select id="history-status-filter" aria-label="Filter status riwayat impor" class="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 bg-white text-gray-600 cursor-pointer">
                            <option value="">Semua Status</option>
                            <option value="completed">Selesai</option>
                            <option value="validated">Tervalidasi</option>
                            <option value="failed">Gagal</option>
                        </select>
                        <span class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </span>
                    </div>
                </div>
                <div id="history-content" role="status" aria-live="polite"><p class="text-sm text-gray-400">Memuat riwayat impor...</p></div>
                <div id="history-pagination" class="hidden items-center justify-between pt-1">
                    <button id="history-prev" class="px-3 py-1.5 text-xs font-semibold border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Sebelumnya</button>
                    <span id="history-page-label" class="text-[11px] text-gray-400"></span>
                    <button id="history-next" class="px-3 py-1.5 text-xs font-semibold border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Berikutnya</button>
                </div>
            </div>
            <div class="border-t border-gray-100 px-7 py-5 flex items-center justify-end gap-3">
                <button id="cancel-import-btn" class="px-5 py-2.5 text-sm font-semibold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all">Batal</button>
                <button id="validate-import-btn" class="px-5 py-2.5 text-sm font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled>Validasi</button>
                <button id="confirm-import-btn" class="hidden px-5 py-2.5 text-sm font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Konfirmasi Impor</button>
                <button id="back-import-btn" class="hidden px-5 py-2.5 text-sm font-semibold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all">Kembali</button>
            </div>
        </div>
    `;

    requestAnimationFrame(() => { requestAnimationFrame(() => {
        const overlay = container.querySelector('.drawer-overlay') as HTMLElement;
        const panel = container.querySelector('.drawer-panel') as HTMLElement;
        if (overlay) overlay.style.opacity = '1';
        if (panel) panel.style.transform = 'translateX(0)';
    }); });

    container.querySelector('.drawer-overlay')?.addEventListener('click', closeDrawer);
    container.querySelector('#close-import-drawer')?.addEventListener('click', closeDrawer);
    container.querySelector('#cancel-import-btn')?.addEventListener('click', closeDrawer);

    // ── Template downloads (authenticated backend endpoints, no public path) ──
    const downloadTemplate = async (format: 'csv' | 'xlsx', btn: HTMLButtonElement) => {
        const original = btn.innerHTML;
        try {
            btn.disabled = true;
            btn.innerHTML = 'Menyiapkan...';
            const res = await apiFetch(`/api/super-admin/users/import-template?format=${format}`);
            if (!res.ok) throw new Error(String(res.status));
            downloadBlob(await res.blob(), TEMPLATE_FILES[format]);
        } catch (err) {
            console.error(err);
            showError('Template tidak dapat diunduh. Silakan coba lagi.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = original;
        }
    };
    const csvBtn = container.querySelector('#download-template-csv-btn') as HTMLButtonElement;
    const xlsxBtn = container.querySelector('#download-template-xlsx-btn') as HTMLButtonElement;
    csvBtn?.addEventListener('click', () => downloadTemplate('csv', csvBtn));
    xlsxBtn?.addEventListener('click', () => downloadTemplate('xlsx', xlsxBtn));

    // ── File selection ──
    const dropZone = container.querySelector('#drop-zone') as HTMLElement;
    const fileInput = container.querySelector('#import-file-input') as HTMLInputElement;
    const filePreview = container.querySelector('#file-preview') as HTMLElement;
    const fileNameEl = container.querySelector('#file-name') as HTMLElement;
    const fileSizeEl = container.querySelector('#file-size') as HTMLElement;
    const validateBtn = container.querySelector('#validate-import-btn') as HTMLButtonElement;
    const overrideCheckbox = container.querySelector('#override-existing-checkbox') as HTMLInputElement;

    const overrideReasonWrap = container.querySelector('#override-reason-wrap') as HTMLElement;
    const overrideReasonInput = container.querySelector('#override-reason-input') as HTMLTextAreaElement;

    const overrideReason = () => overrideReasonInput.value.trim();

    const updateValidateState = () => {
        validateBtn.disabled = !selectedFile
            || (overrideCheckbox.checked && overrideReason().length < 5);
    };

    overrideCheckbox.addEventListener('change', () => {
        overrideReasonWrap.classList.toggle('hidden', !overrideCheckbox.checked);
        if (overrideCheckbox.checked) overrideReasonInput.focus();
        updateValidateState();
    });
    overrideReasonInput.addEventListener('input', updateValidateState);

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const acceptFile = (file: File) => {
        if (!isAcceptedFile(file.name)) {
            showError(file.name.toLowerCase().endsWith('.xls')
                ? 'File .xls tidak didukung. Gunakan CSV atau Excel .xlsx.'
                : 'Hanya file CSV atau Excel .xlsx yang didukung.');
            return;
        }
        selectedFile = file;
        fileNameEl.textContent = file.name;
        fileSizeEl.textContent = formatFileSize(file.size);
        filePreview.classList.remove('hidden');
        dropZone.classList.add('hidden');
        updateValidateState();
    };

    const clearFile = () => {
        selectedFile = null;
        fileInput.value = '';
        filePreview.classList.add('hidden');
        dropZone.classList.remove('hidden');
        validateBtn.disabled = true;
    };

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('keydown', (e) => {
        if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
            e.preventDefault();
            fileInput.click();
        }
    });
    fileInput.addEventListener('change', () => { if (fileInput.files?.[0]) acceptFile(fileInput.files[0]); });
    container.querySelector('#remove-file-btn')?.addEventListener('click', clearFile);

    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('border-teal-400', 'bg-teal-50/50'); });
    dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('border-teal-400', 'bg-teal-50/50'); });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-teal-400', 'bg-teal-50/50');
        const file = (e as DragEvent).dataTransfer?.files?.[0];
        if (file) acceptFile(file);
    });

    // ── View switching ──
    const stepUpload = container.querySelector('#import-step-upload') as HTMLElement;
    const stepPreview = container.querySelector('#import-step-preview') as HTMLElement;
    const stepHistory = container.querySelector('#import-step-history') as HTMLElement;
    const confirmBtn = container.querySelector('#confirm-import-btn') as HTMLButtonElement;
    const backBtn = container.querySelector('#back-import-btn') as HTMLButtonElement;
    const cancelBtn = container.querySelector('#cancel-import-btn') as HTMLButtonElement;
    const previewSummary = container.querySelector('#preview-summary') as HTMLElement;
    const previewErrors = container.querySelector('#preview-errors') as HTMLElement;
    const subtitle = container.querySelector('#import-drawer-subtitle') as HTMLElement;

    const showView = (view: 'upload' | 'preview' | 'history') => {
        stepUpload.classList.toggle('hidden', view !== 'upload');
        stepPreview.classList.toggle('hidden', view !== 'preview');
        stepHistory.classList.toggle('hidden', view !== 'history');
        validateBtn.classList.toggle('hidden', view !== 'upload');
        cancelBtn.classList.toggle('hidden', view === 'preview');
        confirmBtn.classList.toggle('hidden', view !== 'preview');
        backBtn.classList.toggle('hidden', view === 'upload');
        subtitle.textContent = view === 'history'
            ? 'Riwayat impor data mahasiswa'
            : 'Unggah data resmi kampus agar akun mahasiswa dikenali sebelum login';
    };
    backBtn.addEventListener('click', () => showView('upload'));
    container.querySelector('#open-import-history')?.addEventListener('click', () => {
        historyPage = 1;
        showView('history');
        void loadHistory();
    });

    // ── Server-side error report (per batch) ──
    const downloadErrorReport = async (id: string, format: 'csv' | 'xlsx') => {
        try {
            const res = await apiFetch(`/api/super-admin/users/import-batches/${id}/errors?format=${format}`);
            if (!res.ok) {
                // Surface the server's own copy (e.g. retention expiry notice).
                let message = 'Laporan error tidak dapat diunduh. Silakan coba lagi.';
                try {
                    const data = await res.json();
                    if (data?.message) message = data.message;
                } catch { /* non-JSON error body — keep the fallback copy */ }
                showError(message);
                return;
            }
            downloadBlob(await res.blob(), `laporan_error_import_${id.slice(0, 8)}.${format}`);
        } catch (err) {
            console.error(err);
            showError('Laporan error tidak dapat diunduh. Silakan coba lagi.');
        }
    };

    // ── Dry-run ──
    validateBtn.addEventListener('click', async () => {
        if (!selectedFile) { showError('Pilih file CSV atau XLSX terlebih dahulu'); return; }
        if (overrideCheckbox.checked && overrideReason().length < 5) {
            showError('Alasan penggunaan mode perbarui data wajib diisi (minimal 5 karakter).');
            overrideReasonInput.focus();
            return;
        }
        validateBtn.disabled = true;
        validateBtn.innerHTML = 'Memvalidasi file...';
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('override_existing_active', overrideCheckbox.checked ? '1' : '0');
        if (overrideCheckbox.checked) formData.append('override_reason', overrideReason());
        try {
            const response = await apiFetch('/api/super-admin/users/validate-import', { method: 'POST', body: formData, isFormData: true });
            const result = await response.json();
            if (!response.ok) {
                showError(result.message || 'Validasi gagal. Periksa kembali file Anda.');
                return;
            }

            batchId = result.batch_id || '';
            fileHash = result.file_hash || '';
            summary = result.summary as ImportSummary;
            const invalidRows: InvalidRow[] = result.invalid_rows || [];

            previewSummary.innerHTML = `<h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Hasil Validasi</h3>
                <div class="grid grid-cols-5 gap-2">
                    <div class="bg-gray-50 rounded-xl p-2.5 text-center"><p class="text-xl font-bold text-gray-800">${escapeHtml(summary.total)}</p><p class="text-[9px] text-gray-500 uppercase font-semibold mt-1">Total</p></div>
                    <div class="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-center"><p class="text-xl font-bold text-emerald-600">${escapeHtml(summary.create)}</p><p class="text-[9px] text-emerald-600 uppercase font-semibold mt-1">Baru</p></div>
                    <div class="bg-sky-50 border border-sky-100 rounded-xl p-2.5 text-center"><p class="text-xl font-bold text-sky-600">${escapeHtml(summary.update)}</p><p class="text-[9px] text-sky-600 uppercase font-semibold mt-1">Diperbarui</p></div>
                    <div class="bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-center"><p class="text-xl font-bold text-gray-500">${escapeHtml(summary.skip)}</p><p class="text-[9px] text-gray-500 uppercase font-semibold mt-1">Dilewati</p></div>
                    <div class="bg-red-50 border border-red-100 rounded-xl p-2.5 text-center"><p class="text-xl font-bold text-red-500">${escapeHtml(summary.fail)}</p><p class="text-[9px] text-red-500 uppercase font-semibold mt-1">Perlu Diperbaiki</p></div>
                </div>
                ${overrideCheckbox.checked ? '<p class="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">Mode perbarui data aktif: perbedaan pada mahasiswa aktif akan diterapkan dari file.</p>' : ''}`;

            if (invalidRows.length > 0) {
                previewErrors.innerHTML = `<div class="flex items-center justify-between gap-2 flex-wrap">
                        <h4 class="text-xs font-bold text-red-600 uppercase tracking-wider">Baris yang Perlu Diperbaiki</h4>
                        <div class="flex items-center gap-2">
                            <button id="download-error-csv" class="text-xs text-teal-700 hover:text-teal-900 font-semibold hover:underline">Unduh Laporan (CSV)</button>
                            <button id="download-error-xlsx" class="text-xs text-teal-700 hover:text-teal-900 font-semibold hover:underline">Unduh Laporan (Excel)</button>
                        </div>
                    </div>
                    <p class="text-[11px] text-gray-500">Perbaiki baris berikut pada file Anda, lalu unggah ulang. Baris yang valid tetap dapat diimpor.</p>
                    <div class="max-h-[260px] overflow-y-auto space-y-2 pr-1">${invalidRows.map((r) => `<div class="bg-red-50 border border-red-100 rounded-xl p-3"><div class="flex items-center justify-between gap-2 mb-1"><span class="text-xs font-bold text-red-700">Baris ${escapeHtml(r.row)}</span><span class="text-[10px] text-red-400 font-mono truncate">${escapeHtml(r.data?.email || r.data?.nim || '-')}</span></div><ul class="space-y-0.5">${r.errors.map((e: string) => `<li class="text-[11px] text-red-600 flex items-start gap-1.5"><span class="text-red-400 mt-0.5">&bull;</span> ${escapeHtml(e)}</li>`).join('')}</ul></div>`).join('')}</div>
                    ${result.invalid_rows_truncated ? '<p class="text-[11px] text-gray-400">Sebagian baris tidak ditampilkan. Unduh laporan untuk daftar lengkap.</p>' : ''}`;
                container.querySelector('#download-error-csv')?.addEventListener('click', () => downloadErrorReport(batchId, 'csv'));
                container.querySelector('#download-error-xlsx')?.addEventListener('click', () => downloadErrorReport(batchId, 'xlsx'));
            } else {
                previewErrors.innerHTML = `<div class="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-emerald-500 shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><p class="text-sm text-emerald-700 font-medium">Semua baris valid dan siap diimpor.</p></div>`;
            }

            const importable = summary.create + summary.update + summary.skip;
            confirmBtn.disabled = importable === 0;
            confirmBtn.textContent = importable > 0 ? `Konfirmasi Impor (${importable} baris)` : 'Tidak ada data valid';
            showView('preview');
        } catch (err) {
            console.error(err);
            showError('Server tidak dapat dihubungi. Periksa koneksi Anda lalu coba lagi.');
        } finally {
            validateBtn.innerHTML = 'Validasi';
            updateValidateState();
        }
    });

    // ── Confirmation modal + import ──
    const openConfirmModal = () => {
        if (!selectedFile || !summary) return;
        const existing = container.querySelector('#import-confirm-modal');
        existing?.remove();

        const modal = document.createElement('div');
        modal.id = 'import-confirm-modal';
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black/50 z-[210] flex items-center justify-center p-6">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" role="alertdialog" aria-label="Konfirmasi impor" aria-describedby="confirm-import-desc">
                    <h3 class="text-lg font-bold text-gray-900">Konfirmasi Impor</h3>
                    <div id="confirm-import-desc" class="space-y-2 text-sm text-gray-600">
                        <p>File <span class="font-semibold text-gray-800">${escapeHtml(selectedFile.name)}</span> akan diproses:</p>
                        <ul class="space-y-1 text-sm">
                            <li>&bull; <span class="font-semibold text-emerald-600">${escapeHtml(summary.create)}</span> akun mahasiswa baru dibuat</li>
                            <li>&bull; <span class="font-semibold text-sky-600">${escapeHtml(summary.update)}</span> akun diperbarui</li>
                            <li>&bull; <span class="font-semibold text-gray-500">${escapeHtml(summary.skip)}</span> baris dilewati (data sudah sesuai)</li>
                            ${summary.fail > 0 ? `<li>&bull; <span class="font-semibold text-red-500">${escapeHtml(summary.fail)}</span> baris tidak akan diimpor (perlu diperbaiki)</li>` : ''}
                        </ul>
                        <p class="text-[11px] ${overrideCheckbox.checked ? 'text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2' : 'text-gray-400'}">${overrideCheckbox.checked
                            ? `Mode perbarui data aktif: perbedaan pada mahasiswa aktif akan diterapkan dan tercatat di riwayat impor.<br>Alasan: ${escapeHtml(overrideReason())}`
                            : 'Data mahasiswa aktif yang berbeda dari file tidak akan diubah.'}</p>
                    </div>
                    <div class="flex items-center justify-end gap-3 pt-1">
                        <button id="confirm-modal-cancel" class="px-4 py-2 text-sm font-semibold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all">Batal</button>
                        <button id="confirm-modal-proceed" class="px-4 py-2 text-sm font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-xl transition-all">Ya, Impor Sekarang</button>
                    </div>
                </div>
            </div>`;
        container.appendChild(modal);

        modal.querySelector('#confirm-modal-cancel')?.addEventListener('click', () => {
            modal.remove();
            confirmBtn.focus();
        });
        modal.querySelector('#confirm-modal-proceed')?.addEventListener('click', async () => {
            modal.remove();
            await runImport();
        });

        // Keep keyboard focus inside the confirmation dialog.
        modal.addEventListener('keydown', (e) => {
            const event = e as KeyboardEvent;
            if (event.key !== 'Tab') return;
            const buttons = modal.querySelectorAll<HTMLButtonElement>('button');
            const first = buttons[0];
            const last = buttons[buttons.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });

        (modal.querySelector('#confirm-modal-proceed') as HTMLButtonElement)?.focus();
    };

    // Escape closes the confirmation dialog first, then the drawer itself.
    const escHandler = (e: KeyboardEvent) => {
        if (e.key !== 'Escape') return;
        const modal = container.querySelector('#import-confirm-modal');
        if (modal) {
            modal.remove();
            confirmBtn.focus();
            return;
        }
        document.removeEventListener('keydown', escHandler);
        closeDrawer();
    };
    document.addEventListener('keydown', escHandler);

    const runImport = async () => {
        if (!selectedFile) return;
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = 'Mengimpor data mahasiswa...';
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('batch_id', batchId);
        formData.append('file_hash', fileHash);
        try {
            const response = await apiFetch('/api/super-admin/users/bulk-import', { method: 'POST', body: formData, isFormData: true });
            const result = await response.json();
            if (response.ok) {
                const s = result.summary || {};
                let msg = `Impor selesai: ${s.created ?? 0} dibuat, ${s.updated ?? 0} diperbarui, ${s.skipped ?? 0} dilewati`;
                if ((s.failed ?? 0) > 0) msg += `, ${s.failed} gagal`;
                showSuccess(msg);
                if (result.drift_note) showInfo(result.drift_note);
                closeDrawer();
                onRefresh();
            } else {
                showError(result.message || 'Impor tidak dapat diproses. Silakan validasi ulang file.');
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = 'Konfirmasi Impor';
            }
        } catch (err) {
            console.error(err);
            showError('Server tidak dapat dihubungi. Periksa koneksi Anda lalu coba lagi.');
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = 'Konfirmasi Impor';
        }
    };

    confirmBtn.addEventListener('click', openConfirmModal);

    // ── Import history (server-side batches) ──
    const historyContent = container.querySelector('#history-content') as HTMLElement;
    const historyStatusFilter = container.querySelector('#history-status-filter') as HTMLSelectElement;
    const historyPagination = container.querySelector('#history-pagination') as HTMLElement;
    const historyPrev = container.querySelector('#history-prev') as HTMLButtonElement;
    const historyNext = container.querySelector('#history-next') as HTMLButtonElement;
    const historyPageLabel = container.querySelector('#history-page-label') as HTMLElement;

    const loadHistory = async () => {
        historyContent.innerHTML = '<p class="text-sm text-gray-400">Memuat riwayat impor...</p>';
        historyPagination.classList.add('hidden');
        try {
            const status = historyStatusFilter?.value || '';
            const res = await apiFetch(`/api/super-admin/users/import-batches?per_page=10&page=${historyPage}${status ? `&status=${status}` : ''}`);
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || String(res.status));
            const batches: any[] = result.data || [];
            const meta = result.meta || { current_page: 1, last_page: 1 };

            if (batches.length === 0) {
                historyContent.innerHTML = status
                    ? '<p class="text-sm text-gray-400">Tidak ada riwayat impor dengan status tersebut.</p>'
                    : '<p class="text-sm text-gray-400">Belum ada riwayat impor.</p>';
                return;
            }

            if (meta.last_page > 1) {
                historyPagination.classList.remove('hidden');
                historyPagination.classList.add('flex');
                historyPageLabel.textContent = `Halaman ${meta.current_page} dari ${meta.last_page}`;
                historyPrev.disabled = meta.current_page <= 1;
                historyNext.disabled = meta.current_page >= meta.last_page;
            }

            historyContent.innerHTML = batches.map((b) => {
                const statusColor = b.status === 'completed' ? 'bg-emerald-100 text-emerald-700'
                    : b.status === 'failed' ? 'bg-red-100 text-red-600'
                    : b.status === 'validated' ? 'bg-sky-100 text-sky-700'
                    : 'bg-gray-100 text-gray-500';
                const date = b.created_at ? new Date(b.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-';
                return `<div class="border border-gray-100 rounded-xl p-3.5 space-y-2">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                        <p class="text-sm font-semibold text-gray-800 truncate">${escapeHtml(b.original_filename || '-')}</p>
                        <span class="text-[10px] font-semibold px-2 py-0.5 rounded-md ${statusColor}">${escapeHtml(statusLabel(b.status))}</span>
                    </div>
                    <p class="text-[11px] text-gray-400">${escapeHtml(date)} &bull; ${escapeHtml((b.source_format || '').toUpperCase())} &bull; oleh ${escapeHtml(b.uploaded_by || '-')}${b.override_existing_active ? ' &bull; <span class="text-amber-600 font-semibold">mode perbarui</span>' : ''}</p>
                    ${b.override_reason ? `<p class="text-[11px] text-amber-700 bg-amber-50 rounded-lg px-2 py-1">Alasan perbarui: ${escapeHtml(b.override_reason)}</p>` : ''}
                    <p class="text-[11px] text-gray-500">${escapeHtml(b.total_rows)} baris &bull; ${escapeHtml(b.created_count)} dibuat &bull; ${escapeHtml(b.updated_count)} diperbarui &bull; ${escapeHtml(b.skipped_count)} dilewati &bull; ${escapeHtml(b.status === 'completed' ? b.failed_count : b.invalid_rows)} error</p>
                    ${b.has_error_report ? `<div class="flex items-center gap-2">
                        <button data-batch="${escapeHtml(b.batch_id)}" data-format="csv" class="history-error-btn text-[11px] text-teal-700 hover:text-teal-900 font-semibold hover:underline">Laporan Error (CSV)</button>
                        <button data-batch="${escapeHtml(b.batch_id)}" data-format="xlsx" class="history-error-btn text-[11px] text-teal-700 hover:text-teal-900 font-semibold hover:underline">Laporan Error (Excel)</button>
                    </div>` : ''}
                    ${b.error_report_expired ? '<p class="text-[11px] text-gray-400 italic">Laporan error sudah melewati masa penyimpanan.</p>' : ''}
                </div>`;
            }).join('');

            historyContent.querySelectorAll('.history-error-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const id = (btn as HTMLElement).dataset.batch || '';
                    const format = ((btn as HTMLElement).dataset.format || 'csv') as 'csv' | 'xlsx';
                    if (id) void downloadErrorReport(id, format);
                });
            });
        } catch (err) {
            console.error(err);
            historyContent.innerHTML = '<p class="text-sm text-red-500">Riwayat impor tidak dapat dimuat. Silakan coba lagi.</p>';
        }
    };

    historyStatusFilter?.addEventListener('change', () => {
        historyPage = 1;
        void loadHistory();
    });
    historyPrev?.addEventListener('click', () => {
        if (historyPage > 1) {
            historyPage--;
            void loadHistory();
        }
    });
    historyNext?.addEventListener('click', () => {
        historyPage++;
        void loadHistory();
    });
}
