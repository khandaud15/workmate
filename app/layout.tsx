'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  adjustFontFallback: true,
  preload: true,
});

// Metadata moved to metadata.ts



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuth = pathname?.startsWith('/signup') || pathname?.startsWith('/signin');

  useEffect(() => {
    if (isAuth) {
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#05070A');
      document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.setAttribute('content', 'black');
    } else {
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff');
      document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.setAttribute('content', 'default');
    }
  }, [isAuth]);
  const hideFooter = isAuth || pathname?.startsWith('/onboarding') || pathname?.startsWith('/profile');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <Providers>
          {!isAuth && <Header />}
          <div className={`flex-grow ${!isAuth ? 'pt-24' : ''}`}>
            {children}
          </div>
          {!hideFooter && <Footer />}
        </Providers>
      </body>
    </html>
  );
}
