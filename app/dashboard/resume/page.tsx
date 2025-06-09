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
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-10">
          <h1 className="text-2xl font-bold text-white mt-2 mb-8 text-center block md:hidden">Your Resumes</h1>
          <div className="flex flex-col">
            <ResumeList />
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
