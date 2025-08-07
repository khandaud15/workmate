import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { shouldNormalizeUrl } from './app/middleware/resumeIdNormalizer';

import { VERCEL_URL } from './app/config';

const allowedOrigins = [
  'http://localhost:3000',
  VERCEL_URL,
].filter(Boolean); // Filter out any undefined values

/**
 * Middleware to handle CORS and URL normalization
 */
export function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  
  // Handle CORS for API routes
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // Set CORS headers
    const requestOrigin = request.headers.get('origin');
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      response.headers.set('Access-Control-Allow-Origin', requestOrigin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With'
      );
    }
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }
    
    return response;
  }
  
  // Resume URL normalization (existing functionality)
  const { shouldNormalize, normalizedUrl } = shouldNormalizeUrl(pathname);
  if (shouldNormalize) {
    const url = request.nextUrl.clone();
    url.pathname = normalizedUrl;
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// Run middleware on all routes
export const config = {
  matcher: ['/api/:path*', '/dashboard/resume/:path*'],
};
