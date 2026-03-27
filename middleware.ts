import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_ROUTES = ['/portfolio']
const AUTH_ROUTES = ['/login', '/signup']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('sq_token')?.value

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  // No token on a protected page → redirect to login
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Already logged in → redirect away from login/signup
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/portfolio', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/portfolio/:path*', '/login', '/signup'],
}
