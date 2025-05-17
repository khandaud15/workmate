'use client';

import { Inter } from "next/font/google";
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Header from "./components/Header";
import Footer from "./components/Footer";
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
  const isAuth = pathname?.startsWith('/signup') || pathname?.startsWith('/signin');

  useEffect(() => {
    // Always use white theme color for the status bar
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff');
    document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.setAttribute('content', 'default');
  }, []);
  
  const hideFooter = isAuth || pathname?.startsWith('/onboarding') || pathname?.startsWith('/profile');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Viewport and theme meta tags are handled by Next.js metadata API */}
        <meta name="viewport" content={`width=${viewportConfig.width}, initial-scale=${viewportConfig.initialScale}, maximum-scale=${viewportConfig.maximumScale}, user-scalable=${viewportConfig.userScalable ? 'yes' : 'no'}`} />
        {viewportConfig.themeColor.map((color, index) => (
          <meta key={index} name="theme-color" media={color.media} content={color.color} />
        ))}
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col bg-[#fefcf9]`} suppressHydrationWarning>
        <Providers>
          {!isAuth && <Header />}
          <div className={`flex-grow ${!isAuth ? 'pt-24 bg-[#fefcf9]' : ''}`}>
            {children}
          </div>
          {!hideFooter && <Footer />}
        </Providers>
      </body>
    </html>
  );
}
