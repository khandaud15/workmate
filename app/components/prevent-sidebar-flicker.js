'use client';

// This script runs immediately when loaded to prevent sidebar flicker
(function() {
  if (typeof window !== 'undefined') {
    // Function to check if we're on a page that should have collapsed sidebar
    const shouldCollapseOnPage = () => {
      const path = window.location.pathname;
      return path.includes('/dashboard/cover-letter') || path.includes('/dashboard/resume');
    };

    // Function to immediately collapse sidebar
    const collapseSidebar = () => {
      // Add class to body to prevent transitions
      document.body.classList.add('page-transitioning');
      
      // Force all sidebars to collapsed state
      const sidebars = document.querySelectorAll('.sidebar');
      sidebars.forEach(sidebar => {
        sidebar.classList.add('collapsed');
        sidebar.classList.remove('expanded');
        sidebar.style.width = '80px';
        sidebar.style.maxWidth = '80px';
        sidebar.style.transition = 'none';
      });
      
      // Hide any expanded sidebars
      const expandedSidebars = document.querySelectorAll('.sidebar:not(.collapsed)');
      expandedSidebars.forEach(sidebar => {
        sidebar.style.display = 'none';
        sidebar.style.visibility = 'hidden';
        sidebar.style.opacity = '0';
      });
    };

    // Run immediately
    if (shouldCollapseOnPage()) {
      collapseSidebar();
    }

    // Also handle navigation events
    const handleRouteChange = () => {
      if (shouldCollapseOnPage()) {
        collapseSidebar();
      }
    };

    // Listen for navigation events
    window.addEventListener('popstate', handleRouteChange);
    
    // Clean up after a short delay
    setTimeout(() => {
      document.body.classList.remove('page-transitioning');
    }, 500);
  }
})();
