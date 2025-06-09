'use client';

import { useState, ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import DashboardSidebar from './DashboardSidebar';
import AccountSettings from './AccountSettings';
import { FaChevronRight } from 'react-icons/fa';

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
  const pathname = usePathname();
  
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(defaultCollapsed);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/signin');
    return null;
  }

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen bg-[#12101a]">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#0e0c12] text-white overflow-x-hidden relative p-0 w-full">
      {/* Mobile Toggle Button - Vertical Tab */}
      {!isSidebarOpen && (
        <button 
          className="fixed left-0 top-1/2 transform -translate-y-1/2 z-50 bg-[#7a64c2] text-white p-2 rounded-r-lg shadow-lg lg:hidden sidebar-toggle"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <FaChevronRight size={16} />
        </button>
      )}
      
      {/* Overlay - Only on mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar Component - Only one instance for the entire app */}
      <DashboardSidebar 
        onShowAccountSettings={() => setShowAccountSettings(true)}
        defaultCollapsed={defaultCollapsed}
        isMobileSidebarOpen={isSidebarOpen}
        setIsMobileSidebarOpen={setIsSidebarOpen}
        toggleSidebarCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* Main Content */}
      <div 
        className={`flex-1 transition-[padding] duration-300 ease-in-out w-full ${isSidebarCollapsed ? 'lg:pl-[32px]' : 'lg:pl-[200px]'}`}
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
          background: #0e0c12;
        }
        
        @media (max-width: 1023px) {
          .ml-\[60px\], .ml-\[280px\] {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
