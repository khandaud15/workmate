import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Talexus - Streamline Your Job Search",
  description: "Automate your job applications with Talexus. Upload once, apply everywhere.",
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: ['/favicon/favicon.ico'],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/favicon/site.webmanifest',
  themeColor: '#0e3a68',
  appleWebApp: {
    title: 'Talexus',
    statusBarStyle: 'black-translucent',
  },
};
