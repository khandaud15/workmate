'use client';

import DashboardLayout from '../../components/DashboardLayout';
import React from 'react';

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="resume-section bg-[#0a192f] min-h-screen px-1 sm:px-4">
      {children}
    </div>
  );
}
