// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearAllAuthenticationState,
  getPasswordRotationToken,
  storePasswordRotationChallenge,
} from '../password-rotation-state'

describe('password rotation state', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.useRealTimers()
  })

  it('stores the rotation credential only in session storage and expires it locally', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-23T00:00:00Z'))

    expect(storePasswordRotationChallenge('rotation-token', 15)).toBe(true)
    expect(sessionStorage.getItem('password_rotation_token')).toBe('rotation-token')
    expect(localStorage.getItem('password_rotation_token')).toBeNull()
    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(getPasswordRotationToken()).toBe('rotation-token')

    vi.advanceTimersByTime(15_001)

    expect(getPasswordRotationToken()).toBeNull()
    expect(sessionStorage.getItem('password_rotation_token')).toBeNull()
    expect(sessionStorage.getItem('password_rotation_expires_at')).toBeNull()
  })

  it('clears normal authentication and rotation state together', () => {
    localStorage.setItem('auth_token', 'normal-token')
    localStorage.setItem('auth_role', 'mahasiswa')
    localStorage.setItem('auth_completion', '{"needs_completion":true}')
    storePasswordRotationChallenge('rotation-token', 900)

    clearAllAuthenticationState()

    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(localStorage.getItem('auth_role')).toBeNull()
    expect(localStorage.getItem('auth_completion')).toBeNull()
    expect(sessionStorage.getItem('password_rotation_token')).toBeNull()
  })
})
