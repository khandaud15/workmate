'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ResumeList from '../../components/ResumeList';
import DashboardLayout from '../../components/DashboardLayout';

export default function ResumePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen bg-[#12101a]">Loading...</div>;
  }

  return (
    <>
      {/* Hide expanded sidebar and mobile sidebar only on desktop for resume page */}
      <style jsx global>{`
        @media (min-width: 1024px) {
          .sidebar.expanded {
            display: none !important;
          }
          .mobile-sidebar {
            display: none !important;
          }
        }
      `}</style>
      
      <DashboardLayout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-white mb-8">Your Resumes</h1>
              <ResumeList />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
