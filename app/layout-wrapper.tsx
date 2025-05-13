'use client';

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

export default function LayoutWrapper({
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
    <Providers>
      <div className="overflow-x-hidden">
        <Header />
        <main className={`flex-grow pt-24 overflow-x-hidden`}>{children}</main>
        {!hideFooter && <Footer />}
      </div>
    </Providers>
  );
}
