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
    document.body.style.backgroundColor = '#0a192f';
    
    return () => {
      document.documentElement.classList.remove('auth-page');
      document.body.classList.remove('auth-page');
      document.body.style.backgroundColor = '';
    };
  }, []);

  return (
    <div className="auth-layout min-h-screen w-full overflow-y-auto" style={{ backgroundColor: '#0a192f' }}>
      <div className="relative w-full py-8">
        <div className="w-full max-w-[800px] mx-auto px-6 pt-[env(safe-area-inset-top)] pb-16 min-h-[100vh]">
          {children}
        </div>
      </div>
    </div>
  );
}
