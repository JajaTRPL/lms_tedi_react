import { renderDashboardLayout } from '../../dashboard/DashboardLayout';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString();

interface TemplateInfo {
    name: string;
    pdfUrl: string;
}

interface TextItem {
    str: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontName: string;
}

const extractHtmlFromPdf = async (url: string): Promise<string> => {
    try {
        const pdf = await pdfjsLib.getDocument(url).promise;
        let fullHtml = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const viewport = page.getViewport({ scale: 1.0 });
            const pageHeight = viewport.height;

            const items: TextItem[] = [];
            for (const item of textContent.items as any[]) {
                if (!item.str || item.str.trim() === '') continue;
                const tx = item.transform;
                items.push({
                    str: item.str,
                    x: tx[4],
                    y: pageHeight - tx[5],
                    width: item.width,
                    height: Math.abs(tx[3]) || Math.abs(tx[0]) || 12,
                    fontName: item.fontName || ''
                });
            }

            if (items.length === 0) continue;

            // Sort top-to-bottom, left-to-right
            items.sort((a, b) => a.y - b.y || a.x - b.x);

            // Group into rows by Y-position
            const avgHeight = items.reduce((s, it) => s + it.height, 0) / items.length;
            const rowThreshold = avgHeight * 0.5;

            const rows: TextItem[][] = [];
            let currentRow: TextItem[] = [items[0]];
            let currentY = items[0].y;

            for (let j = 1; j < items.length; j++) {
                const item = items[j];
                if (Math.abs(item.y - currentY) <= rowThreshold) {
                    currentRow.push(item);
                } else {
                    rows.push(currentRow);
                    const gap = item.y - currentY;
                    if (gap > avgHeight * 1.8) {
                        const emptyLines = Math.min(Math.floor(gap / avgHeight) - 1, 3);
                        for (let k = 0; k < emptyLines; k++) {
                            rows.push([]);
                        }
                    }
                    currentRow = [item];
                    currentY = item.y;
                }
            }
            rows.push(currentRow);

            // Detect left margin
            const allX = items.map(it => it.x);
            const minX = Math.min(...allX);

            // Build HTML per row
            let pageHtml = '';
            for (const row of rows) {
                if (row.length === 0) {
                    pageHtml += '<p><br></p>';
                    continue;
                }

                row.sort((a, b) => a.x - b.x);

                const maxFontSize = Math.max(...row.map(it => it.height));
                const isHeading = maxFontSize > avgHeight * 1.3;
                const isBold = row.some(it => it.fontName.toLowerCase().includes('bold'));

                // Build row text preserving horizontal spacing
                let rowText = '';
                const indent = Math.max(0, Math.round((row[0].x - minX) / 8));

                for (let j = 0; j < row.length; j++) {
                    const item = row[j];
                    if (j > 0) {
                        const prev = row[j - 1];
                        const gap = item.x - (prev.x + prev.width);
                        const spaceWidth = avgHeight * 0.3;

                        if (gap > spaceWidth * 8) {
                            const tabCount = Math.min(Math.round(gap / (spaceWidth * 4)), 6);
                            rowText += '\u00A0'.repeat(tabCount * 4);
                        } else if (gap > spaceWidth * 0.5) {
                            rowText += ' ';
                        }
                    }
                    rowText += item.str;
                }

                const indentStyle = indent > 2 ? ` style="padding-left: ${indent * 4}px"` : '';

                if (isHeading && maxFontSize > avgHeight * 1.6) {
                    pageHtml += `<h1${indentStyle}>${isBold ? `<strong>${rowText}</strong>` : rowText}</h1>`;
                } else if (isHeading) {
                    pageHtml += `<h2${indentStyle}>${isBold ? `<strong>${rowText}</strong>` : rowText}</h2>`;
                } else if (isBold) {
                    pageHtml += `<p${indentStyle}><strong>${rowText}</strong></p>`;
                } else {
                    pageHtml += `<p${indentStyle}>${rowText}</p>`;
                }
            }

            if (i < pdf.numPages) {
                pageHtml += '<p><br></p><p>───────────────────────────────────────</p><p><br></p>';
            }

            fullHtml += pageHtml;
        }

        return fullHtml;
    } catch (error) {
        console.error('Error extracting PDF:', error);
        return '';
    }
};

export const renderTemplateEditBeasiswa = async (template: TemplateInfo) => {
    const content = `
        <div class="animate-fade-in pb-12">
            <!-- Loading State -->
            <div id="editor-loading" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center gap-3">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
                <p class="text-sm text-gray-500 font-medium">Memuat konten dokumen...</p>
            </div>

            <!-- Editor Card (hidden until loaded) -->
            <div id="editor-wrapper" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hidden">
                <div id="quill-editor" style="min-height: 550px;"></div>
            </div>

            <!-- Bottom Action Bar -->
            <div class="flex items-center justify-end gap-3 mt-5">
                <button id="btn-cancel-edit" class="px-6 py-2.5 border-2 border-teal-600 text-teal-600 text-sm font-bold rounded-xl hover:bg-teal-50 active:scale-95 transition-all">
                    Batal
                </button>
                <button id="btn-save-edit" class="px-6 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700 active:scale-95 transition-all shadow-sm">
                    Simpan Perubahan
                </button>
            </div>
        </div>
    `;

    renderDashboardLayout('Edit Surat', content, 'super_admin', 'template');

    // Replace header title with back button
    const headerTitle = document.querySelector('header h1');
    if (headerTitle) {
        headerTitle.innerHTML = `
            <button id="btn-back-edit" class="inline-flex items-center gap-3 group">
                <span class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </span>
                <span>Edit Surat</span>
            </button>
        `;
        document.getElementById('btn-back-edit')?.addEventListener('click', () => {
            navigateBackToDetail(template);
        });
    }

    // Inject custom Quill styles
    injectEditorStyles();

    // Initialize Quill
    const quill = new Quill('#quill-editor', {
        theme: 'snow',
        placeholder: 'Tulis konten template di sini...',
        modules: {
            toolbar: [
                [{ 'font': [] }, { 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'align': [] }],
                ['link', 'image', 'formula'],
                ['clean']
            ]
        }
    });

    // Extract structured HTML from PDF and load into editor
    const pdfHtml = await extractHtmlFromPdf(template.pdfUrl);

    const loadingEl = document.getElementById('editor-loading');
    const wrapperEl = document.getElementById('editor-wrapper');
    if (loadingEl) loadingEl.classList.add('hidden');
    if (wrapperEl) wrapperEl.classList.remove('hidden');

    if (pdfHtml) {
        quill.clipboard.dangerouslyPasteHTML(pdfHtml);
        quill.setSelection(0, 0); // Move cursor to top
    } else {
        quill.setText('Gagal memuat konten PDF. Silakan tulis konten template di sini.');
    }

    // Cancel button
    document.getElementById('btn-cancel-edit')?.addEventListener('click', () => {
        navigateBackToDetail(template);
    });

    // Save button
    document.getElementById('btn-save-edit')?.addEventListener('click', () => {
        // TODO: Save to backend
        const _content = quill.root.innerHTML;
        void _content;
        import('toastify-js').then((Toastify) => {
            Toastify.default({
                text: "Perubahan berhasil disimpan!",
                duration: 2000,
                gravity: "top",
                position: "right",
                style: { background: "#10B981" }
            }).showToast();
        });

        setTimeout(() => {
            navigateBackToDetail(template);
        }, 1000);
    });
};

const navigateBackToDetail = (template: TemplateInfo) => {
    import('./TemplateDetailBeasiswa').then(({ renderTemplateDetail }) => {
        renderTemplateDetail({
            name: template.name,
            pdfUrl: template.pdfUrl,
            pageInfo: ''
        });
    });
};

const injectEditorStyles = () => {
    if (document.getElementById('quill-custom-styles')) return;
    const style = document.createElement('style');
    style.id = 'quill-custom-styles';
    style.textContent = `
        .ql-toolbar.ql-snow {
            border: none !important;
            border-bottom: 1px solid #f3f4f6 !important;
            padding: 12px 16px !important;
            background: #fafafa;
            font-family: 'Inter', sans-serif !important;
        }
        .ql-container.ql-snow {
            border: none !important;
            font-family: 'Inter', sans-serif !important;
            font-size: 14px;
        }
        .ql-editor {
            padding: 32px 40px !important;
            line-height: 1.8;
            color: #1f2937;
            min-height: 550px;
        }
        .ql-editor p {
            margin-bottom: 2px;
        }
        .ql-editor h1 {
            font-size: 1.4em;
            margin-bottom: 4px;
        }
        .ql-editor h2 {
            font-size: 1.15em;
            margin-bottom: 4px;
        }
        .ql-editor.ql-blank::before {
            color: #9ca3af;
            font-style: italic;
            left: 40px;
        }
        .ql-snow .ql-picker-label {
            font-size: 13px;
            font-weight: 600;
            color: #374151;
        }
        .ql-snow .ql-stroke {
            stroke: #6b7280;
        }
        .ql-snow .ql-fill {
            fill: #6b7280;
        }
        .ql-snow button:hover .ql-stroke {
            stroke: #0d9488 !important;
        }
        .ql-snow button:hover .ql-fill {
            fill: #0d9488 !important;
        }
        .ql-snow button.ql-active .ql-stroke {
            stroke: #0d9488 !important;
        }
        .ql-snow button.ql-active .ql-fill {
            fill: #0d9488 !important;
        }
        .ql-snow .ql-picker-label:hover {
            color: #0d9488 !important;
        }
        .ql-snow .ql-picker-item:hover {
            color: #0d9488 !important;
        }
        .ql-toolbar .ql-formats {
            margin-right: 12px !important;
        }
    `;
    document.head.appendChild(style);
};
