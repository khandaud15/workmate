import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const publicPaths = ['/', '/login', '/signup', '/pricing']

  // If the user is on a public path, let them through
  if (publicPaths.includes(path)) {
    return NextResponse.next()
  }

  // If the user is authenticated and trying to access auth pages, redirect to dashboard
  if (token && (path === '/login' || path === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If the user is not authenticated and trying to access protected pages, redirect to login
  if (!token && !publicPaths.includes(path)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
