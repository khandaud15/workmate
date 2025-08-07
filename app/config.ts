const isProduction = process.env.NODE_ENV === 'production';

// Get Vercel URL from environment variable or use a fallback
export const VERCEL_URL = process.env.NEXT_PUBLIC_VERCEL_URL 
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : 'https://your-vercel-app.vercel.app';  // Fallback - replace with your actual Vercel URL

export const API_BASE_URL = isProduction 
  ? VERCEL_URL
  : ''; // Empty string for relative URLs in development

export const API_ENDPOINTS = {
  SEARCH: `${API_BASE_URL}/api/jobs/search`,
  RESULTS: `${API_BASE_URL}/api/jobs/results`,
  STATUS: `${API_BASE_URL}/api/jobs/status`,
};
