import { Inter } from 'next/font/google';
import { Providers } from '../providers';

const inter = Inter({ subsets: ['latin'] });

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased bg-black`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
