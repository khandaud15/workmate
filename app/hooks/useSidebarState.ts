import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useSidebarState(defaultCollapsed = true) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(defaultCollapsed);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (pathname) {
      setIsMobileSidebarOpen(false);
    }
  }, [pathname]);

  // Determine if we're on a page that should have collapsed sidebar only
  const isCoverLetterPage = pathname?.includes('/dashboard/cover-letter');
  const isResumePage = pathname?.includes('/dashboard/resume');
  const showOnlyCollapsedSidebar = isCoverLetterPage || isResumePage;

  const toggleMobileSidebar = () => {
    console.log('Toggling mobile sidebar, current state:', isMobileSidebarOpen);
    setIsMobileSidebarOpen(prev => !prev);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  return {
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    toggleMobileSidebar,
    toggleSidebarCollapse,
    showOnlyCollapsedSidebar
  };
}
