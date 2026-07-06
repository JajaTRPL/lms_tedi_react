// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  apiFetch: vi.fn(),
  renderProfileCompletion: vi.fn(),
  renderAdminDashboard: vi.fn(),
  renderMahasiswaDashboard: vi.fn(),
  renderTendikDashboard: vi.fn(),
  renderAkademikDashboard: vi.fn(),
}))

vi.mock('../../shared/api-client', () => ({ apiFetch: mocks.apiFetch }))
vi.mock('../../mahasiswa/ProfileCompletion', () => ({
  renderProfileCompletion: mocks.renderProfileCompletion,
}))
vi.mock('../../dashboard/AdminDashboard', () => ({ renderAdminDashboard: mocks.renderAdminDashboard }))
vi.mock('../../dashboard/MahasiswaDashboard', () => ({ renderMahasiswaDashboard: mocks.renderMahasiswaDashboard }))
vi.mock('../../dashboard/TendikDashboard', () => ({ renderTendikDashboard: mocks.renderTendikDashboard }))
vi.mock('../../dashboard/AkademikDashboard', () => ({ renderAkademikDashboard: mocks.renderAkademikDashboard }))
vi.mock('../ResetPassword', () => ({ renderForgotPassword: vi.fn() }))
vi.mock('toastify-js', () => ({ default: vi.fn(() => ({ showToast: vi.fn() })) }))

import { handleRedirection } from '../Login'

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('auth_token', 'test-token')
  localStorage.setItem('auth_status', 'Active')
  for (const mock of Object.values(mocks)) mock.mockReset()
})

describe('authenticated redirect completion guard', () => {
  it('checks the server and renders completion instead of a protected dashboard', async () => {
    const completion = {
      needs_completion: true,
      can_self_complete: true,
      role: 'tendik',
      sub_role: null,
      tendik_role: 'persuratan',
      fields: ['nip'],
      missing_fields: ['NIP'],
      message: 'Lengkapi NIP sebelum mengakses sistem.',
    }
    mocks.apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ completion }),
    } as Response)

    await handleRedirection('tendik')

    expect(mocks.renderProfileCompletion).toHaveBeenCalledWith(completion)
    expect(mocks.renderTendikDashboard).not.toHaveBeenCalled()
    expect(localStorage.getItem('auth_requires_completion')).toBe('true')
  })

  it('continues to the dashboard when the server reports a complete profile', async () => {
    mocks.apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        completion: {
          needs_completion: false,
          can_self_complete: false,
          role: 'tendik',
          fields: [],
          missing_fields: [],
          message: 'Profil sudah lengkap.',
        },
      }),
    } as Response)

    await handleRedirection('tendik')

    expect(mocks.renderProfileCompletion).not.toHaveBeenCalled()
    expect(mocks.renderTendikDashboard).toHaveBeenCalledWith('tendik')
  })
})
