import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('sq_token')?.value

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const res = await fetch(`${BACKEND}/api/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json(
      { message: data.message || 'Failed to fetch profile' },
      { status: res.status }
    )
  }

  return NextResponse.json(data)
}
