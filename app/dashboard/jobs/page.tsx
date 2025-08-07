'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import JobSearchInterface from '@/app/components/JobSearch/JobSearchInterface';
import DashboardLayout from '../../components/DashboardLayout';

export default function DashboardJobsPage() {
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
      <DashboardLayout defaultCollapsed={true}>
        <div className="w-full px-0 sm:px-4 md:max-w-7xl md:mx-auto md:p-8 lg:p-10">
          <JobSearchInterface />
        </div>
      </DashboardLayout>
    </>
  );
}
