import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { shouldNormalizeUrl } from './app/middleware/resumeIdNormalizer';

/**
 * Middleware to normalize resume URLs
 * This ensures that all resume URLs use the timestamp-only format
 * Example: /dashboard/resume/1751268991175_Daud_Resume.pdf/experience -> /dashboard/resume/1751268991175/experience
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if this is a resume URL that needs normalization
  const { shouldNormalize, normalizedUrl } = shouldNormalizeUrl(pathname);
  
  if (shouldNormalize) {
    // Create a new URL with the normalized path
    const url = request.nextUrl.clone();
    url.pathname = normalizedUrl;
    
    // Redirect to the normalized URL
    return NextResponse.redirect(url);
  }
  
  // If no normalization needed, continue with the request
  return NextResponse.next();
}

// Only run the middleware on resume-related paths
export const config = {
  matcher: '/dashboard/resume/:path*',
};
