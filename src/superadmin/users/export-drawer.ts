import { closeDrawer, getOrCreateDrawerRoot } from './drawer-utils';
import { apiFetch } from '../../shared/api-client';
import { showSuccess, showError, showInfo } from '../../shared/toast';

export function renderExportDrawer() {
    const container = getOrCreateDrawerRoot();
    container.innerHTML = `
        <div class="drawer-overlay fixed inset-0 bg-black/40 z-[200]" style="opacity:0; transition: opacity 0.3s ease;"></div>
        <div class="drawer-panel fixed top-0 right-0 h-full w-[420px] bg-white z-[201] flex flex-col shadow-2xl" style="transform: translateX(100%); transition: transform 0.3s ease;">
            <div class="flex items-start justify-between px-7 pt-8 pb-4">
                <div>
                    <h2 class="text-xl font-bold text-gray-900">Ekspor Data Pengguna</h2>
                    <p class="text-sm text-gray-500 mt-1">Unduh data pengguna dalam format file</p>
                </div>
                <button id="close-export-drawer" class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all mt-0.5">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div class="flex-1 overflow-y-auto px-7 py-4 space-y-5">
                <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider">Jenis Pengguna</label>
                    <div class="relative">
                        <select id="export-user-type" class="w-full appearance-none px-4 py-2.5 pr-10 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white text-gray-700 cursor-pointer">
                            <option value="">Semua Pengguna</option>
                            <option value="mahasiswa">Mahasiswa</option>
                            <option value="tendik">Tendik</option>
                            <option value="akademik">Akademik</option>
                        </select>
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </span>
                    </div>
                </div>
                <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider">Format File</label>
                    <div class="relative">
                        <select id="export-format" class="w-full appearance-none px-4 py-2.5 pr-10 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white text-gray-700 cursor-pointer">
                            <option value="xlsx">Excel (.xlsx)</option>
                            <option id="opt-csv" value="csv">CSV (.csv)</option>
                        </select>
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </span>
                    </div>
                </div>
                <div class="bg-gray-50 rounded-xl p-4 space-y-2">
                    <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Kolom yang Diekspor</p>
                    <p class="text-xs text-gray-500 leading-relaxed">Nama, Email, NIM, Kode Prodi, Program Studi, Departemen, Fakultas, Angkatan, Role, Jabatan, Status, Dibuat Pada</p>
                    <p class="text-[10px] text-gray-400">Password, token, dan data keamanan akun tidak pernah diekspor.</p>
                </div>
                <div class="bg-amber-50 border border-amber-100 rounded-xl p-3.5 space-y-2.5">
                    <label class="flex items-start gap-2.5 cursor-pointer">
                        <input type="checkbox" id="export-include-pii" class="mt-0.5 accent-teal-700">
                        <span class="min-w-0">
                            <span class="block text-sm font-semibold text-gray-700">Sertakan data pribadi tambahan</span>
                            <span class="block text-[11px] leading-relaxed text-amber-700 mt-0.5">Menambahkan kolom Tanggal Lahir. Data pribadi hanya boleh diekspor untuk kebutuhan administrasi yang sah.</span>
                        </span>
                    </label>
                    <div id="export-reason-wrap" class="hidden">
                        <label for="export-reason-input" class="block text-xs font-semibold text-gray-600 mb-1">Alasan ekspor data pribadi <span class="text-red-500" aria-hidden="true">*</span></label>
                        <textarea id="export-reason-input" rows="2" class="w-full text-sm border border-amber-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-white" placeholder="Contoh: Rekap administrasi beasiswa fakultas"></textarea>
                        <p class="text-[10px] text-gray-400 mt-1">Alasan wajib diisi (minimal 5 karakter) dan tercatat di log audit.</p>
                    </div>
                </div>
            </div>
            <div class="border-t border-gray-100 px-7 py-5 flex items-center justify-end gap-3">
                <button id="cancel-export-btn" class="px-5 py-2.5 text-sm font-semibold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all">Batal</button>
                <button id="confirm-export-btn" class="px-5 py-2.5 text-sm font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-xl transition-all shadow-sm flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Ekspor
                </button>
            </div>
        </div>
    `;

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const overlay = container.querySelector('.drawer-overlay') as HTMLElement;
            const panel = container.querySelector('.drawer-panel') as HTMLElement;
            if (overlay) overlay.style.opacity = '1';
            if (panel) panel.style.transform = 'translateX(0)';
        });
    });

    container.querySelector('.drawer-overlay')?.addEventListener('click', closeDrawer);
    container.querySelector('#close-export-drawer')?.addEventListener('click', closeDrawer);
    container.querySelector('#cancel-export-btn')?.addEventListener('click', closeDrawer);

    const userTypeSelect = container.querySelector('#export-user-type') as HTMLSelectElement;
    const formatSelect = container.querySelector('#export-format') as HTMLSelectElement;
    const optCsv = container.querySelector('#opt-csv') as HTMLOptionElement;
    const piiCheckbox = container.querySelector('#export-include-pii') as HTMLInputElement;
    const reasonWrap = container.querySelector('#export-reason-wrap') as HTMLElement;
    const reasonInput = container.querySelector('#export-reason-input') as HTMLTextAreaElement;
    const exportBtn = container.querySelector('#confirm-export-btn') as HTMLButtonElement;

    const exportReason = () => reasonInput.value.trim();

    // PII export requires a stated, audited reason before the button unlocks.
    const updateExportState = () => {
        exportBtn.disabled = piiCheckbox.checked && exportReason().length < 5;
    };

    piiCheckbox?.addEventListener('change', () => {
        reasonWrap.classList.toggle('hidden', !piiCheckbox.checked);
        if (piiCheckbox.checked) reasonInput.focus();
        updateExportState();
    });
    reasonInput?.addEventListener('input', updateExportState);

    const updateFormatOptions = () => {
        if (userTypeSelect.value === '') {
            optCsv.disabled = true;
            if (formatSelect.value === 'csv') formatSelect.value = 'xlsx';
        } else {
            optCsv.disabled = false;
        }
    };

    userTypeSelect?.addEventListener('change', () => {
        updateFormatOptions();
        if (userTypeSelect.value === '') {
            showInfo('Multi-sheet hanya tersedia dalam format Excel');
        }
    });

    updateFormatOptions();

    container.querySelector('#confirm-export-btn')?.addEventListener('click', async () => {
        const format = (container.querySelector('#export-format') as HTMLSelectElement)?.value || 'xlsx';
        const userType = (container.querySelector('#export-user-type') as HTMLSelectElement)?.value || '';
        const includePii = piiCheckbox?.checked === true;

        if (includePii && exportReason().length < 5) {
            showError('Alasan ekspor data pribadi wajib diisi (minimal 5 karakter).');
            reasonInput.focus();
            return;
        }

        const piiParams = includePii
            ? `&include_pii=1&export_reason=${encodeURIComponent(exportReason())}`
            : '';
        const url = `/api/super-admin/users/export?format=${format}${userType ? '&role=' + userType : ''}${piiParams}`;

        const btn = container.querySelector('#confirm-export-btn') as HTMLButtonElement;
        const originalText = btn.innerHTML;

        try {
            btn.disabled = true;
            btn.innerHTML = 'Menyiapkan file ekspor...';

            const response = await apiFetch(url);

            if (!response.ok) throw new Error(`Export failed with status ${response.status}`);

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `users_export_${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 500);

            showSuccess('Data berhasil diunduh');
            closeDrawer();
        } catch (error: any) {
            console.error(error);
            showError(`Gagal mengunduh data: ${error.message}`);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
            updateExportState();
        }
    });
}
