const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sikshya@admin2024'
const SESSION_KEY = 'admin_session'
const SESSION_VALUE = 'authenticated'

export function getAdminPassword() {
  return ADMIN_PASSWORD
}

export function validatePassword(password: string): boolean {
  return password === ADMIN_PASSWORD
}

export function getSessionKey() {
  return SESSION_KEY
}

export function getSessionValue() {
  return SESSION_VALUE
}
