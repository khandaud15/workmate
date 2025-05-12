import type { Metadata } from "next";
import { Inter } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Talexus - Streamline Your Job Search",
  description: "Automate your job applications with Talexus. Upload once, apply everywhere.",
  icons: {
    icon: [{ url: 'https://raw.githubusercontent.com/khandaud15/files/main/Fevicon.png', type: 'image/png' }],
    shortcut: ['https://raw.githubusercontent.com/khandaud15/files/main/Fevicon.png'],
    apple: [
      { url: 'https://raw.githubusercontent.com/khandaud15/files/main/Fevicon.png', type: 'image/png' },
    ],
  },
};

import { headers } from 'next/headers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get pathname from headers
  const headersList = headers();
  const pathname = headersList.get('x-invoke-path') || '';
  const isAuth = pathname.includes('/signup') || pathname.includes('/signin');

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col bg-white`} suppressHydrationWarning>
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
