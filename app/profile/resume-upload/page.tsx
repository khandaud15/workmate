'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

export default function ResumeUpload() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setSelectedFile(file);
    setUploadStatus('uploading');

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Upload to our API
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      console.log('Upload response:', data);
      
      if (!data.identifier) {
        throw new Error('No identifier received from upload');
      }
      
      setUploadStatus('success');

      // Store the Affinda identifier
      console.log('Storing identifier:', data.identifier);
      localStorage.setItem('resumeIdentifier', data.identifier);
      
      // Add a timestamp to indicate when the resume was last uploaded
      // This will help other pages know when to refresh their data
      localStorage.setItem('resumeUploadTimestamp', Date.now().toString());
      
      // Clear any previously stored resume data to ensure we don't mix old and new data
      localStorage.removeItem('resumeData');
      localStorage.removeItem('parsedResumeData');
      localStorage.removeItem('workExperience');
      localStorage.removeItem('resumeWorkExperience');
      localStorage.removeItem('educationData');
      localStorage.removeItem('completeResumeData');

      // Redirect to scan page after a brief delay
      setTimeout(() => {
        router.push('/profile/scan');
      }, 1000);
    } catch (error) {
      console.error('Error uploading resume:', error);
      setUploadStatus('idle');
      
      // Get the error message
      let errorMessage = 'Failed to upload resume.';
      if (error instanceof Error) {
        errorMessage += ' ' + error.message;
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fefcf9]">
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        {/* Headers */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Upload a resume
          </h1>
          <p className="text-lg text-[#64748B]">
            You must upload a resume to complete your profile and apply to jobs.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Upload Area */}
          <div className="flex-1">
            <div
              className={`relative rounded-xl border-2 border-dashed ${
                dragActive ? 'border-[#0e3a68] bg-[#0e3a68]/5' : 'border-gray-300'
              } ${
                uploadStatus === 'success' ? 'border-[#0e3a68] bg-[#0e3a68]/5' : ''
              } transition-colors`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="resume-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.html,.rtf,.txt"
                onChange={handleFileInput}
              />
              <label
                htmlFor="resume-upload"
                className="flex flex-col items-center justify-center p-12 cursor-pointer"
              >
                <div className="rounded-full bg-[#0e3a68]/10 p-4 mb-4">
                  {uploadStatus === 'success' ? (
                    <svg className="h-8 w-8 text-[#0e3a68]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : uploadStatus === 'uploading' ? (
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0e3a68] border-t-transparent" />
                  ) : (
                    <ArrowUpTrayIcon className="h-8 w-8 text-[#0e3a68]" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {uploadStatus === 'success'
                    ? 'Resume uploaded!'
                    : uploadStatus === 'uploading'
                    ? 'Uploading...'
                    : 'Drag and drop a file here'}
                </h3>
                {selectedFile ? (
                  <p className="text-gray-600">{selectedFile.name}</p>
                ) : (
                  <button className="mt-4 px-6 py-2 bg-[#0e3a68] text-white font-medium rounded-lg hover:bg-[#0c3156] focus:outline-none focus:ring-2 focus:ring-[#0e3a68] focus:ring-offset-2 transition-colors">
                    Browse
                  </button>
                )}
              </label>
            </div>
            <p className="mt-4 text-center text-sm text-[#64748B]">
              You can upload the following file types: DOC, DOCX, PDF, HTML, RTF, TXT
            </p>
          </div>

          {/* Integration Options */}
          <div className="lg:w-1/3 flex flex-col items-center justify-center gap-4">
            <div className="text-gray-500 font-medium">OR</div>
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#4285F4] rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:ring-offset-2 transition-colors">
              <Image src="/google-drive.svg" alt="Google Drive" width={24} height={24} />
              Google Drive
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#0061FF] rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0061FF] focus:ring-offset-2 transition-colors">
              <Image src="/dropbox.svg" alt="Dropbox" width={24} height={24} />
              Dropbox
            </button>
          </div>
        </div>
      </main>

      {/* Fixed Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-3 sm:py-4 max-w-5xl">
          <div className="flex justify-between items-center w-full">
            <button
              onClick={() => router.push('/profile/questions')}
              className="flex items-center w-[80px] sm:w-[100px] px-4 sm:px-6 py-2 sm:py-2.5 text-[#0e3a68] text-sm sm:text-base font-medium border-2 border-[#0e3a68] rounded-lg hover:bg-[#0e3a68]/5 transition-colors"
            >
              <ArrowLeftIcon className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Back
            </button>
            <button
              onClick={() => router.push('/profile/scan')}
              disabled={uploadStatus !== 'success'}
              className="flex items-center w-[80px] sm:w-[100px] px-4 sm:px-6 py-2 sm:py-2.5 bg-[#0e3a68] text-white text-sm sm:text-base font-medium rounded-lg border-2 border-[#0e3a68] hover:bg-[#0c3156] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
