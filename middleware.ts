import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('next-auth.session-token')
  const { pathname } = request.nextUrl

  // Protect founder routes
  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Protect investor routes  
  if (pathname.startsWith('/investor') && !token) {
    return NextResponse.redirect(new URL('/investor/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/investor/:path*'],
}
