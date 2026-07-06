export interface PasswordRotationPayload {
  password: string
  password_confirmation: string
}

const rotationHeaders = (token: string, includeContentType = false): HeadersInit => ({
  Accept: 'application/json',
  Authorization: `Bearer ${token}`,
  ...(includeContentType ? { 'Content-Type': 'application/json' } : {}),
})

export const getPasswordRotationStatus = (token: string): Promise<Response> =>
  fetch('/api/auth/password-rotation', {
    method: 'GET',
    headers: rotationHeaders(token),
    cache: 'no-store',
  })

export const submitPasswordRotation = (
  token: string,
  payload: PasswordRotationPayload,
): Promise<Response> =>
  fetch('/api/auth/password-rotation', {
    method: 'POST',
    headers: rotationHeaders(token, true),
    body: JSON.stringify(payload),
  })

export const logoutPasswordRotation = (token: string): Promise<Response> =>
  fetch('/api/logout', {
    method: 'POST',
    headers: rotationHeaders(token),
  })
