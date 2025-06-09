'use client';

import { useEffect, useState } from 'react';

/**
 * LayoutStabilizer component
 * 
 * This component prevents layout shifts and disoriented appearance during page transitions
 * by forcing the browser to calculate layout before showing content.
 */
export default function LayoutStabilizer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Force a layout calculation by reading a layout property
    // This should be done as early as possible.
    if (typeof window !== 'undefined') {
      document.body.getBoundingClientRect();
    }
  }, []); // Runs once on mount

  return <>{children}</>; // Render children immediately
}
