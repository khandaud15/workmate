'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import { FaBars, FaTimes, FaChevronRight } from 'react-icons/fa';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isSidebarOpen && !target.closest('.sidebar') && !target.closest('.sidebar-toggle')) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);
  
  const pathname = usePathname();
  
  // Close sidebar when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }


  return (
    <>
      <Head>
        <title>Dashboard | Talexus</title>
        <meta name="description" content="Your personal dashboard" />
      </Head>
      <div className="flex h-screen bg-[#f0f2f5] relative">
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
        
        {/* Sidebar */}
        <div 
          className={`sidebar ${isSidebarOpen ? 'open' : ''}`}
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
            <div className="flex items-center gap-2.5 pl-2">
              <div 
                className="w-5 h-5 bg-gradient-to-br from-[#d8f1eb] to-[#9bd6c4] rounded transform rotate-45"
                style={{
                  boxShadow: '2px 2px 5px rgba(0,0,0,0.2), -1px -1px 3px rgba(255,255,255,0.4)'
                }}
              />
              <div className="text-lg font-semibold text-white">Talexus</div>
            </div>

            <div className="user hover:bg-white/5 rounded-lg transition-colors duration-200 p-2 -mx-2">
              <div className="flex items-center gap-3">
                <img 
                  src={session.user?.image || 'https://randomuser.me/api/portraits/men/75.jpg'} 
                  alt="User Avatar" 
                  className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                />
                <div className="user-info min-w-0">
                  <div className="text-sm font-medium text-white truncate">{session.user?.name || 'User'}</div>
                  <div className="text-xs text-gray-300 truncate">Manage Account (Free Plan)</div>
                </div>
              </div>
            </div>

            <div className="menu-group">
              <div className="menu-label">Workspace</div>
              <Link href="/dashboard" className="menu-item active">
                <i className="fas fa-home"></i> <span>Home</span>
              </Link>
              <Link href="/dashboard/resume" className="menu-item">
                <i className="fas fa-file-alt"></i> <span>Resume</span>
              </Link>
              <Link href="/dashboard/cover-letter" className="menu-item">
                <i className="fas fa-envelope-open-text"></i> <span>Cover Letter</span>
              </Link>
              <Link href="/dashboard/job-tracker" className="menu-item">
                <i className="fas fa-briefcase"></i> <span>Job Tracker</span>
              </Link>
              <Link href="/dashboard/copilot" className="menu-item">
                <i className="fas fa-robot"></i> <span>Copilot</span>
              </Link>
              <Link href="/dashboard/playground" className="menu-item">
                <i className="fas fa-flask"></i> <span>Playground</span>
              </Link>
            </div>
          </div>

          <div className="bottom-card">
            <strong>Upgrade to Pro</strong>
            <p>Get unlimited sessions<br />and unlock all the job tools</p>
            <button>Upgrade</button>
          </div>
        </div>

        <main className="flex-1 overflow-auto pt-4 lg:pt-0 transition-all duration-300 lg:ml-0">
          <div className="max-w-4xl mx-auto p-4 lg:p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome back, {session.user?.name?.split(' ')[0] || 'User'}!</h1>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-600">Your dashboard is ready. Start by creating a new resume or exploring the job tracker.</p>
            </div>
          </div>
        </main>

        <style jsx global>{`
          body {
            margin: 0;
            font-family: 'Inter', sans-serif;
            background: #f0f2f5;
          }

          .sidebar {
            width: 280px;
            height: 100vh;
            background: linear-gradient(to bottom, #141019, #7a64c2);
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
            transition: transform 0.3s ease-in-out;
          }
          
          .sidebar.open {
            transform: translateX(0);
          }
          
          @media (min-width: 1024px) {
            .sidebar {
              position: static;
              transform: none;
              box-shadow: none;
            }
            
            main {
              margin-left: 0;
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
          
          .top-section::-webkit-scrollbar {
            width: 4px;
          }
          
          .top-section::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }
          
          .top-section::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 4px;
          }

          .menu-group {
            margin-top: 10px;
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

          .menu-item:hover,
          .menu-item.active {
            background: rgba(255, 255, 255, 0.08);
            transform: translateX(2px);
          }

          .menu-item i {
            min-width: 20px;
            text-align: center;
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
      </div>
    </>
  );
}
