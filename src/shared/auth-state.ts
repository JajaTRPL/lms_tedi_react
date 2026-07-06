const NORMAL_AUTH_STORAGE_KEYS = [
  'auth_token',
  'auth_role',
  'auth_name',
  'auth_photo',
  'auth_avatar',
  'auth_sub_role',
  'auth_tendik_role',
  'auth_assigned_tasks',
  'auth_role_level',
  'auth_user_id',
  'auth_status',
  'auth_requires_completion',
  'auth_completion',
] as const

export const clearNormalAuthState = (): void => {
  NORMAL_AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
}
