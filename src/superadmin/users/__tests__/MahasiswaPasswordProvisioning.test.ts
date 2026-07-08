// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  apiFetch: vi.fn(),
  populateStudyProgramSelect: vi.fn(),
  populateDepartmentSelect: vi.fn(),
  showSuccess: vi.fn(),
  showError: vi.fn(),
}))

vi.mock('../../../shared/api-client', () => ({
  apiFetch: mocks.apiFetch,
}))

vi.mock('../../../shared/study-program-select', () => ({
  populateStudyProgramSelect: mocks.populateStudyProgramSelect,
}))

vi.mock('../../../shared/department-select', () => ({
  populateDepartmentSelect: mocks.populateDepartmentSelect,
}))

vi.mock('../../../shared/toast', () => ({
  showSuccess: mocks.showSuccess,
  showError: mocks.showError,
}))

import { renderUserModal } from '../modals'
import { tabManager } from '../types'
import { buildUserPayload } from '../ui-utils'

const flushAsync = async () => {
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
}

beforeEach(() => {
  document.body.innerHTML = '<div id="modal-container"></div>'
  tabManager.setActive('mahasiswa')
  mocks.apiFetch.mockReset()
  mocks.apiFetch.mockResolvedValue({
    ok: true,
    json: async () => [],
  })
  mocks.populateStudyProgramSelect.mockReset()
  mocks.populateStudyProgramSelect.mockImplementation(async (select: HTMLSelectElement) => {
    select.innerHTML = '<option value="1">TRPL</option>'
    select.value = '1'
  })
  mocks.populateDepartmentSelect.mockReset()
  mocks.populateDepartmentSelect.mockResolvedValue(undefined)
  mocks.showSuccess.mockReset()
  mocks.showError.mockReset()
})

describe('Super Admin Mahasiswa password provisioning', () => {
  it('renders Google/reset guidance and allows creation without a Mahasiswa password', async () => {
    renderUserModal(null, vi.fn())
    await flushAsync()

    expect(document.body.textContent).toContain(
      'Mahasiswa dapat login menggunakan Google UGM atau mengatur password melalui Lupa Kata Sandi.',
    )
    expect(document.body.textContent).not.toContain('Auto-generated')

    const passwordSection = document.getElementById('password-section')
    const passwordInput = document.getElementById('modal-password-input') as HTMLInputElement

    expect(passwordSection?.classList.contains('hidden')).toBe(true)
    expect(passwordInput.disabled).toBe(true)
    expect(passwordInput.required).toBe(false)
    expect((document.getElementById('submit-user-btn') as HTMLButtonElement).disabled).toBe(false)
  })

  it('removes a tampered Mahasiswa password while preserving date and normalized identity payload', () => {
    const result = buildUserPayload(
      {
        name: 'Student',
        email: 'student@mail.ugm.ac.id',
        role: 'mahasiswa',
        password: '24535278SV1234504052004',
        nim: '24/535278/SV/12345',
        tanggal_lahir: '2004-05-04',
        study_program_id: '1',
      },
      [],
      true,
    )

    expect(result.error).toBeNull()
    expect(result.data).toMatchObject({
      role: 'mahasiswa',
      nim: '24/535278/SV/12345',
      tanggal_lahir: '2004-05-04',
      study_program_id: 1,
    })
    expect(result.data).not.toHaveProperty('password')
  })
})
