'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

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
              <div className="h-full w-3/4 rounded-full bg-[#0e3a68]"></div>
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
              <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                <span className="text-base font-medium text-gray-500">3</span>
              </div>
              <div className="mt-3 flex flex-col items-center">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">STEP 3</span>
                <span className="mt-1 text-sm font-medium text-gray-500">Finalize</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SkillsPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // State for new skill input
  const [newSkill, setNewSkill] = useState<string>('');

  // Load skills data from localStorage and API
  useEffect(() => {
    const fetchSkillsData = async () => {
      try {
        // Check localStorage first
        const savedSkills = localStorage.getItem('skillsData');
        const parsedResumeData = localStorage.getItem('parsedResumeData');
        const rawResumeData = localStorage.getItem('rawResumeData');
        const resumeIdentifier = localStorage.getItem('resumeIdentifier');

        // Try to parse skills from raw resume data first
        if (rawResumeData) {
          try {
            const rawData = JSON.parse(rawResumeData);
            if (rawData.skills && Array.isArray(rawData.skills) && rawData.skills.length > 0) {
              const formattedSkills = parseSkillsFromResume(rawData);
              setSkills(formattedSkills);
              localStorage.setItem('skillsData', JSON.stringify(formattedSkills));
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.error('Error parsing raw resume data:', e);
          }
        }

        // Try parsed resume data
        if (parsedResumeData) {
          try {
            const parsedData = JSON.parse(parsedResumeData);
            const formattedSkills = parseSkillsFromResume(parsedData);
            if (formattedSkills.length > 0) {
              setSkills(formattedSkills);
              localStorage.setItem('skillsData', JSON.stringify(formattedSkills));
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.error('Error parsing resume data:', e);
          }
        }

        // If we have a resume identifier, try fetching from API
        if (resumeIdentifier) {
          try {
            const response = await fetch(`/api/resume/scan?identifier=${resumeIdentifier}`);
            if (response.ok) {
              const data = await response.json();
              if (data.data?.skills) {
                const formattedSkills = parseSkillsFromResume(data.data);
                setSkills(formattedSkills);
                localStorage.setItem('skillsData', JSON.stringify(formattedSkills));
                setIsLoading(false);
                return;
              }
            }
          } catch (error) {
            console.error('Error fetching skills data from API:', error);
          }
        }

        // If we have saved skills data, use it
        if (savedSkills) {
          setSkills(JSON.parse(savedSkills));
        } else {
          // If no skills found, set empty array
          setSkills([]);
        }
      } catch (error) {
        console.error('Error loading skills data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkillsData();
  }, []);

  // Parse skills data from resume
  const parseSkillsFromResume = (resumeData: any): string[] => {
    if (!resumeData) return [];
    
    // Try different possible paths where skills data might be stored
    const possiblePaths = [
      'skills',
      'skill',
      'skillset',
      'data.skills',
      'data.skill',
      'data.data.skills'
    ];
    
    let skillItems: any[] = [];
    
    // Find skills data in the resume
    for (const path of possiblePaths) {
      const pathParts = path.split('.');
      let current = resumeData;
      let found = true;
      
      for (const part of pathParts) {
        if (current && current[part] !== undefined) {
          current = current[part];
        } else {
          found = false;
          break;
        }
      }
      
      if (found && Array.isArray(current) && current.length > 0) {
        skillItems = current;
        break;
      } else if (found && typeof current === 'object') {
        // Handle case where skills are objects with name/level properties
        const skillsArray = Object.values(current).filter(item => 
          typeof item === 'object' && item !== null && 'name' in item
        );
        if (skillsArray.length > 0) {
          skillItems = skillsArray;
          break;
        }
      }
    }
    
    // Try to find skills data in the root if not found in specific paths
    if (skillItems.length === 0) {
      for (const key in resumeData) {
        if (Array.isArray(resumeData[key]) && 
            (key.toLowerCase().includes('skill') || key.toLowerCase().includes('tool'))) {
          skillItems = resumeData[key];
          break;
        }
      }
    }
    
    // Process skill items
    return skillItems.map((skill: any) => {
      if (typeof skill === 'string') {
        return skill.trim();
      } else if (typeof skill === 'object' && skill !== null) {
        // Handle different skill formats
        return skill.name || skill.skill || skill.keyword || '';
      }
      return '';
    }).filter(Boolean); // Remove empty strings
  };

  // Toggle skill selection
  const toggleSkill = (skill: string) => {
    setHasUserInteracted(true);
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  // Handle back button
  const handleBack = () => {
    // Save skills before navigating
    if (hasUserInteracted) {
      localStorage.setItem('skillsData', JSON.stringify(skills));
    }
    router.push('/profile/education');
  };

  // Handle next step
  const handleNextStep = () => {
    // Save skills before navigating
    localStorage.setItem('skillsData', JSON.stringify(skills));
    // Navigate to finalize page
    router.push('/profile/finalize');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your skills information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fefcf9]">
      <main className="container mx-auto px-0 sm:px-4 py-5 sm:py-8 max-w-5xl">
        <ProgressIndicator />
        
        <div className="mx-auto max-w-4xl px-0 sm:px-6 lg:px-8 mt-8 w-full">
          <div className="bg-white rounded-lg border border-black/70 p-5 sm:p-6 mb-8 transform hover:translate-y-[-2px] transition-transform">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Skills</h2>
            
            <div className="mb-4">
              
              {/* Skills Selection */}
              <div className="border border-black/40 rounded-lg p-4">
                <div className="flex flex-wrap gap-2 mb-4 max-h-[200px] overflow-y-auto p-2">
                  {skills.length > 0 ? (
                    skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-lg border border-black/20 bg-[#f0f9ff] px-3 py-1.5 text-sm text-[#0e3a68] font-helvetica-neue-bold"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic w-full text-center py-4">No skills added yet. Add skills below.</p>
                  )}
                </div>
                
                {/* Add New Skill Form */}
                <div className="mt-4">
                  <div className="flex">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Enter a skill or tool"
                      className="flex-grow p-2 border border-black/30 rounded-l-md focus:outline-none focus:ring-1 focus:ring-[#0e3a68]/30 font-helvetica-neue-bold"
                    />
                    <button
                      onClick={() => {
                        if (newSkill.trim()) {
                          toggleSkill(newSkill.trim());
                          setNewSkill('');
                        }
                      }}
                      disabled={!newSkill.trim()}
                      className="bg-[#0e3a68] text-white px-4 py-2 rounded-r-md border border-[#0e3a68] hover:bg-[#0c3156] disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed font-helvetica-neue-bold"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
              
              {skills.length < 3 && (
                <p className="mt-2 text-sm text-amber-600">
                  Please select at least {3 - skills.length} more skill
                  {3 - skills.length !== 1 ? 's' : ''}.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Add custom font styles */}
        <style jsx global>{`
          .font-helvetica-neue-bold {
            font-family: 'Helvetica Neue Bold', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-weight: 700;
          }
          .font-helvetica-medium {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-weight: 500;
          }
          .font-helvetica-light-medium {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-weight: 600;
          }
          .font-helvetica {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          }
          /* Add black borders to all input fields with consistent height */
          input, textarea, .react-datepicker__input-container input {
            border: 1px solid rgba(0, 0, 0, 0.7) !important;
            border-radius: 0.375rem !important;
            height: 48px !important;
            padding: 0.75rem !important;
            font-size: 1rem !important;
            line-height: 1.5 !important;
          }
          
          /* Ensure textarea has appropriate height */
          textarea {
            height: auto !important;
            min-height: 120px !important;
          }
        `}</style>
        
        {/* Sticky Navigation - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <div className="mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-4 w-full max-w-4xl">
            <div className="flex justify-between items-center w-full">
              <button
                onClick={handleBack}
                className="flex items-center w-[80px] sm:w-[100px] rounded-lg border-2 border-[#0e3a68] px-4 sm:px-6 py-2 sm:py-2.5 text-[#0e3a68] text-sm sm:text-base transition-colors hover:bg-[#0e3a68]/5"
              >
                <FaArrowLeft className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Back
              </button>
              <button
                onClick={handleNextStep}
                disabled={skills.length < 3}
                className={`flex items-center w-[80px] sm:w-[100px] rounded-lg border-2 border-[#0e3a68] px-4 sm:px-6 py-2 sm:py-2.5 ${
                  skills.length >= 3 
                    ? 'bg-[#0e3a68] text-white hover:bg-[#0c3156]' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                } text-sm sm:text-base font-medium transition-colors`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
