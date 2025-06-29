'use client';

import { useState, ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import DashboardSidebar from './DashboardSidebar';
import AccountSettings from './AccountSettings';
import { FaChevronRight } from 'react-icons/fa';
import '../dashboard/resume/mobile-fix.css'; // Import mobile-specific CSS fixes
import './sidebar-toggle-fix.css'; // Import CSS to ensure toggle button is visible

type ResumeLayoutProps = {
  children: ReactNode;
};

export default function ResumeLayout({ children }: ResumeLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  const [showAccountSettings, setShowAccountSettings] = useState(false);
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
    return <div className="flex items-center justify-center min-h-screen bg-[#0a192f]">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#0a192f] text-white overflow-x-hidden relative p-0 w-full resume-page">
      {/* Mobile Toggle Button - Vertical Tab */}
      {!isSidebarOpen && (
        <button 
          className="fixed left-0 top-1/2 transform -translate-y-1/2 z-50 bg-[#2563eb] text-white p-2 rounded-r-lg shadow-lg lg:hidden sidebar-toggle"
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
      
      {/* Single sidebar component - just like in DashboardLayout */}
      <DashboardSidebar 
        onShowAccountSettings={() => setShowAccountSettings(true)}
        defaultCollapsed={true}
        isMobileSidebarOpen={isSidebarOpen}
        setIsMobileSidebarOpen={setIsSidebarOpen}
        toggleSidebarCollapse={() => {}}
        isSidebarCollapsed={true}
        hideExpandedSidebar={true}
      />
      
      {/* Mobile Sidebar - This ensures the mobile sidebar is visible when toggled */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <DashboardSidebar 
            onShowAccountSettings={() => setShowAccountSettings(true)}
            defaultCollapsed={false}
            isMobileSidebarOpen={isSidebarOpen}
            setIsMobileSidebarOpen={setIsSidebarOpen}
            toggleSidebarCollapse={() => {}}
            isSidebarCollapsed={false}
            hideExpandedSidebar={false}
          />
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 transition-[padding] duration-300 ease-in-out w-full lg:pl-[32px]">
        {showAccountSettings ? (
          <div className="relative">
            <AccountSettings onClose={() => setShowAccountSettings(false)} />
          </div>
        ) : (
          <main className="p-4 md:p-6 w-full">
            {children}
          </main>
        )}
      </div>
    </div>
  );
}
