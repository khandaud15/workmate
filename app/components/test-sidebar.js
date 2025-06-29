// This is a test file to debug sidebar toggle functionality
console.log('Sidebar toggle debugging enabled');

// Add event listener to log when sidebar toggle is clicked
document.addEventListener('DOMContentLoaded', () => {
  // Wait for elements to be available
  setTimeout(() => {
    const toggleButton = document.querySelector('.sidebar-toggle');
    if (toggleButton) {
      console.log('Toggle button found');
      toggleButton.addEventListener('click', (e) => {
        console.log('Toggle button clicked via event listener');
        // Prevent any default behavior or event propagation issues
        e.stopPropagation();
      });
    } else {
      console.log('Toggle button not found');
    }
    
    // Log when mobile sidebar appears or disappears
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const mobileSidebar = document.querySelector('.mobile-sidebar');
          if (mobileSidebar) {
            console.log('Mobile sidebar is visible');
          } else {
            console.log('Mobile sidebar is not visible');
          }
        }
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }, 1000);
});
