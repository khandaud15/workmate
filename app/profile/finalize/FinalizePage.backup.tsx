'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaChevronDown, FaChevronUp } from 'react-icons/fa';

// Types
type KeyQuestions = Record<string, string>;

interface ContactInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  linkedIn?: string;
  portfolio?: string;
  [key: string]: any;
}

interface WorkExperience {
  id?: string;
  title?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  [key: string]: any;
}

interface Education {
  id?: string;
  school?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  description?: string;
  [key: string]: any;
}

// Progress Indicator Component
const ProgressIndicator = () => {
  return (
    <div className="mb-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="relative">
          {/* Progress Lines */}
          <div className="absolute left-0 right-0 top-4">
            {/* Line between Step 1 and 2 */}
            <div className="absolute left-[calc(16.666%+16px)] right-[calc(50%-16px)] h-1 rounded-full bg-gray-200">
              <div className="h-full w-full rounded-full bg-[#0e3a68]"></div>
            </div>
            {/* Line between Step 2 and 3 */}
            <div className="absolute left-[calc(50%+16px)] right-[calc(16.666%-16px)] h-1 rounded-full bg-gray-200">
              <div className="h-full w-full rounded-full bg-[#0e3a68]"></div>
            </div>
          </div>

          {/* Step Circles and Labels */}
          <div className="relative flex justify-between items-center w-full">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0e3a68] bg-white">
                <span className="text-base font-bold text-[#0e3a68]">1</span>
              </div>
              <div className="mt-3 flex flex-col items-center">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">STEP 1</span>
                <span className="mt-1 text-sm font-bold text-black">Key questions</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0e3a68] bg-[#0e3a68]">
                <span className="text-base font-medium text-white">2</span>
              </div>
              <div className="mt-3 flex flex-col items-center">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">STEP 2</span>
                <span className="mt-1 text-sm font-bold text-black">Resume review</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0e3a68] bg-[#0e3a68]">
                <span className="text-base font-medium text-white">3</span>
              </div>
              <div className="mt-3 flex flex-col items-center">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">STEP 3</span>
                <span className="mt-1 text-sm font-bold text-black">Finalize</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Collapsible Section Component
const CollapsibleSection = ({ 
  title, 
  children, 
  defaultOpen = false 
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full justify-between items-center text-left focus:outline-none"
      >
        <h2 className="text-xl font-helvetica-neue-bold text-[#0e3a68]">{title}</h2>
        {isOpen ? (
          <FaChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <FaChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
};

const FinalizePage: React.FC = () => {
  const router = useRouter();
  
  // State initialization with proper types
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [keyQuestions, setKeyQuestions] = useState<KeyQuestions>({});
  const [contactInfo, setContactInfo] = useState<ContactInfo>({});
  const [experience, setExperience] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [lastProcessedResume, setLastProcessedResume] = useState<string | null>(null);
  
  // Navigation handlers
  const handleBack = useCallback(() => {
    router.push('/profile/skills');
  }, [router]);

  const handleSubmit = useCallback(() => {
    alert('Profile completed successfully!');
    router.push('/dashboard');
  }, [router]);
  
  // Helper function to format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Present';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  // Load data from localStorage helper function
  const loadFromLocalStorage = useCallback(<T,>(key: string): T | null => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      return null;
    }
  }, []);

  // Load all data when component mounts or when resume changes
  useEffect(() => {
    const loadAllData = async () => {
      try {
        console.log('Loading data for finalize page...');
        
        // Get the current resume identifier and timestamp
        const resumeUploadTimestamp = localStorage.getItem('resumeUploadTimestamp');
        const lastProcessedTimestamp = localStorage.getItem('lastProcessedFinalizeTimestamp');
        
        // Check if we have a new resume upload
        const hasNewResume = resumeUploadTimestamp && resumeUploadTimestamp !== lastProcessedResume;
        
        if (hasNewResume && resumeUploadTimestamp) {
          console.log('New resume detected, clearing cached data');
          // Clear all cached data to force a fresh load
          localStorage.removeItem('resumeWorkExperience');
          localStorage.removeItem('userEditedWorkExperience');
          localStorage.removeItem('contactFormData');
          localStorage.removeItem('contactInfo');
          
          // Update the last processed timestamp
          setLastProcessedResume(resumeUploadTimestamp);
          localStorage.setItem('lastProcessedFinalizeTimestamp', resumeUploadTimestamp);
        }
        
        // Load all data in parallel
        const [
          questions,
          contactData,
          contactFormData,
          resumeExp,
          userEditedExp,
          eduData,
          skillsData
        ] = await Promise.all([
          loadFromLocalStorage<KeyQuestions>('keyQuestions'),
          loadFromLocalStorage<ContactInfo>('contactInfo'),
          loadFromLocalStorage<ContactInfo>('contactFormData'),
          loadFromLocalStorage<WorkExperience[]>('resumeWorkExperience'),
          loadFromLocalStorage<WorkExperience[]>('userEditedWorkExperience'),
          loadFromLocalStorage<Education[]>('education'),
          loadFromLocalStorage<string[]>('skills')
        ]);

        // Update state with loaded data
        if (questions) setKeyQuestions(questions);
        if (contactData) setContactInfo(contactData);
        else if (contactFormData) setContactInfo(contactFormData);
        
        if (resumeExp?.length) setExperience(resumeExp);
        else if (userEditedExp?.length) setExperience(userEditedExp);
        
        if (eduData) setEducation(eduData);
        if (skillsData) setSkills(skillsData);
        
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAllData();
  }, [loadFromLocalStorage, lastProcessedResume]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0e3a68] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fefcf9]">
      <main className="container mx-auto px-0 sm:px-4 py-5 sm:py-8 max-w-5xl">
        <ProgressIndicator />
        
        <div className="mx-auto max-w-4xl px-0 sm:px-6 lg:px-8 mt-8 w-full">
          <div className="bg-white rounded-lg border border-black/40 p-5 sm:p-6 mb-8 transform hover:translate-y-[-2px] transition-transform">
            <h1 className="text-3xl font-helvetica-neue-bold mb-4 text-[#0e3a68] text-center">Finalize</h1>
            <p className="text-lg font-helvetica-neue-bold text-[#0e3a68] mb-8 text-center">
              Check if all information is correct, and you're good to go!
            </p>

            <CollapsibleSection title="Key Questions" defaultOpen={true}>
              <div className="space-y-4">
                {Object.entries(keyQuestions).length > 0 ? (
                  Object.entries(keyQuestions).map(([question, answer]) => (
                    <div key={question} className="bg-white rounded-lg border border-black/70 p-5 sm:p-6 mb-4 relative w-full transform hover:translate-y-[-2px] transition-transform font-helvetica-neue-bold">
                      <h3 className="text-lg font-helvetica-neue-bold text-[#1e293b] mb-2">{question}</h3>
                      <p className="text-gray-700">{answer}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No key questions answered yet.</p>
                )}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Contact Information">
              <div className="space-y-4">
                <div className="bg-white rounded-lg border border-black/70 p-5 sm:p-6 relative w-full transform hover:translate-y-[-2px] transition-transform font-helvetica-neue-bold">
                  <div className="mb-6">
                    <h3 className="text-lg font-helvetica-neue-bold text-[#1e293b] mb-3">
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="text-gray-900">
                          {contactInfo.firstName} {contactInfo.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-gray-900">{contactInfo.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-gray-900">{contactInfo.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="text-gray-900">
                          {[contactInfo.city, contactInfo.state, contactInfo.country]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Experience">
              <div className="space-y-4">
                {experience.length > 0 ? (
                  experience.map((exp, index) => (
                    <div key={index} className="bg-white rounded-lg border border-black/70 p-5 sm:p-6 mb-6 relative w-full transform hover:translate-y-[-2px] transition-transform font-helvetica-neue-bold">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-helvetica-neue-bold text-[#1e293b]">
                            {exp.title}
                          </h3>
                          <p className="text-gray-700">{exp.company}</p>
                          {exp.location && (
                            <p className="text-sm text-gray-500">{exp.location}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-700">
                            {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                          </p>
                        </div>
                      </div>
                      {exp.description && (
                        <div className="mt-4">
                          <p className="text-gray-700 whitespace-pre-line">{exp.description}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No work experience added yet.</p>
                )}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Education">
              <div className="space-y-4">
                {education.length > 0 ? (
                  education.map((edu, index) => (
                    <div key={index} className="bg-white rounded-lg border border-black/70 p-5 sm:p-6 mb-6 relative w-full transform hover:translate-y-[-2px] transition-transform font-helvetica-neue-bold">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-helvetica-neue-bold text-[#1e293b]">
                            {edu.school}
                          </h3>
                          <p className="text-gray-700">
                            {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                          </p>
                          {edu.location && (
                            <p className="text-sm text-gray-500">{edu.location}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-700">
                            {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                          </p>
                        </div>
                      </div>
                      {edu.description && (
                        <div className="mt-4">
                          <p className="text-gray-700 whitespace-pre-line">{edu.description}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No education information added yet.</p>
                )}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Skills">
              <div className="space-y-4">
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No skills added yet.</p>
                )}
              </div>
            </CollapsibleSection>

            <div className="mt-8 flex justify-between">
              <button
                onClick={handleBack}
                className="flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-[#0e3a68] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0e3a68]"
              >
                <FaArrowLeft className="mr-2" /> Back
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#0e3a68] hover:bg-[#0c3258] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0e3a68]"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>

        {/* Add custom font styles */}
        <style jsx global>{`
          .font-helvetica-neue-bold {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            font-weight: 700;
          }
          
          .font-helvetica-neue-regular {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            font-weight: 400;
          }
          
          .font-helvetica-neue-light {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            font-weight: 300;
          }
          
          .font-helvetica-neue-medium {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            font-weight: 500;
          }
        `}</style>
      </main>
    </div>
  );
};

export default FinalizePage;
