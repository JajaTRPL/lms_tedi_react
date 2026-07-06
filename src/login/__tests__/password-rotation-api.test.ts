// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getPasswordRotationStatus,
  submitPasswordRotation,
} from '../password-rotation-api'

describe('password rotation API client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    localStorage.clear()
  })

  it('uses the rotation token for GET without consulting normal authentication', async () => {
    localStorage.setItem('auth_token', 'normal-token')

    await getPasswordRotationStatus('rotation-token')

    expect(fetch).toHaveBeenCalledWith('/api/auth/password-rotation', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer rotation-token',
      },
      cache: 'no-store',
    })
  })

  it('posts the confirmed password with the rotation token', async () => {
    await submitPasswordRotation('rotation-token', {
      password: 'StrongPass1!',
      password_confirmation: 'StrongPass1!',
    })

    expect(fetch).toHaveBeenCalledWith('/api/auth/password-rotation', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer rotation-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: 'StrongPass1!',
        password_confirmation: 'StrongPass1!',
      }),
    })
  })
})
