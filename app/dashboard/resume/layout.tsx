// This layout ensures consistent sidebar hiding for all resume-related pages
import DashboardLayout from '../../components/DashboardLayout';
import React from 'react';

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="resume-section bg-[#0e0c12] min-h-screen">
      <DashboardLayout>{children}</DashboardLayout>
    </div>
  );
}
