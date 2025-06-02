'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import ResumeList from '../../components/ResumeList';
import { 
  FaBars, 
  FaTimes, 
  FaChevronRight
} from 'react-icons/fa';
import DashboardSidebar from '../../components/DashboardSidebar';

export default function ResumePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  const pathname = usePathname();
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  // Handle click outside to close sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar && !sidebar.contains(event.target as Node) && window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen bg-[#12101a]">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-[#0e0c12] relative overflow-x-hidden">
      {/* Mobile Toggle Button - Only visible when sidebar is closed */}
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
      
      {/* Sidebar */}
      <DashboardSidebar 
        defaultCollapsed={true}
      />

      {/* Main Content */}
      <main 
        className={`flex-1 overflow-auto pt-4 lg:pt-0 transition-all duration-300 bg-[#0e0c12] text-white ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'}`}
        onClick={() => {
          // Collapse sidebar when clicking on main content area
          if (!isSidebarCollapsed && window.innerWidth >= 1024) {
            setIsSidebarCollapsed(true);
          }
        }}
      >
        <div className="w-full px-4 sm:px-6 md:px-8 py-4">
          <h1 className="text-2xl font-bold mb-6">Your Resumes</h1>
          <ResumeList />
        </div>
      </main>

      {/* Global Styles */}
      <style jsx global>{`
        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
          background: #0e0c12;
        }

        /* Hide scrollbar for Chrome, Safari and Opera */
        .top-section::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .top-section {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
}
