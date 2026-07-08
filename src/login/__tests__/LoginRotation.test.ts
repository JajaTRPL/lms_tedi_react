// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  renderPasswordRotation: vi.fn(),
}))

vi.mock('../PasswordRotation', () => ({
  renderPasswordRotation: mocks.renderPasswordRotation,
}))
vi.mock('../ResetPassword', () => ({ renderForgotPassword: vi.fn() }))
vi.mock('../../shared/api-client', () => ({ apiFetch: vi.fn() }))
vi.mock('../../mahasiswa/ProfileCompletion', () => ({ renderProfileCompletion: vi.fn() }))
vi.mock('../../dashboard/AdminDashboard', () => ({ renderAdminDashboard: vi.fn() }))
vi.mock('../../dashboard/MahasiswaDashboard', () => ({ renderMahasiswaDashboard: vi.fn() }))
vi.mock('../../dashboard/TendikDashboard', () => ({ renderTendikDashboard: vi.fn() }))
vi.mock('../../dashboard/AkademikDashboard', () => ({ renderAkademikDashboard: vi.fn() }))
vi.mock('toastify-js', () => ({ default: vi.fn(() => ({ showToast: vi.fn() })) }))

import { renderLogin } from '../Login'

describe('local login password rotation challenge', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>'
    localStorage.clear()
    sessionStorage.clear()
    mocks.renderPasswordRotation.mockReset()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('stores a 423 challenge separately and never creates a normal auth session', async () => {
    localStorage.setItem('auth_token', 'stale-normal-token')
    localStorage.setItem('auth_role', 'mahasiswa')
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 423,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({
        success: false,
        code: 'PASSWORD_ROTATION_REQUIRED',
        message: 'Ganti kata sandi Anda.',
        rotation_token: 'rotation-token',
        expires_in: 900,
      }),
    } as unknown as Response)

    renderLogin()
    const email = document.getElementById('email') as HTMLInputElement
    const password = document.getElementById('password') as HTMLInputElement
    email.value = 'user@example.test'
    password.value = 'old-password'
    email.dispatchEvent(new Event('input'))
    password.dispatchEvent(new Event('input'))
    document.getElementById('login-form')?.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    )

    await vi.waitFor(() => {
      expect(mocks.renderPasswordRotation).toHaveBeenCalledWith('Ganti kata sandi Anda.')
    })

    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(localStorage.getItem('auth_role')).toBeNull()
    expect(sessionStorage.getItem('password_rotation_token')).toBe('rotation-token')
    expect(sessionStorage.getItem('password_rotation_expires_at')).not.toBeNull()
  })

  it('clears stale normal auth when the rotation challenge is malformed', async () => {
    localStorage.setItem('auth_token', 'stale-normal-token')
    localStorage.setItem('auth_role', 'mahasiswa')
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 423,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({
        success: false,
        code: 'PASSWORD_ROTATION_REQUIRED',
        message: 'Ganti kata sandi Anda.',
      }),
    } as unknown as Response)

    renderLogin()
    const email = document.getElementById('email') as HTMLInputElement
    const password = document.getElementById('password') as HTMLInputElement
    email.value = 'user@example.test'
    password.value = 'old-password'
    document.getElementById('login-form')?.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    )

    await vi.waitFor(() => {
      expect(document.getElementById('login-error')?.textContent).toContain('tidak valid')
    })

    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(localStorage.getItem('auth_role')).toBeNull()
    expect(sessionStorage.getItem('password_rotation_token')).toBeNull()
    expect(mocks.renderPasswordRotation).not.toHaveBeenCalled()
  })
})
