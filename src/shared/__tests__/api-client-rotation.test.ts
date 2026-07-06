// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  renderPasswordRotation: vi.fn(),
  renderLogin: vi.fn(),
}))

vi.mock('../../login/PasswordRotation', () => ({
  renderPasswordRotation: mocks.renderPasswordRotation,
}))
vi.mock('../../login/Login', () => ({ renderLogin: mocks.renderLogin }))

import { apiFetch } from '../api-client'
import { storePasswordRotationChallenge } from '../../login/password-rotation-state'

const lockedResponse = (): Response => ({
  status: 423,
  clone: () => ({
    json: async () => ({ code: 'PASSWORD_ROTATION_REQUIRED' }),
  }),
} as Response)

describe('protected API password rotation interception', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    mocks.renderPasswordRotation.mockReset()
    mocks.renderLogin.mockReset()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(lockedResponse()))
  })

  it('clears stale normal auth and opens rotation when a separate challenge exists', async () => {
    localStorage.setItem('auth_token', 'normal-token')
    localStorage.setItem('auth_role', 'mahasiswa')
    storePasswordRotationChallenge('rotation-token', 900)

    await apiFetch('/api/protected')

    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(localStorage.getItem('auth_role')).toBeNull()
    expect(mocks.renderPasswordRotation).toHaveBeenCalledOnce()
    expect(mocks.renderLogin).not.toHaveBeenCalled()
  })

  it('requires a fresh login when no rotation challenge exists', async () => {
    localStorage.setItem('auth_token', 'normal-token')

    await apiFetch('/api/protected')

    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(mocks.renderPasswordRotation).not.toHaveBeenCalled()
    expect(mocks.renderLogin).toHaveBeenCalledWith(
      'Akses akun memerlukan penggantian kata sandi. Silakan login kembali.',
    )
  })
})
