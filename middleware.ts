import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const publicPaths = ['/', '/signup', '/signin', '/pricing', '/copilot', '/cover-letter']

  // Root path and public paths should always be accessible
  if (path === '/' || publicPaths.includes(path)) {
    return NextResponse.next()
  }

  // If the user is not authenticated and trying to access protected pages, redirect to signup
  if (!token && !publicPaths.includes(path)) {
    const signupUrl = new URL('/signup', request.url)
    return NextResponse.redirect(signupUrl)
  }

  // If the user is authenticated and trying to access auth pages, redirect to dashboard
  if (token && (path === '/signup' || path === '/signin')) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
