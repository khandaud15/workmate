'use client';

import { Inter } from "next/font/google";
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Header from "./components/Header";
import Footer from "./components/Footer";
import DataCleaner from "./components/DataCleaner";
import "./globals.css";
import { Providers } from "./providers";
// Metadata is automatically picked up by Next.js from metadata.ts

// Viewport configuration for meta tags
const viewportConfig = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#ffffff' }, // Changed to white for dark mode too
  ],
} as const;

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  adjustFontFallback: true,
  preload: true,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuth = pathname?.startsWith('/signup') || pathname?.startsWith('/signin') || pathname?.startsWith('/forgot-password');
  const isDashboard = pathname?.startsWith('/dashboard');

  useEffect(() => {
    // Always use white theme color for the status bar
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff');
    document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.setAttribute('content', 'default');
  }, []);
  
  const hideFooter = isAuth || pathname?.startsWith('/onboarding') || pathname?.startsWith('/profile') || isDashboard;
  const hideHeader = isAuth || isDashboard || pathname?.startsWith('/onboarding');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Viewport and theme meta tags are handled by Next.js metadata API */}
        <meta name="viewport" content={`width=${viewportConfig.width}, initial-scale=${viewportConfig.initialScale}, maximum-scale=${viewportConfig.maximumScale}, user-scalable=${viewportConfig.userScalable ? 'yes' : 'no'}`} />
        {viewportConfig.themeColor.map((color, index) => (
          <meta key={index} name="theme-color" media={color.media} content={color.color} />
        ))}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <title>Talexus AI</title>
        <meta name="application-name" content="Talexus AI" />
        <meta property="og:site_name" content="Talexus AI" />
        <meta name="apple-mobile-web-app-title" content="Talexus AI" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col bg-[#fefcf9]`} suppressHydrationWarning>
        <Providers>
          {/* DataCleaner runs on every page to ensure proper data isolation between users */}
          <DataCleaner />
          {!hideHeader && <Header />}
          <div className={`flex-grow ${!hideHeader ? 'pt-24 bg-[#fefcf9]' : ''}`}>
            {children}
          </div>
          {!hideFooter && <Footer />}
        </Providers>
      </body>
    </html>
  );
}
