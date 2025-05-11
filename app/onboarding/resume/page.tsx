'use client';

import { ArrowLeftIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ResumeUpload() {
  const router = useRouter();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle file upload logic here
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement file upload logic
      console.log('File selected:', file.name);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-8">

      {/* Main Content */}
      <div className="mx-auto max-w-3xl">
        {/* Headers */}
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-4xl font-bold text-gray-900">
            Upload your resume to get great matches
          </h1>
          <p className="text-lg text-gray-600">
            Your resume will also help us complete applications faster.
          </p>
        </div>

        {/* Upload Card */}
        <div className="mb-12">
          <label
            htmlFor="resume-upload"
            className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-gray-200 bg-white p-8 transition-colors hover:border-black"
          >
            <div className="mb-4 rounded-full bg-green-100 p-4">
              <ArrowUpTrayIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              Upload your resume
            </h3>
            <p className="text-gray-600">We'll auto-fill your answers.</p>
            <input
              type="file"
              id="resume-upload"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleUpload}
            />
          </label>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center rounded-lg border-2 border-black px-6 py-2.5 text-black transition-colors hover:bg-gray-50"
          >
            <ArrowLeftIcon className="mr-2 h-5 w-5" />
            Back
          </button>
          <button
            onClick={() => router.push('/onboarding/next-step')}
            className="rounded-lg bg-black px-8 py-2.5 font-medium text-white transition-colors hover:bg-black/80"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
