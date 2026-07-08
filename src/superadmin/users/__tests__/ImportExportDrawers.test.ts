// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  apiFetch: vi.fn(),
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showInfo: vi.fn(),
}))

vi.mock('../../../shared/api-client', () => ({
  apiFetch: mocks.apiFetch,
}))

vi.mock('../../../shared/toast', () => ({
  showSuccess: mocks.showSuccess,
  showError: mocks.showError,
  showInfo: mocks.showInfo,
}))

import { renderImportDrawer } from '../import-drawer'
import { renderExportDrawer } from '../export-drawer'

const flushAsync = async () => {
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
}

const selectFile = (name: string) => {
  const input = document.getElementById('import-file-input') as HTMLInputElement
  const file = new File(['name,email,nim,study_program_code,tanggal_lahir'], name, { type: 'text/csv' })
  Object.defineProperty(input, 'files', { value: [file], configurable: true })
  input.dispatchEvent(new Event('change'))
  return file
}

const validationResponse = {
  batch_id: 'batch-uuid-1',
  file_hash: 'hash-1',
  template_version: 'v2',
  source_format: 'csv',
  summary: { total: 4, valid: 3, invalid: 1, create: 2, update: 1, skip: 0, fail: 1 },
  valid_rows: [],
  invalid_rows: [
    {
      row: 2,
      data: { name: '<img src=x onerror=alert(1)>', email: 'salah@gmail.com', nim: '24/1/SV/1' },
      errors: [
        'Email harus menggunakan domain UGM (@mail.ugm.ac.id atau @ugm.ac.id).',
        '<script>alert(1)</script>',
      ],
    },
  ],
  invalid_rows_truncated: false,
}

beforeEach(() => {
  document.body.innerHTML = ''
  localStorage.setItem('auth_role_level', 'primary')
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0)
    return 0
  })
  window.URL.createObjectURL = vi.fn(() => 'blob:test')
  window.URL.revokeObjectURL = vi.fn()
  mocks.apiFetch.mockReset()
  mocks.showSuccess.mockReset()
  mocks.showError.mockReset()
  mocks.showInfo.mockReset()
})

describe('Import drawer (verified Mahasiswa)', () => {
  it('renders CSV/XLSX template buttons, guidance, accessible upload, and override default OFF', () => {
    renderImportDrawer(vi.fn())

    expect(document.getElementById('download-template-csv-btn')?.textContent).toContain('Template CSV')
    expect(document.getElementById('download-template-xlsx-btn')?.textContent).toContain('Template Excel')
    expect(document.body.textContent).toContain('Gunakan template resmi agar kolom dan format data sesuai.')
    expect(document.body.textContent).toContain('Menggunakan Google Sheets?')
    expect(document.body.textContent).toContain('.xls tidak didukung')

    const input = document.getElementById('import-file-input') as HTMLInputElement
    expect(input.accept).toBe('.csv,.xlsx')
    expect(input.getAttribute('aria-label')).toBe('Pilih file CSV atau XLSX')

    const dropZone = document.getElementById('drop-zone')!
    expect(dropZone.getAttribute('role')).toBe('button')
    expect(dropZone.getAttribute('tabindex')).toBe('0')

    const override = document.getElementById('override-existing-checkbox') as HTMLInputElement
    expect(override.checked).toBe(false)
    expect(override.disabled).toBe(false)
    expect(document.body.textContent).toContain('Perbarui data mahasiswa aktif jika berbeda dari file')
    expect(document.body.textContent).toContain('Gunakan hanya jika file resmi kampus memang menjadi acuan terbaru.')

    // Reason field only appears once override is enabled.
    expect(document.getElementById('override-reason-wrap')!.classList.contains('hidden')).toBe(true)
    override.checked = true
    override.dispatchEvent(new Event('change'))
    expect(document.getElementById('override-reason-wrap')!.classList.contains('hidden')).toBe(false)
    expect(document.body.textContent).toContain('Alasan penggunaan mode perbarui data')
  })

  it('disables the override option for secondary Super Admins', () => {
    localStorage.setItem('auth_role_level', 'secondary')
    renderImportDrawer(vi.fn())

    const override = document.getElementById('override-existing-checkbox') as HTMLInputElement
    expect(override.disabled).toBe(true)
    expect(document.body.textContent).toContain('Hanya Primary Super Admin yang dapat menggunakan mode ini.')
  })

  it('requires an override reason before validation and sends it to the backend', async () => {
    mocks.apiFetch.mockResolvedValue({ ok: true, json: async () => validationResponse })
    renderImportDrawer(vi.fn())

    selectFile('students.csv')
    const override = document.getElementById('override-existing-checkbox') as HTMLInputElement
    override.checked = true
    override.dispatchEvent(new Event('change'))

    const validateBtn = document.getElementById('validate-import-btn') as HTMLButtonElement
    expect(validateBtn.disabled).toBe(true)

    const reason = document.getElementById('override-reason-input') as HTMLTextAreaElement
    reason.value = 'Sinkronisasi data resmi kampus.'
    reason.dispatchEvent(new Event('input'))
    expect(validateBtn.disabled).toBe(false)

    validateBtn.click()
    await flushAsync()

    const body = mocks.apiFetch.mock.calls[0][1].body as FormData
    expect(body.get('override_existing_active')).toBe('1')
    expect(body.get('override_reason')).toBe('Sinkronisasi data resmi kampus.')
  })

  it('downloads templates from the authenticated backend endpoint', async () => {
    mocks.apiFetch.mockResolvedValue({ ok: true, blob: async () => new Blob(['x']) })
    renderImportDrawer(vi.fn())

    document.getElementById('download-template-xlsx-btn')?.click()
    await flushAsync()

    expect(mocks.apiFetch).toHaveBeenCalledWith('/api/super-admin/users/import-template?format=xlsx')
  })

  it('rejects .xls files with a human message and keeps Validasi disabled', () => {
    renderImportDrawer(vi.fn())

    selectFile('legacy.xls')

    expect(mocks.showError).toHaveBeenCalledWith('File .xls tidak didukung. Gunakan CSV atau Excel .xlsx.')
    expect((document.getElementById('validate-import-btn') as HTMLButtonElement).disabled).toBe(true)
  })

  it('shows create/update/skip/fail summary and escaped row errors after dry-run', async () => {
    mocks.apiFetch.mockResolvedValue({ ok: true, json: async () => validationResponse })
    renderImportDrawer(vi.fn())

    selectFile('students.csv')
    document.getElementById('validate-import-btn')?.click()
    await flushAsync()

    const validateBody = mocks.apiFetch.mock.calls[0][1].body as FormData
    expect(validateBody.get('override_existing_active')).toBe('0')

    const summaryText = document.getElementById('preview-summary')!.textContent
    expect(summaryText).toContain('Baru')
    expect(summaryText).toContain('Diperbarui')
    expect(summaryText).toContain('Dilewati')
    expect(summaryText).toContain('Perlu Diperbaiki')

    const errors = document.getElementById('preview-errors')!
    expect(errors.textContent).toContain('Email harus menggunakan domain UGM')
    // Untrusted values must be escaped, never parsed as markup.
    expect(errors.querySelector('img')).toBeNull()
    expect(errors.querySelector('script')).toBeNull()
    expect(errors.textContent).toContain('<script>alert(1)</script>')

    // Server-side error report buttons target the batch endpoint.
    expect(document.getElementById('download-error-csv')).not.toBeNull()
    expect(document.getElementById('download-error-xlsx')).not.toBeNull()

    const confirmBtn = document.getElementById('confirm-import-btn') as HTMLButtonElement
    expect(confirmBtn.disabled).toBe(false)
    expect(confirmBtn.textContent).toContain('3 baris')
  })

  it('confirms through a modal and sends batch_id + file_hash on import', async () => {
    const onRefresh = vi.fn()
    mocks.apiFetch.mockImplementation(async (url: string) => {
      if (url.includes('validate-import')) {
        return { ok: true, json: async () => validationResponse }
      }
      return {
        ok: true,
        json: async () => ({ summary: { created: 2, updated: 1, skipped: 0, failed: 1 } }),
      }
    })
    renderImportDrawer(onRefresh)

    selectFile('students.csv')
    document.getElementById('validate-import-btn')?.click()
    await flushAsync()

    document.getElementById('confirm-import-btn')?.click()
    const modal = document.getElementById('import-confirm-modal')!
    expect(modal.textContent).toContain('students.csv')
    expect(modal.textContent).toContain('akun mahasiswa baru dibuat')
    expect(modal.textContent).toContain('Data mahasiswa aktif yang berbeda dari file tidak akan diubah.')

    ;(modal.querySelector('#confirm-modal-proceed') as HTMLButtonElement).click()
    await flushAsync()

    const importCall = mocks.apiFetch.mock.calls.find(([url]) => url.includes('bulk-import'))!
    const body = importCall[1].body as FormData
    expect(body.get('batch_id')).toBe('batch-uuid-1')
    expect(body.get('file_hash')).toBe('hash-1')

    expect(mocks.showSuccess).toHaveBeenCalledWith('Impor selesai: 2 dibuat, 1 diperbarui, 0 dilewati, 1 gagal')
    expect(onRefresh).toHaveBeenCalled()
  })

  it('closes the confirmation modal with Escape before closing the drawer', async () => {
    mocks.apiFetch.mockResolvedValue({ ok: true, json: async () => validationResponse })
    renderImportDrawer(vi.fn())

    selectFile('students.csv')
    document.getElementById('validate-import-btn')?.click()
    await flushAsync()

    document.getElementById('confirm-import-btn')?.click()
    expect(document.getElementById('import-confirm-modal')).not.toBeNull()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(document.getElementById('import-confirm-modal')).toBeNull()
    // Drawer itself is still open after the first Escape.
    expect(document.getElementById('import-step-preview')).not.toBeNull()
  })

  it('lists import history with status labels and server error-report downloads', async () => {
    mocks.apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            batch_id: 'batch-uuid-2',
            status: 'completed',
            source_format: 'xlsx',
            original_filename: 'mahasiswa_2026.xlsx',
            override_existing_active: true,
            override_reason: 'Sinkronisasi data resmi kampus.',
            uploaded_by: 'Admin Utama',
            total_rows: 100,
            valid_rows: 98,
            invalid_rows: 2,
            created_count: 90,
            updated_count: 8,
            skipped_count: 0,
            failed_count: 2,
            has_error_report: true,
            error_report_expired: false,
            created_at: '2026-07-06T10:00:00+07:00',
          },
          {
            batch_id: 'batch-uuid-3',
            status: 'completed',
            source_format: 'csv',
            original_filename: 'lama.csv',
            override_existing_active: false,
            uploaded_by: 'Admin Utama',
            total_rows: 10,
            valid_rows: 8,
            invalid_rows: 2,
            created_count: 8,
            updated_count: 0,
            skipped_count: 0,
            failed_count: 2,
            has_error_report: false,
            error_report_expired: true,
            created_at: '2026-03-01T10:00:00+07:00',
          },
        ],
        meta: { current_page: 1, per_page: 10, total: 2, last_page: 1 },
      }),
    })
    renderImportDrawer(vi.fn())

    document.getElementById('open-import-history')?.click()
    await flushAsync()

    expect(mocks.apiFetch).toHaveBeenCalledWith('/api/super-admin/users/import-batches?per_page=10&page=1')

    const history = document.getElementById('history-content')!
    expect(history.textContent).toContain('mahasiswa_2026.xlsx')
    expect(history.textContent).toContain('Selesai')
    expect(history.textContent).toContain('Admin Utama')
    expect(history.textContent).toContain('mode perbarui')
    expect(history.textContent).toContain('Alasan perbarui: Sinkronisasi data resmi kampus.')
    expect(history.querySelectorAll('.history-error-btn').length).toBe(2)
    // Purged batches explain the retention expiry instead of a dead link.
    expect(history.textContent).toContain('Laporan error sudah melewati masa penyimpanan.')

    // Status filter re-queries the backend with the chosen status.
    const filter = document.getElementById('history-status-filter') as HTMLSelectElement
    filter.value = 'failed'
    filter.dispatchEvent(new Event('change'))
    await flushAsync()
    expect(mocks.apiFetch).toHaveBeenCalledWith('/api/super-admin/users/import-batches?per_page=10&page=1&status=failed')
  })
})

describe('Export drawer', () => {
  it('keeps the PII toggle OFF by default with a lawful-use warning', () => {
    renderExportDrawer()

    const pii = document.getElementById('export-include-pii') as HTMLInputElement
    expect(pii.checked).toBe(false)
    expect(document.body.textContent).toContain('Sertakan data pribadi tambahan')
    expect(document.body.textContent).toContain('Data pribadi hanya boleh diekspor untuk kebutuhan administrasi yang sah.')
    expect(document.body.textContent).toContain('Password, token, dan data keamanan akun tidak pernah diekspor.')
  })

  it('requires a reason for PII export and sends include_pii with the reason', async () => {
    mocks.apiFetch.mockResolvedValue({ ok: true, blob: async () => new Blob(['x']) })
    renderExportDrawer()

    // Without PII: no reason needed, no PII params.
    document.getElementById('confirm-export-btn')?.click()
    await flushAsync()
    expect(mocks.apiFetch.mock.calls[0][0]).not.toContain('include_pii')

    renderExportDrawer()
    const pii = document.getElementById('export-include-pii') as HTMLInputElement
    const exportBtn = document.getElementById('confirm-export-btn') as HTMLButtonElement

    // Enabling PII reveals the reason field and locks the button until filled.
    expect(document.getElementById('export-reason-wrap')!.classList.contains('hidden')).toBe(true)
    pii.checked = true
    pii.dispatchEvent(new Event('change'))
    expect(document.getElementById('export-reason-wrap')!.classList.contains('hidden')).toBe(false)
    expect(exportBtn.disabled).toBe(true)

    const reason = document.getElementById('export-reason-input') as HTMLTextAreaElement
    reason.value = 'Rekap administrasi beasiswa fakultas'
    reason.dispatchEvent(new Event('input'))
    expect(exportBtn.disabled).toBe(false)

    exportBtn.click()
    await flushAsync()

    const lastUrl = mocks.apiFetch.mock.calls.at(-1)![0] as string
    expect(lastUrl).toContain('include_pii=1')
    expect(lastUrl).toContain(`export_reason=${encodeURIComponent('Rekap administrasi beasiswa fakultas')}`)
  })
})
