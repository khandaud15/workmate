'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckIcon } from '@heroicons/react/24/solid';

type ResumeData = {
  data: {
    name?: string | {
      first?: string;
      last?: string;
      middle?: string;
      raw?: string;
      title?: string;
    };
    email?: string;
    phone?: string;
    education?: Array<{
      organization?: string;
      accreditation?: {
        education?: string;
      };
      dates?: {
        completionDate?: string;
      };
    }>;
    workExperience?: Array<{
      jobTitle?: string;
      organization?: string;
      dates?: {
        startDate?: string;
        endDate?: string;
      };
    }>;
    skills?: Array<{
      name?: string;
    }>;
  };
};

type ScanStep = {
  id: string;
  label: string;
  status: 'pending' | 'scanning' | 'complete';
};

export default function ResumeScan() {
  const router = useRouter();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<ScanStep[]>([
    { id: 'education', label: 'Scanning your education', status: 'pending' },
    { id: 'experience', label: 'Scanning your experience', status: 'pending' },
    { id: 'skills', label: 'Checking for skills', status: 'pending' },
  ]);

  // Simulate step progression
  useEffect(() => {
    const stepDurations = [2000, 3000, 4000]; // Time for each step
    let currentStep = 0;

    const progressSteps = () => {
      if (currentStep < steps.length) {
        setSteps(prev =>
          prev.map((step, index) => ({
            ...step,
            status:
              index === currentStep
                ? 'scanning'
                : index < currentStep
                ? 'complete'
                : 'pending',
          }))
        );
        currentStep++;
      }
    };

    progressSteps(); // Start first step immediately

    // Schedule subsequent steps
    const intervals = stepDurations.map((duration, index) => {
      return setTimeout(() => {
        progressSteps();
        if (index === stepDurations.length - 1) {
          setIsReady(true);
        }
      }, duration);
    });

    return () => intervals.forEach(clearTimeout);
  }, []);

  // Poll Affinda API
  useEffect(() => {
    const identifier = localStorage.getItem('resumeIdentifier');
    console.log('Resume identifier from localStorage:', identifier);
    if (!identifier) {
      setError('No resume identifier found');
      return;
    }

    let retryCount = 0;
    const maxRetries = 30; // 30 seconds timeout
    
    const pollInterval = setInterval(async () => {
      try {
        console.log(`Polling attempt ${retryCount + 1}...`);
        const response = await fetch(`/api/resume/scan?identifier=${identifier}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch resume data');
        }
        
        const data = await response.json();
        console.log('Scan response:', data);
        
        // Check if we have the parsed data
        if (data.data) {
          console.log('Resume data received:', data.data);
          setResumeData(data);
          clearInterval(pollInterval);
          
          // Save resume data and redirect immediately
          localStorage.setItem('resumeData', JSON.stringify(data.data));
          router.push('/profile/contact-info');
        } else {
          console.log('Resume still processing...');
          retryCount++;
          
          if (retryCount >= maxRetries) {
            console.error('Timeout waiting for resume processing');
            setError('Resume processing timed out. Please try again.');
            clearInterval(pollInterval);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        clearInterval(pollInterval);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, []);

  const StepIcon = ({ status }: { status: string }) => {
    if (status === 'complete') {
      return (
        <div className="h-5 w-5 rounded-full bg-[#3BA17C] p-1">
          <CheckIcon className="h-3 w-3 text-white" />
        </div>
      );
    }
    if (status === 'scanning') {
      return (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#3BA17C] border-t-transparent" />
      );
    }
    return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <main className="w-full max-w-md px-4 py-12">
        <div className="text-center">
          {error ? (
            <>
              <h1 className="mb-8 text-3xl font-bold text-gray-900">
                Something went wrong
              </h1>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => router.push('/profile/resume-upload')}
                className="px-6 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
            </>
          ) : (
            <>
              <h1 className="mb-8 text-3xl font-bold text-gray-900">
                Processing your resume...
              </h1>
              {/* Scanning Steps */}
              <div className="mb-12">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className="mb-4 flex items-center justify-center space-x-3"
                  >
                    <StepIcon status={step.status} />
                    <span
                      className={`${
                        step.status === 'complete'
                          ? 'text-[#3BA17C]'
                          : step.status === 'scanning'
                          ? 'text-gray-900'
                          : 'text-gray-500'
                      } text-sm font-medium`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
