'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import JobSearchInterface from '@/app/components/JobSearch/JobSearchInterface';
import DashboardLayout from '../../components/DashboardLayout';

export default function DashboardJobsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Set theme color for this page
  useEffect(() => {
    // Set theme color meta tag
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#0a192f');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#0a192f';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }

    // Cleanup function to reset theme color when component unmounts
    return () => {
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#000000'); // Default color
      }
    };
  }, []);

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
