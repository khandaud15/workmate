'use client';

import React from 'react';
import { ArrowLeftIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ResumeUpload() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = React.useState<'idle' | 'uploading' | 'success'>('idle');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('uploading');
      // Simulate upload process
      setTimeout(() => {
        setUploadStatus('success');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-8 pb-28">

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
            className={`flex cursor-pointer flex-col items-center rounded-xl border-2 ${
              uploadStatus === 'success'
                ? 'border-green-500 bg-green-50'
                : uploadStatus === 'uploading'
                ? 'border-gray-300 bg-gray-50'
                : 'border-gray-200 bg-white hover:border-black'
            } p-8 transition-all`}
          >
            <div className={`mb-4 rounded-full p-4 ${
              uploadStatus === 'success'
                ? 'bg-green-100'
                : uploadStatus === 'uploading'
                ? 'bg-gray-100'
                : 'bg-green-100'
            }`}>
              {uploadStatus === 'success' ? (
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : uploadStatus === 'uploading' ? (
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600" />
              ) : (
                <ArrowUpTrayIcon className="h-8 w-8 text-green-600" />
              )}
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              {uploadStatus === 'success'
                ? 'Resume uploaded!'
                : uploadStatus === 'uploading'
                ? 'Uploading...'
                : 'Upload your resume'}
            </h3>
            {selectedFile ? (
              <p className="text-gray-600">{selectedFile.name}</p>
            ) : (
              <p className="text-gray-600">We'll auto-fill your answers.</p>
            )}
            <input
              type="file"
              id="resume-upload"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleUpload}
            />
          </label>
        </div>

      </div>

      {/* Sticky Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-4 max-w-3xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center rounded-lg border-2 border-[#0e3a68] px-6 py-2.5 text-[#0e3a68] transition-colors hover:bg-[#0e3a68]/5"
            >
              <ArrowLeftIcon className="mr-2 h-5 w-5" />
              Back
            </button>
            <button
              onClick={() => router.push('/onboarding/job-titles')}
              disabled={uploadStatus !== 'success'}
              className="rounded-lg bg-[#0e3a68] px-8 py-2.5 font-medium text-white transition-colors hover:bg-[#0c3156] disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
