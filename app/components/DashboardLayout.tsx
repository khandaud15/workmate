'use client';

import { useState, ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import DashboardSidebar from './DashboardSidebar';
import AccountSettings from './AccountSettings';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import './mobile-sidebar-fix.css'; // Import CSS to fix mobile sidebar toggle

// Helper function to create/show sidebar
const showMobileSidebar = (setIsSidebarOpen: (value: boolean) => void) => {
  // Use setTimeout to ensure DOM is ready
  setTimeout(() => {
    try {
      const mobileSidebar = document.querySelector('.mobile-sidebar') as HTMLElement | null;
      
      // Create sidebar if it doesn't exist
      if (!mobileSidebar) {
        const newSidebar = document.createElement('div');
        newSidebar.className = 'sidebar mobile-sidebar';
        newSidebar.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; z-index: 99999 !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 280px !important; height: 100% !important; background-color: #0a192f !important; box-shadow: 0 0 20px rgba(0,0,0,0.8) !important;';
        document.body.appendChild(newSidebar);
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = 'position: absolute; top: 10px; right: 10px; background: none; border: none; color: white; font-size: 20px; cursor: pointer;';
        closeBtn.onclick = () => {
          setIsSidebarOpen(false);
          // Try to remove the sidebar when closed
          try {
            if (newSidebar && newSidebar.parentNode) {
              newSidebar.parentNode.removeChild(newSidebar);
            }
          } catch (e) {
            console.error('Error removing sidebar:', e);
          }
        };
        newSidebar.appendChild(closeBtn);
        
        // Add sidebar content with links that use onClick to prevent navigation issues
        const content = document.createElement('div');
        content.style.cssText = 'padding: 60px 20px 20px 20px;';
        
        // Create menu HTML with client-side navigation
        content.innerHTML = `
          <h2 style="margin-bottom: 20px; font-size: 20px;">Menu</h2>
          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 15px;">
              <a href="/dashboard" style="color: white; text-decoration: none;">Dashboard</a>
            </li>
            <li style="margin-bottom: 15px;">
              <a href="/dashboard/resume" style="color: white; text-decoration: none;">Resume</a>
            </li>
            <li style="margin-bottom: 15px;">
              <a href="/dashboard/cover-letter" style="color: white; text-decoration: none;">Cover Letter</a>
            </li>
          </ul>
        `;
        
        newSidebar.appendChild(content);
        
        // Add event listeners to all links to ensure proper navigation
        const links = newSidebar.querySelectorAll('a');
        links.forEach(link => {
          link.addEventListener('click', () => {
            // Close sidebar before navigation
            setIsSidebarOpen(false);
            hideMobileSidebar();
          });
        });
      } else {
        // If sidebar exists, make sure it's visible
        mobileSidebar.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; z-index: 99999 !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 280px !important; height: 100% !important; background-color: #0a192f !important; box-shadow: 0 0 20px rgba(0,0,0,0.8) !important;';
      }
    } catch (e) {
      console.error('Error showing mobile sidebar:', e);
    }
  }, 0);
};

// Helper function to hide/remove sidebar
const hideMobileSidebar = () => {
  setTimeout(() => {
    try {
      const mobileSidebar = document.querySelector('.mobile-sidebar') as HTMLElement | null;
      if (mobileSidebar) {
        mobileSidebar.style.display = 'none';
        if (mobileSidebar.parentNode) {
          mobileSidebar.parentNode.removeChild(mobileSidebar);
        }
      }
    } catch (e) {
      console.error('Error hiding sidebar:', e);
    }
  }, 0);
};

type DashboardLayoutProps = {
  children: ReactNode;
  defaultCollapsed?: boolean;
  hideExpandedSidebar?: boolean;
};

export default function DashboardLayout({ 
  children, 
  defaultCollapsed = true,
  hideExpandedSidebar = false
}: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(defaultCollapsed);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Determine if we're on a page that should have collapsed sidebar only
  const isCoverLetterPage = pathname?.includes('/dashboard/cover-letter');
  const isResumePage = pathname?.includes('/dashboard/resume');
  const showOnlyCollapsedSidebar = isCoverLetterPage || isResumePage;

  // Initialize toggle button functionality on mount and when pathname changes
  useEffect(() => {
    // Clean up any existing sidebars first
    hideMobileSidebar();
    
    // Reset sidebar state
    setIsSidebarOpen(false);
    
    console.log('DashboardLayout initialized on page:', pathname);
    
    // Clean up function to remove sidebar when component unmounts
    return () => {
      hideMobileSidebar();
    };
  }, [pathname]);

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/signin');
    return null;
  }

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen bg-[#0a192f]">Loading...</div>;
  }

  // Force debug log to ensure we can track the issue
  console.log('DashboardLayout rendering with:', { 
    isSidebarOpen, 
    pathname, 
    isCoverLetterPage, 
    isResumePage 
  });

  return (
    <div className="flex min-h-screen bg-[#0a192f] text-white overflow-x-hidden relative p-0 w-full">
      {/* Mobile Toggle Button - Always visible on mobile */}
      <button 
        className="fixed left-0 top-1/2 transform -translate-y-1/2 z-[9998] bg-[#2563eb] text-white p-2 rounded-r-lg shadow-lg lg:hidden sidebar-toggle"
        onClick={() => {
          console.log('Toggle button clicked', { currentState: isSidebarOpen, pathname });
          
          // Use our helper functions to show/hide sidebar based on current state
          if (!isSidebarOpen) {
            // Show sidebar
            showMobileSidebar(setIsSidebarOpen);
          } else {
            // Hide sidebar
            hideMobileSidebar();
          }
          
          // Update state after DOM manipulation
          setIsSidebarOpen(prev => {
            console.log('Changing sidebar state from', prev, 'to', !prev);
            return !prev;
          });
        }}
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isSidebarOpen ? <FaChevronLeft size={16} /> : <FaChevronRight size={16} />}
      </button>
      
      {/* Overlay - Only on mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={(e) => {
            // Only close if clicking directly on the overlay
            if (e.target === e.currentTarget) {
              setIsSidebarOpen(false);
            }
          }}
        />
      )}
      
      {/* Single sidebar that works for all pages */}
      <DashboardSidebar 
        onShowAccountSettings={() => setShowAccountSettings(true)}
        defaultCollapsed={showOnlyCollapsedSidebar ? true : defaultCollapsed}
        isMobileSidebarOpen={isSidebarOpen}
        setIsMobileSidebarOpen={setIsSidebarOpen}
        toggleSidebarCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isSidebarCollapsed={showOnlyCollapsedSidebar ? true : isSidebarCollapsed}
        hideExpandedSidebar={false}
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
          background: #0a192f;
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
