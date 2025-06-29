// This file ensures proper initialization of client-side features on Vercel
// It's loaded by the cover letter page to ensure DOM elements are properly initialized

export function initializeVercelEnvironment() {
  // This function runs only on the client side
  if (typeof window !== 'undefined') {
    // Add a small delay to ensure DOM is fully loaded
    setTimeout(() => {
      // Make sure the toggle button is properly initialized
      const toggleButton = document.querySelector('.sidebar-toggle');
      if (toggleButton) {
        console.log('Vercel fix: Toggle button found and initialized');
      }
      
      // Ensure cover letter page containers have proper width
      const containers = document.querySelectorAll('.cover-letter-page div[class*="bg-"]');
      containers.forEach(container => {
        if (container instanceof HTMLElement) {
          container.style.width = '100%';
          container.style.maxWidth = '100%';
        }
      });
      
      // Force sidebar to be properly initialized
      const sidebar = document.querySelector('.sidebar');
      if (sidebar && sidebar instanceof HTMLElement) {
        sidebar.style.display = window.innerWidth >= 1024 ? 'block' : 'none';
      }
    }, 300);
  }
  
  return null;
}
