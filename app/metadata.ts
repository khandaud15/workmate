import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: 'Talexus AI – AI-Powered Job Application Platform',
    template: '%s | Talexus AI',
  },
  description: 'Talexus helps you land jobs faster with AI. Build resumes, generate cover letters, get ATS scores, and apply to jobs automatically.',
  keywords: ['job search', 'AI resume builder', 'ATS resume checker', 'cover letter generator', 'job application automation', 'career tools'],
  authors: [{ name: 'Talexus' }],
  creator: 'Talexus',
  publisher: 'Talexus',
  formatDetection: {
    email: true,
    address: false,
    telephone: true,
  },
  metadataBase: new URL('https://www.talexus.ai'),
  openGraph: {
    title: 'Talexus AI – AI-Powered Job Application Platform',
    description: 'Land your dream job faster with AI-powered resume building, cover letter generation, and job application automation.',
    url: 'https://www.talexus.ai',
    siteName: 'Talexus AI',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Talexus - AI-Powered Job Application Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Talexus – AI-Powered Job Application Platform',
    description: 'Land your dream job faster with AI-powered resume building and job application automation.',
    images: ['/images/twitter-card.jpg'],
    creator: '@talexus_ai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Keep the existing favicon and theme settings
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/favicon.ico', sizes: '180x180', type: 'image/x-icon' },
    ],
  },
  manifest: '/site.webmanifest',
  themeColor: '#0e3a68',
  appleWebApp: {
    title: 'Talexus',
    statusBarStyle: 'black-translucent',
  },
};
