'use client';

import { useState, ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import DashboardSidebar from './DashboardSidebar';
import AccountSettings from './AccountSettings';
import { FaChevronRight, FaTimes, FaHome, FaFileAlt, FaEnvelopeOpenText } from 'react-icons/fa';
import Link from 'next/link';
import './mobile-sidebar-fix.css'; // Import CSS to fix mobile sidebar toggle

type CoverLetterLayoutProps = {
  children: ReactNode;
};

export default function CoverLetterLayout({ children }: CoverLetterLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/signin');
    return null;
  }

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen bg-[#0a192f]">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#0a192f] text-white overflow-x-hidden relative p-0 w-full">
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
      
      {/* Desktop sidebar - always collapsed for cover letter pages */}
      <DashboardSidebar 
        onShowAccountSettings={() => setShowAccountSettings(true)}
        defaultCollapsed={true}
        isMobileSidebarOpen={isSidebarOpen}
        setIsMobileSidebarOpen={setIsSidebarOpen}
        toggleSidebarCollapse={() => {}}
        isSidebarCollapsed={true}
        hideExpandedSidebar={true}
      />
      
      {/* Mobile sidebar - only shown when toggle button is clicked */}
      {isSidebarOpen && (
        <>
          {/* This is the mobile sidebar that should appear when toggled */}
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="mobile-sidebar fixed top-0 left-0 h-full z-50 bg-[#0a192f] w-[280px] overflow-y-auto">
              {/* Close Button */}
              <button 
                className="absolute right-4 top-4 text-white hover:text-gray-200 transition-colors"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <FaTimes size={20} />
              </button>
              
              {/* Logo */}
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-[#d8f1eb] to-[#9bd6c4] rounded transform rotate-45 w-7 h-7"></div>
                  <span className="text-lg font-bold text-white">Talexus AI</span>
                </div>
              </div>
              
              {/* Navigation Links */}
              <nav className="mt-6 px-4">
                <ul className="space-y-4">
                  <li>
                    <Link href="/dashboard" className="flex items-center text-gray-300 hover:text-white gap-3 py-2">
                      <FaHome size={18} />
                      <span>Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/resume" className="flex items-center text-gray-300 hover:text-white gap-3 py-2">
                      <FaFileAlt size={18} />
                      <span>Resumes</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/cover-letter" className="flex items-center text-blue-400 font-medium gap-3 py-2">
                      <FaEnvelopeOpenText size={18} />
                      <span>Cover Letters</span>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </>
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
