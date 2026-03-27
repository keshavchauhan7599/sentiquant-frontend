import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export async function POST(request: NextRequest) {
  const token = request.cookies.get('sq_token')?.value

  // Notify backend (best-effort — don't fail logout if backend is unreachable)
  if (token) {
    await fetch(`${BACKEND}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {})
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('sq_token', '', {
    httpOnly: false,
    path: '/',
    maxAge: 0,
  })

  return response
}
