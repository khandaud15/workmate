'use client';

import { useEffect, useState } from 'react';

/**
 * LayoutStabilizer component
 * 
 * This component prevents layout shifts and disoriented appearance during page transitions
 * by forcing the browser to calculate layout before showing content.
 */
export default function LayoutStabilizer({ children }: { children: React.ReactNode }) {
  const [isStabilized, setIsStabilized] = useState(false);
  
  useEffect(() => {
    // Force a layout calculation by reading a layout property
    document.body.getBoundingClientRect();
    
    // Set a very short timeout to ensure the browser has time to calculate layout
    const timeout = setTimeout(() => {
      setIsStabilized(true);
    }, 10);
    
    return () => clearTimeout(timeout);
  }, []);
  
  // Apply a style that hides content until layout is calculated
  const stabilizingStyle = {
    opacity: isStabilized ? 1 : 0,
    transition: 'opacity 0.1s ease-in',
  };
  
  return (
    <div style={stabilizingStyle}>
      {children}
    </div>
  );
}
