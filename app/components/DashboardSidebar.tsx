'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  FaBars, 
  FaTimes, 
  FaChevronRight, 
  FaHome, 
  FaFileAlt, 
  FaEnvelopeOpenText, 
  FaBriefcase, 
  FaRobot, 
  FaFlask,
  FaArrowLeft
} from 'react-icons/fa';

type DashboardSidebarProps = {
  onShowAccountSettings?: () => void;
  defaultCollapsed?: boolean;
  isMobileSidebarOpen?: boolean;
  setIsMobileSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebarCollapse?: () => void;
  isSidebarCollapsed?: boolean;
};

export default function DashboardSidebar({ 
  onShowAccountSettings, 
  defaultCollapsed = false,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  toggleSidebarCollapse,
  isSidebarCollapsed: propIsSidebarCollapsed
}: DashboardSidebarProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Use the prop if provided, otherwise use local state
  const [localIsSidebarCollapsed, setLocalIsSidebarCollapsed] = useState(defaultCollapsed);
  const isSidebarCollapsed = propIsSidebarCollapsed !== undefined ? propIsSidebarCollapsed : localIsSidebarCollapsed;
  
  // Helper function to handle sidebar collapse state
  const handleSidebarCollapse = (collapsed: boolean) => {
    if (toggleSidebarCollapse && propIsSidebarCollapsed !== undefined) {
      // If parent is controlling the state, call the parent's toggle function
      toggleSidebarCollapse();
    } else {
      // Otherwise use local state
      setLocalIsSidebarCollapsed(collapsed);
    }
  };
  
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({ top: 0, left: 0, display: 'none', position: 'fixed' });
  const [tooltipContent, setTooltipContent] = useState('');
  
  // DRY helper for sidebar tooltips
  const handleSidebarTooltip = (e: React.MouseEvent, label: string) => {
    if (isSidebarCollapsed) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setTooltipStyle({
        top: rect.top + (rect.height / 2) - 10,
        left: rect.right + 12,
        display: 'flex',
        position: 'fixed'
      });
      setTooltipContent(label);
    }
  };
  
  const handleSidebarTooltipLeave = () => {
    setTooltipStyle({ ...tooltipStyle, display: 'none' });
  };

  // Check if a path is active (for highlighting the current section)
  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    if (path !== '/dashboard' && pathname?.startsWith(path)) {
      return true;
    }
    return false;
  };

  return (
    <>
      {/* Mobile Sidebar - only visible on mobile when open */}
      <div 
        className={`sidebar mobile-sidebar fixed top-0 left-0 h-full z-50 lg:hidden ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="navigation"
        aria-label="Mobile navigation"
      >
        {/* Close Button for Mobile */}
        <button 
          className="absolute right-4 top-4 text-white hover:text-gray-200 transition-colors"
          onClick={() => setIsMobileSidebarOpen?.(false)}
          aria-label="Close sidebar"
        >
          <FaTimes size={20} />
        </button>
        
        <div className="top-section">
          {/* Logo at the top */}
          <div className="sidebar-logo flex items-center gap-3 mb-2 ml-3 mt-2">
            <div 
              className="bg-gradient-to-br from-[#d8f1eb] to-[#9bd6c4] rounded transform rotate-45 relative logo-icon w-7 h-7"
              style={{
                boxShadow: '2px 2px 5px rgba(0,0,0,0.2), -1px -1px 3px rgba(255,255,255,0.4)'
              }}
            >
              
            </div>
            <div className="text-lg font-bold text-white ml-2">Talexus AI</div>
          </div>
          
          <div 
            className="user hover:bg-white/5 rounded-lg transition-colors duration-200 p-2 cursor-pointer -mx-2"
            onClick={onShowAccountSettings}
            style={{ marginTop: '-10px' }}
          >
            <div className="flex items-center gap-3">
              <img 
                src={session?.user?.image || 'https://randomuser.me/api/portraits/men/75.jpg'} 
                alt="User Avatar" 
                className="rounded-full object-cover flex-shrink-0 avatar-img w-11 h-11"
              />
              
              <div className="user-info min-w-0">
                <div className="text-sm font-medium text-white truncate">{session?.user?.name || 'User'}</div>
                <div className="text-xs text-gray-300 truncate">Manage Account (Free Plan)</div>
              </div>
            </div>
          </div>

          <div className="menu-group">
            <div className="menu-label">Workspace</div>
            
            {/* Dashboard */}
            <Link 
              href="/dashboard"
              className={`menu-item w-full text-left relative ${isActive('/dashboard') && pathname === '/dashboard' ? 'active' : ''}`}
              onClick={() => {
                setIsMobileSidebarOpen?.(false);
              }}
            >
              <FaHome className="icon" />
              <span>Home</span>
            </Link>
            
            {/* Resume */}
            <Link 
              href="/dashboard/resume"
              className={`menu-item w-full text-left relative ${isActive('/dashboard/resume') ? 'active' : ''}`}
              onClick={() => {
                setIsMobileSidebarOpen?.(false);
              }}
            >
              <FaFileAlt className="icon" />
              <span>Resume</span>
            </Link>
            
            {/* Cover Letter */}
            <Link 
              href="/dashboard/cover-letter"
              className={`menu-item w-full text-left relative ${isActive('/dashboard/cover-letter') ? 'active' : ''}`}
              onClick={() => {
                setIsMobileSidebarOpen?.(false);
              }}
            >
              <FaEnvelopeOpenText className="icon" />
              <span>Cover Letter</span>
            </Link>
            
            {/* Job Tracker */}
            <Link 
              href="/dashboard/job-tracker"
              className={`menu-item w-full text-left relative ${isActive('/dashboard/job-tracker') ? 'active' : ''}`}
              onClick={() => {
                setIsMobileSidebarOpen?.(false);
              }}
            >
              <FaBriefcase className="icon" />
              <span>Job Tracker</span>
            </Link>
            
            {/* Copilot */}
            <Link 
              href="/dashboard/copilot"
              className={`menu-item w-full text-left relative ${isActive('/dashboard/copilot') ? 'active' : ''}`}
              onClick={() => {
                setIsMobileSidebarOpen?.(false);
              }}
            >
              <FaRobot className="icon" />
              <span>Copilot</span>
            </Link>
            
            {/* Playground */}
            <Link 
              href="/dashboard/playground"
              className={`menu-item w-full text-left relative ${isActive('/dashboard/playground') ? 'active' : ''}`}
              onClick={() => {
                setIsMobileSidebarOpen?.(false);
              }}
            >
              <FaFlask className="icon" /> 
              <span>Playground</span>
            </Link>
          </div>
        </div>

        <div className="bottom-card" style={{ position: 'fixed', bottom: '20px', left: '20px', width: '240px' }}>
          <strong>Upgrade to Pro</strong>
          <p>Get unlimited sessions<br />and unlock all the job tools</p>
          <button>Upgrade</button>
        </div>
      </div>

      {/* Desktop Sidebar - only visible on lg and above, hidden when mobile sidebar is open */}
      <div 
        className={`sidebar ${isMobileSidebarOpen ? 'hidden' : 'hidden lg:block'} ${isSidebarCollapsed ? 'collapsed' : 'expanded'}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Close Button - Simple X at top right of sidebar */}
        {isSidebarOpen && (
          <button 
            className="absolute right-4 top-4 z-50 text-white hover:text-gray-200 transition-colors lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <FaTimes size={20} />
          </button>
        )}

        <div className="top-section">
          {/* Logo at the top */}
          <div className={`sidebar-logo flex ${isSidebarCollapsed ? 'flex-col items-center justify-center mb-2.5' : 'items-center gap-3 mb-2 ml-3'} mt-2 sidebar-logo`}>
            <div 
              className={`bg-gradient-to-br from-[#d8f1eb] to-[#9bd6c4] rounded transform rotate-45 relative logo-icon ${isSidebarCollapsed ? 'w-5 h-5' : 'w-7 h-7'}`}
              style={{
                boxShadow: '2px 2px 5px rgba(0,0,0,0.2), -1px -1px 3px rgba(255,255,255,0.4)'
              }}
              onMouseEnter={e => handleSidebarTooltip(e, 'Talexus AI')}
              onMouseLeave={handleSidebarTooltipLeave}
            >
              
            </div>
            {!isSidebarCollapsed && <div className="text-lg font-bold text-white ml-2">Talexus AI</div>}
          </div>
          
          <div 
            className={`user hover:bg-white/5 rounded-lg transition-colors duration-200 p-2 cursor-pointer ${isSidebarCollapsed ? 'mb-2.5 relative flex flex-col items-center justify-center' : '-mx-2'} `}
            onClick={onShowAccountSettings}
            style={{ marginTop: '-10px' }}
          >
            <div className="flex items-center gap-3">
              <img 
                src={session?.user?.image || 'https://randomuser.me/api/portraits/men/75.jpg'} 
                alt="User Avatar" 
                className={`rounded-full object-cover flex-shrink-0 avatar-img ${isSidebarCollapsed ? 'w-8 h-8' : 'w-11 h-11'}`}
                title={isSidebarCollapsed ? session?.user?.name || 'User' : ''}
                onMouseEnter={e => handleSidebarTooltip(e, session?.user?.name || 'User')}
                onMouseLeave={handleSidebarTooltipLeave}
              />
              
              {!isSidebarCollapsed && (
                <div className="user-info min-w-0">
                  <div className="text-sm font-medium text-white truncate">{session?.user?.name || 'User'}</div>
                  <div className="text-xs text-gray-300 truncate">Manage Account (Free Plan)</div>
                </div>
              )}
            </div>
          </div>

          <div className="menu-group">
            {!isSidebarCollapsed && <div className="menu-label">Workspace</div>}
            
            {/* Dashboard */}
            <Link 
              href="/dashboard"
              className={`menu-item w-full text-left relative ${isActive('/dashboard') && pathname === '/dashboard' ? 'active' : ''}`}
              onClick={() => {
                setIsSidebarOpen(false);
                // Expand sidebar when Home is clicked
                handleSidebarCollapse(false);
              }}
              onMouseEnter={e => handleSidebarTooltip(e, 'Home')}
              onMouseLeave={handleSidebarTooltipLeave}
            >
              <FaHome className="icon" />
              {!isSidebarCollapsed && <span>Home</span>}
            </Link>
            
            {/* Resume */}
            <Link 
              href="/dashboard/resume"
              className={`menu-item w-full text-left relative ${isActive('/dashboard/resume') ? 'active' : ''}`}
              onClick={() => {
                setIsSidebarOpen(false);
                // Auto-collapse sidebar when section is clicked
                handleSidebarCollapse(true);
              }}
              onMouseEnter={e => handleSidebarTooltip(e, 'Resume')}
              onMouseLeave={handleSidebarTooltipLeave}
            >
              <FaFileAlt className="icon" />
              {!isSidebarCollapsed && <span>Resume</span>}
            </Link>
            
            {/* Cover Letter */}
            <Link 
              href="/dashboard/cover-letter"
              className={`menu-item w-full text-left relative ${isActive('/dashboard/cover-letter') ? 'active' : ''}`}
              onClick={() => {
                setIsSidebarOpen(false);
                // Auto-collapse sidebar when section is clicked
                handleSidebarCollapse(true);
              }}
              onMouseEnter={e => handleSidebarTooltip(e, 'Cover Letter')}
              onMouseLeave={handleSidebarTooltipLeave}
            >
              <FaEnvelopeOpenText className="icon" />
              {!isSidebarCollapsed && <span>Cover Letter</span>}
            </Link>
            
            {/* Job Tracker */}
            <Link 
              href="/dashboard/job-tracker"
              className={`menu-item w-full text-left relative ${isActive('/dashboard/job-tracker') ? 'active' : ''}`}
              onClick={() => {
                setIsSidebarOpen(false);
                // Auto-collapse sidebar when section is clicked
                handleSidebarCollapse(true);
              }}
              onMouseEnter={e => handleSidebarTooltip(e, 'Job Tracker')}
              onMouseLeave={handleSidebarTooltipLeave}
            >
              <FaBriefcase className="icon" />
              {!isSidebarCollapsed && <span>Job Tracker</span>}
            </Link>
            
            {/* Copilot */}
            <Link 
              href="/dashboard/copilot"
              className={`menu-item w-full text-left relative ${isActive('/dashboard/copilot') ? 'active' : ''}`}
              onClick={() => {
                setIsSidebarOpen(false);
                // Auto-collapse sidebar when section is clicked
                handleSidebarCollapse(true);
              }}
              onMouseEnter={e => handleSidebarTooltip(e, 'Copilot')}
              onMouseLeave={handleSidebarTooltipLeave}
            >
              <FaRobot className="icon" />
              {!isSidebarCollapsed && <span>Copilot</span>}
            </Link>
            
            {/* Playground */}
            <Link 
              href="/dashboard/playground"
              className={`menu-item w-full text-left relative ${isActive('/dashboard/playground') ? 'active' : ''}`}
              onClick={() => {
                setIsSidebarOpen(false);
                // Auto-collapse sidebar when section is clicked
                handleSidebarCollapse(true);
              }}
              onMouseEnter={e => handleSidebarTooltip(e, 'Playground')}
              onMouseLeave={handleSidebarTooltipLeave}
            >
              <FaFlask className="icon" /> 
              {!isSidebarCollapsed && <span>Playground</span>}
            </Link>
          </div>
        </div>

        {!isSidebarCollapsed && (
          <div className="bottom-card">
            <strong>Upgrade to Pro</strong>
            <p>Get unlimited sessions<br />and unlock all the job tools</p>
            <button>Upgrade</button>
          </div>
        )}
      </div>

      {/* Tooltip for collapsed sidebar */}
      <div 
        className="fixed bg-gray-800 text-white px-3 py-1 rounded-md text-sm z-50 whitespace-nowrap"
        style={tooltipStyle}
      >
        {tooltipContent}
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        .sidebar {
          height: 100vh;
          background: linear-gradient(to bottom, #141019, #2563eb);
          color: white;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 2px 0 15px rgba(0, 0, 0, 0.2);
          position: fixed;
          top: 0;
          left: 0;
          z-index: 50;
          transform: translateX(-100%);
          transition: all 0.3s ease-in-out;
        }
        
        .mobile-sidebar {
          width: 280px;
          transform: translateX(-100%);
          transition: transform 0.3s ease-in-out;
          overflow-y: auto;
          padding-bottom: 200px;
        }
        
        .mobile-sidebar.translate-x-0 {
          transform: translateX(0);
        }
        
        .sidebar.expanded {
          width: 280px;
        }
        
        .sidebar.collapsed {
          width: 60px;
          padding: 20px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .sidebar.open {
          transform: translateX(0);
        }
        
        @media (min-width: 1024px) {
          .sidebar {
            position: fixed;
            transform: translateX(0);
            box-shadow: 2px 0 15px rgba(0, 0, 0, 0.2);
          }
          
          /* Adjust main content based on sidebar state */
          main {
            transition: margin-left 0.3s ease-in-out;
          }
        }

        .top-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
          overflow-y: auto;
          max-height: calc(100vh - 180px);
          padding-right: 4px;
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

        .menu-group {
          margin-top: 10px;
        }
        
        .sidebar.collapsed .menu-group {
          margin-top: 0;
        }
        
        /* Ensure equal spacing in collapsed mode */
        .sidebar.collapsed .menu-item:last-child {
          margin-bottom: 10px;
        }

        .menu-label {
          font-size: 13px;
          text-transform: uppercase;
          margin: 18px 0 8px;
          color: #cfcfcf;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          color: white;
          text-decoration: none;
          transition: all 0.15s ease;
          margin: 2px 0;
        }
        
        .sidebar.collapsed .menu-item {
          margin-bottom: 10px;
          padding: 8px 0;
          border-radius: 12px;
          gap: 16px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .sidebar.collapsed .menu-item {
          justify-content: center;
          padding: 12px 0;
          position: relative;
        }
        
        .sidebar.collapsed .icon {
          margin: 0;
          font-size: 1.25rem;
        }
        
        /* We're using React-based tooltips instead of CSS pseudo-elements */
        .sidebar.collapsed .menu-item::after {
          content: none;
        }
        
        .sidebar.collapsed .menu-item:hover::after {
          opacity: 0;
        }

        .menu-item:hover,
        .menu-item.active {
          background: rgba(255, 255, 255, 0.08);
          transform: translateX(2px);
        }

        .menu-item .icon {
          min-width: 20px;
          text-align: center;
          font-size: 16px;
        }

        .bottom-card {
          background: black;
          border-radius: 20px;
          padding: 20px;
          text-align: center;
          color: white;
        }

        .bottom-card p {
          font-size: 14px;
          margin: 8px 0;
          color: #cfcfcf;
        }

        .bottom-card button {
          margin-top: 12px;
          padding: 10px 18px;
          background: #4b32d4;
          border: none;
          color: white;
          font-size: 14px;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          width: 100%;
        }

        .bottom-card button:hover {
          background: #3a27ad;
        }
      `}</style>
    </>
  );
}
