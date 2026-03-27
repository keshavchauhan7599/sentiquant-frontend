import { ApiError, User, LoginCredentials, SignupCredentials } from '@/src/types'

async function authFetch<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new ApiError(res.status, body.message || 'Auth request failed')
  }

  return body as T
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User }> {
    return authFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  async signup(credentials: SignupCredentials): Promise<{ user: User }> {
    return authFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  async logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' })
  },

  async getProfile(): Promise<User> {
    return authFetch('/api/auth/profile', { method: 'GET' })
  },
}
