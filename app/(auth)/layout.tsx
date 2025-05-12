'use client';

import { useEffect } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.documentElement.classList.add('auth-page');
    document.body.classList.add('auth-page');
    
    return () => {
      document.documentElement.classList.remove('auth-page');
      document.body.classList.remove('auth-page');
    };
  }, []);

  return (
    <div className="auth-layout fixed inset-0 min-h-screen w-full overflow-y-auto bg-gradient-to-br from-[#0C111F] to-black">
      <div className="relative min-h-screen w-full">
        <div className="w-full max-w-[800px] mx-auto px-6 pt-[env(safe-area-inset-top)] pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}
