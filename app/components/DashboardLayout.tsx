'use client';

import { useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from './DashboardSidebar';
import AccountSettings from './AccountSettings';

type DashboardLayoutProps = {
  children: ReactNode;
  defaultCollapsed?: boolean;
};

export default function DashboardLayout({ 
  children, 
  defaultCollapsed = true 
}: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(defaultCollapsed);

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/signin');
    return null;
  }

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen bg-[#12101a]">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#12101a] text-white overflow-x-hidden">
      {/* Sidebar Component */}
      <DashboardSidebar 
        onShowAccountSettings={() => setShowAccountSettings(true)}
        defaultCollapsed={defaultCollapsed}
      />

      {/* Main Content */}
      <div 
        className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-[60px]' : 'ml-[280px]'}`}
      >
        {showAccountSettings ? (
          <div className="relative">
            <AccountSettings onClose={() => setShowAccountSettings(false)} />
          </div>
        ) : (
          <>{children}</>
        )}
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
          background: #12101a;
        }
      `}</style>
    </div>
  );
}
