'use client';

import { Inter } from "next/font/google";
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from "./components/Header";
import Footer from "./components/Footer";
import DataCleaner from "./components/DataCleaner";
import LayoutStabilizer from "./components/LayoutStabilizer";
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
  
  // Add state for page loading
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Effect for theme color - runs on pathname changes
  useEffect(() => {
    // Set theme color based on the current page
    // White only for main homepage, dark for all other pages including dashboard
    const isMainPage = pathname === '/';
    const themeColor = isMainPage ? '#ffffff' : '#0e0c12';
    
    // Create or update the theme-color meta tag
    let themeMetaTag = document.querySelector('meta[name="theme-color"]');
    if (!themeMetaTag) {
      themeMetaTag = document.createElement('meta');
      themeMetaTag.setAttribute('name', 'theme-color');
      document.head.appendChild(themeMetaTag);
    }
    themeMetaTag.setAttribute('content', themeColor);
    
    // Create or update the apple-mobile-web-app-status-bar-style meta tag
    let statusBarMetaTag = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!statusBarMetaTag) {
      statusBarMetaTag = document.createElement('meta');
      statusBarMetaTag.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      document.head.appendChild(statusBarMetaTag);
    }
    statusBarMetaTag.setAttribute('content', isMainPage ? 'default' : 'black');
    
    console.log(`Set theme color to ${themeColor} for path: ${pathname}`);
  }, [pathname]);
  
  // Effect for loading state
  useEffect(() => {
    // Set loading to false after a very short time
    if (document.readyState === 'complete') {
      setIsPageLoading(false);
    } else {
      window.addEventListener('load', () => setIsPageLoading(false));
      // Shorter fallback timeout - only show loader briefly
      setTimeout(() => setIsPageLoading(false), 300);
      
      return () => window.removeEventListener('load', () => setIsPageLoading(false));
    }
  }, []);
  
  // Reset loading state on route changes with a much shorter display time
  useEffect(() => {
    // For route changes, only show loader for very short time (100ms)
    // This gives just enough visual feedback without causing delay
    setIsPageLoading(true);
    const timer = setTimeout(() => setIsPageLoading(false), 100);
    return () => clearTimeout(timer);
  }, [pathname]);
  
  const hideFooter = isAuth || pathname?.startsWith('/onboarding') || pathname?.startsWith('/profile') || isDashboard;
  const hideHeader = isAuth || isDashboard || pathname?.startsWith('/onboarding');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Viewport and theme meta tags are handled by Next.js metadata API */}
        <meta name="viewport" content={`width=${viewportConfig.width}, initial-scale=${viewportConfig.initialScale}, maximum-scale=${viewportConfig.maximumScale}, user-scalable=${viewportConfig.userScalable ? 'yes' : 'no'}`} />
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
          {/* Hidden div that helps manage page transitions without visible loading indicator */}
          <div className={isPageLoading ? 'preload' : 'fade-in'} style={{ display: 'none' }}></div>
          
          {/* DataCleaner runs on every page to ensure proper data isolation between users */}
          <DataCleaner />
          {!hideHeader && <Header />}
          <LayoutStabilizer>
            <div className={`flex-grow ${!hideHeader ? 'pt-24 bg-[#fefcf9]' : ''}`}>
              {children}
            </div>
          </LayoutStabilizer>
          {!hideFooter && <Footer />}
        </Providers>
      </body>
    </html>
  );
}
