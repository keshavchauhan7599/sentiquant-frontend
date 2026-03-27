import { ApiError } from '@/src/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

/** Reads sq_token cookie — client-side only */
function getToken(): string | null {
  if (typeof window === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)sq_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean
}

export async function apiRequest<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { requiresAuth = false, headers, ...rest } = options

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  }

  if (requiresAuth) {
    const token = getToken()
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: requestHeaders,
    ...rest,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.message || `Request failed: ${res.status}`)
  }

  return res.json() as Promise<T>
}
