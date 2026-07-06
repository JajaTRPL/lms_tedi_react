import { clearNormalAuthState } from '../shared/auth-state'

const PASSWORD_ROTATION_TOKEN_KEY = 'password_rotation_token'
const PASSWORD_ROTATION_EXPIRES_AT_KEY = 'password_rotation_expires_at'

export const clearPasswordRotationState = (): void => {
  sessionStorage.removeItem(PASSWORD_ROTATION_TOKEN_KEY)
  sessionStorage.removeItem(PASSWORD_ROTATION_EXPIRES_AT_KEY)
}

export const storePasswordRotationChallenge = (token: string, expiresIn: number): boolean => {
  const normalizedToken = token.trim()
  const normalizedExpiresIn = Number(expiresIn)

  if (!normalizedToken || !Number.isFinite(normalizedExpiresIn) || normalizedExpiresIn <= 0) {
    clearPasswordRotationState()
    return false
  }

  sessionStorage.setItem(PASSWORD_ROTATION_TOKEN_KEY, normalizedToken)
  sessionStorage.setItem(
    PASSWORD_ROTATION_EXPIRES_AT_KEY,
    String(Date.now() + Math.floor(normalizedExpiresIn * 1000)),
  )
  return true
}

export const getPasswordRotationToken = (): string | null => {
  const token = sessionStorage.getItem(PASSWORD_ROTATION_TOKEN_KEY)
  const expiresAt = Number(sessionStorage.getItem(PASSWORD_ROTATION_EXPIRES_AT_KEY))

  if (!token || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    clearPasswordRotationState()
    return null
  }

  return token
}

export const hasPasswordRotationChallenge = (): boolean => getPasswordRotationToken() !== null

export const clearAllAuthenticationState = (): void => {
  clearNormalAuthState()
  clearPasswordRotationState()
}
