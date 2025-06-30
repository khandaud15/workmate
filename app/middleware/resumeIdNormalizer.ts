/**
 * Utility functions to normalize resume IDs by extracting just the timestamp part
 * This ensures consistent URL patterns across the application
 */

/**
 * Normalizes a resume ID by extracting just the timestamp part
 * @param resumeId The resume ID to normalize
 * @returns The normalized resume ID (just the timestamp part)
 */
export function normalizeResumeId(resumeId: string): string {
  if (!resumeId) return resumeId;
  
  // Extract just the numeric ID part (before any underscore)
  const match = resumeId.match(/^(\d+)/);
  if (match && match[1]) {
    return match[1];
  }
  
  return resumeId;
}

/**
 * Middleware function to normalize resume IDs in API requests
 * @param req The incoming request
 * @returns The normalized resume ID
 */
export function normalizeResumeIdFromRequest(req: Request): string | null {
  const { searchParams } = new URL(req.url);
  const resumeId = searchParams.get('resumeId');
  
  if (!resumeId) return null;
  
  return normalizeResumeId(resumeId);
}

/**
 * Checks if a URL contains a PDF filename pattern and redirects to the normalized version if needed
 * @param url The URL to check
 * @returns Boolean indicating if the URL was normalized
 */
export function shouldNormalizeUrl(url: string): { shouldNormalize: boolean; normalizedUrl: string } {
  // Check if the URL contains a pattern like /resume/1234567890_filename.pdf/
  const pdfPattern = /\/resume\/(\d+)_[^/]+\.pdf(\/|$)/;
  const match = url.match(pdfPattern);
  
  if (match && match[1]) {
    // Replace the PDF filename pattern with just the timestamp
    const normalizedUrl = url.replace(pdfPattern, `/resume/${match[1]}$2`);
    return { shouldNormalize: true, normalizedUrl };
  }
  
  return { shouldNormalize: false, normalizedUrl: url };
}
