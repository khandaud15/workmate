'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ResumeUpload() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = React.useState<'idle' | 'uploading' | 'success'>('idle');
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // Function to clear all resume-related data from localStorage
  const clearLocalStorageData = () => {
    console.log('Clearing all resume data from localStorage before new upload');
    localStorage.removeItem('resumeIdentifier');
    localStorage.removeItem('parsedResumeData');
    localStorage.removeItem('rawResumeData');
    localStorage.removeItem('resumeData');
    localStorage.removeItem('workExperiences');
    localStorage.removeItem('educationData');
    localStorage.removeItem('skillsData');
    // Clear any other potential resume-related items
    const keysToCheck = Object.keys(localStorage);
    keysToCheck.forEach(key => {
      if (key.includes('resume') || key.includes('experience') || 
          key.includes('education') || key.includes('skill') || 
          key.includes('parsed')) {
        localStorage.removeItem(key);
      }
    });
  };

  // Improved file handler with better error handling and logging
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    // Clear localStorage before uploading a new resume
    clearLocalStorageData();
    
    setSelectedFile(file);
    setUploadStatus('uploading');
    setUploadError(null);
    console.log('Starting upload process for file:', file.name);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Sending file to /api/resume/upload...');
      
      // Upload to API with cache busting
      const res = await fetch(`/api/resume/upload?nocache=${Date.now()}`, {
        method: 'POST',
        body: formData,
        // Prevent browser from caching the request
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'same-origin' // Ensure cookies are sent for authentication
      });
      
      console.log('Response received:', res.status, res.statusText);
      
      if (!res.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON
        }
        
        console.error('Upload failed:', errorMessage);
        setUploadStatus('idle');
        setUploadError(errorMessage);
        return;
      }
      
      const data = await res.json();
      console.log('Upload successful! Response:', data);
      setUploadStatus('success');
      
      // Verify the response contains user-specific data
      if (data.parsedResumeUrl) {
        // Store minimal information in localStorage
        localStorage.setItem('resumeIdentifier', 'true');
        localStorage.setItem('resumeUploadTimestamp', new Date().toISOString());
        console.log('Resume identifier stored in localStorage');
        
        // Instead of storing the parsed data in localStorage, use the API
        try {
          console.log('Fetching fresh parsed resume data from server...');
          // Use cache-busting to ensure we get fresh data
          const parseRes = await fetch(`/api/resume/get-parsed-data?fresh=${Date.now()}`, {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            },
            credentials: 'same-origin'
          });
          
          if (parseRes.ok) {
            const parseData = await parseRes.json();
            console.log('Parsed resume data fetched successfully from server');
            
            // We don't need to store this in localStorage anymore
            // The useResumeData hook will fetch it directly from the server
          } else {
            console.error('Failed to fetch parsed resume data:', parseRes.status, parseRes.statusText);
          }
        } catch (parseErr) {
          console.error('Error fetching parsed resume data:', parseErr);
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadStatus('idle');
      setUploadError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };




  // Debug: Add a button to test upload directly
  const debugFakeUpload = () => {
    const fakeFile = new File(["test content"], "debug.txt", { type: "text/plain" });
    console.log('Debug: Creating fake file for testing');
    handleFile(fakeFile);
  };

  return (
    <div className="min-h-screen bg-[#fefcf9] p-6 md:p-8 pb-28">
      <div style={{color:'red',fontWeight:'bold',fontSize:'24px'}}>DEBUG MARKER - UPLOAD FIXED</div>

      {/* Debug Button */}
      <div className="mb-4">
        <button 
          onClick={() => {
            console.log('Debug button clicked');
            debugFakeUpload();
          }} 
          style={{ background: '#fbbf24', color: '#111', padding: '8px 16px', borderRadius: '6px' }}
        >
          Debug: Trigger Upload Handler
        </button>
      </div>

      {/* Debug Visible File Upload */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="file"
          id="debug-upload-input"
          accept=".pdf,.doc,.docx"
          onChange={e => {
            if (e.target.files && e.target.files[0]) {
              setSelectedFile(e.target.files[0]);
              console.log('File selected via debug input:', e.target.files[0].name);
            }
          }}
        />
        <button
          style={{ background: '#fbbf24', color: '#111', padding: '8px 16px', borderRadius: '6px' }}
          onClick={() => {
            console.log('Debug upload button clicked');
            if (selectedFile) {
              console.log('Starting upload of selected file:', selectedFile.name);
              handleFile(selectedFile);
            } else {
              console.log('No file selected');
              alert('No file selected');
            }
          }}
        >
          Debug: Upload File
        </button>
      </div>
      
      {/* Error display */}
      {uploadError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          Upload Error: {uploadError}
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-3xl">
        {/* Headers */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Upload your resume to get great matches
          </h1>
          <p className="text-base text-gray-600">
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
              {uploadStatus === 'success' && (
                <span className="text-green-700 text-base font-semibold block mt-2">You can proceed to the next step.</span>
              )}
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
              onChange={handleFileInput}
              disabled={uploadStatus === 'success'}
            />
          </label>
        </div>

      </div>

      {/* Sticky Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-3 sm:py-4 max-w-3xl">
          <div className="flex justify-between items-center w-full px-2">
            <button
              onClick={() => router.back()}
              className="flex items-center w-[80px] sm:w-[100px] rounded-lg border-2 border-[#0e3a68] px-4 sm:px-6 py-2 sm:py-2.5 text-[#0e3a68] text-sm sm:text-base transition-colors hover:bg-[#0e3a68]/5"
            >
              <ArrowLeftIcon className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Back
            </button>
            <button
              onClick={() => router.push('/onboarding/job-titles')}
              disabled={uploadStatus !== 'success'}
              className="flex items-center w-[80px] sm:w-[100px] rounded-lg border-2 border-[#0e3a68] px-4 sm:px-6 py-2 sm:py-2.5 bg-[#0e3a68] text-white text-sm sm:text-base transition-colors hover:bg-[#0c3156] disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
