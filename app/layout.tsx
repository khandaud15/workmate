import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "./layout-wrapper";

export const metadata: Metadata = {
  title: "Talexus - Streamline Your Job Search",
  description: "Automate your job applications with Talexus. Upload once, apply everywhere.",
  icons: {
    icon: [{ url: '/favicon.svg?v=1', type: 'image/svg+xml' }],
    shortcut: ['/favicon.svg?v=1'],
    apple: [{ url: '/favicon.svg?v=1', type: 'image/svg+xml' }],
    other: {
      rel: 'apple-touch-icon',
      url: '/favicon.svg?v=1',
    },
  },
};

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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2" />
        <link rel="shortcut icon" type="image/svg+xml" href="/favicon.svg?v=2" />
        <link rel="apple-touch-icon" type="image/svg+xml" href="/favicon.svg?v=2" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
