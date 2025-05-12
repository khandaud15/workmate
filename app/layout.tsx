'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { usePathname } from 'next/navigation';
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

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#111827" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <Providers>
          {!isAuth && <Header />}
          <div className={`flex-grow ${!isAuth ? 'pt-24' : ''}`}>
            {children}
          </div>
          {!isAuth && <Footer />}
        </Providers>
      </body>
    </html>
  );
}
