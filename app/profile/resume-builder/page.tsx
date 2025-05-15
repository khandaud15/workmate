
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaCheck, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaMapMarkerAlt, 
  FaChevronLeft, 
  FaChevronRight,
  FaExclamationTriangle,
  FaSpinner,
  FaCode,
  FaCalendar
} from 'react-icons/fa';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// TypeScript interface for Work Experience
interface WorkExperience {
  id?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  responsibilities: string[];
  jobDescription?: string;
  isEditing?: boolean;
  isExpanded?: boolean;
}

// TypeScript interface for Resume Scan Status
interface ResumeScanStatus {
  isScanning: boolean;
  isComplete: boolean;
  errorMessage?: string;
}

// Type for Resume Experience from API
type ResumeExperience = {
  id?: string;
  jobTitle?: string;
  title?: string;
  position?: string;
  company?: string;
  employer?: string;
  organization?: string;
  startDate?: string;
  start_date?: string;
  dates?: {
    startDate?: string;
    start_date?: string;
    monthsInPosition?: number;
    isCurrent?: boolean;
    rawText?: string;
  };
  endDate?: string;
  end_date?: string;
  location?: string;
  responsibilities?: string[];
  description?: string;
  jobDescription?: string;
  text?: string;
  sectionType?: string;
  pageIndex?: number;
  bbox?: number[];
}

export default function ResumeBuilderPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(2); // Set to Resume Review step
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [scanStatus, setScanStatus] = useState<ResumeScanStatus>({
    isScanning: true,
    isComplete: false
  });
  // Track whether user has interacted with the form
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);

  // Typed state update functions
  const handleEditExperience = useCallback((index: number) => {
    setWorkExperience(prev => 
      prev.map((exp, i) => 
        i === index ? { ...exp, isEditing: true } : { ...exp, isEditing: false }
      )
    );
  }, []);

  const handleDeleteExperience = useCallback((index: number) => {
    setWorkExperience(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSaveExperience = (index: number, updatedExperience: WorkExperience) => {
    const newWorkExperiences = [...workExperience].map((exp, i) => 
      i === index ? { ...updatedExperience, isEditing: false } : exp
    );
    setWorkExperience(newWorkExperiences);
    
    // Set user interaction flag to true when a user saves a card
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }
  };

  const handleToggleExpand = useCallback((index: number) => {
    setWorkExperience(prev => 
      prev.map((exp, i) => 
        i === index ? { ...exp, isExpanded: !exp.isExpanded } : exp
      )
    );
  }, []);

  // Fetch parsed resume data from your API endpoint
  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        // Aggressive debugging log
        console.group('Resume Data Retrieval Process');
        console.time('Resume Data Fetch');
        
        // Set loading state
        setScanStatus({
          isScanning: true,
          isComplete: false
        });
        
        // Debugging: Comprehensive localStorage inspection
        console.log('🔍 Comprehensive localStorage Inspection:');
        const localStorageContents: Record<string, string | null> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            localStorageContents[key] = localStorage.getItem(key);
          }
        }
        console.table(localStorageContents);
        
        // Get the resume identifier from localStorage
        const identifier = localStorage.getItem('resumeIdentifier');
        const parsedResumeData = localStorage.getItem('parsedResumeData');
        const rawResumeData = localStorage.getItem('rawResumeData');
        
        console.log('🔑 Key Storage Values:');
        console.log('Resume Identifier:', identifier);
        console.log('Parsed Resume Data:', parsedResumeData);
        console.log('Raw Resume Data:', rawResumeData);
        
        // If no identifier and no parsed data, throw an error
        if (!identifier && !parsedResumeData && !rawResumeData) {
          throw new Error('No resume data sources found');
        }
        
        let workExperiences: any[] = [];
        let dataSource = 'none';
        
        // Try parsing from multiple sources with detailed logging
        const dataSources = [
          { name: 'Parsed Resume Data', data: parsedResumeData ? JSON.parse(parsedResumeData) : null },
          { name: 'Raw Resume Data', data: rawResumeData ? JSON.parse(rawResumeData) : null }
        ];
        
        const possiblePaths = [
          'work_experience', 'workExperience', 'work_experiences', 
          'jobs', 'positions', 'experience', 'professional_experience'
        ];
        
        for (const source of dataSources) {
          if (!source.data) continue;
          
          console.log(`🕵️ Searching in ${source.name}`);
          
          for (const path of possiblePaths) {
            const experiences = source.data[path] || source.data.data?.[path];
            
            if (experiences && Array.isArray(experiences)) {
              workExperiences = experiences;
              dataSource = source.name;
              console.log(`✅ Found experiences in path: ${path}`);
              break;
            }
          }
          
          if (workExperiences.length > 0) break;
        }
        
        // If no work experiences found in localStorage, try API
        if (workExperiences.length === 0 && identifier) {
          try {
            console.log('🌐 Attempting API Fetch');
            const response = await fetch(`/api/resume/scan?identifier=${identifier}`);
            
            if (!response.ok) {
              throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📡 API Response:', data);
            
            for (const path of possiblePaths) {
              if (data.data?.[path] && Array.isArray(data.data[path])) {
                workExperiences = data.data[path];
                dataSource = 'API';
                console.log(`✅ Found experiences in API path: ${path}`);
                break;
              }
            }
          } catch (apiError) {
            console.error('❌ API Fetch Error:', apiError);
          }
        }
        
        // If still no work experiences, add mock data for debugging
        if (workExperiences.length === 0) {
          console.warn('⚠️ No work experiences found. Adding mock data.');
          workExperiences = [
            {
              jobTitle: 'Senior Software Engineer',
              company: 'Mock Tech Solutions',
              startDate: 'Jan 2020',
              endDate: 'Present',
              responsibilities: [
                'Developed mock application',
                'Debugged data retrieval issues'
              ]
            }
          ];
          dataSource = 'mock';
        }
        
        console.log(`📊 Data Source: ${dataSource}`);
        console.log("🔍 Final Work Experience Array:");
        workExperiences.forEach((exp, i) => {
          console.log(`• Job Title: ${exp.jobTitle || exp.title || exp.position}`);
          console.log(`• Company: ${exp.company || exp.employer || exp.organization}`);
          console.log(`• Dates: ${exp.startDate || exp.start_date} – ${exp.endDate || exp.end_date}`);
          console.log("• Responsibilities Sources:");
          console.log({
            responsibilities: exp.responsibilities,
            description: exp.description,
            duties: (exp as any).duties,
            achievements: (exp as any).achievements,
            accomplishments: (exp as any).accomplishments,
            tasks: (exp as any).tasks,
            key_responsibilities: (exp as any).key_responsibilities,
            primary_responsibilities: (exp as any).primary_responsibilities,
            role_description: (exp as any).role_description,
            job_description: (exp as any).job_description,
            main_responsibilities: (exp as any).main_responsibilities,
            core_responsibilities: (exp as any).core_responsibilities
          });
        });
        console.log("📄 Parsed work experience object:", JSON.stringify(workExperiences, null, 2));
        
        // Process the work experiences
        const formattedWorkExperiences = workExperiences.map((exp: ResumeExperience) => {
          // Extract responsibilities from various possible formats
          let responsibilities: string[] = [];
          
          // Check for text field which might contain full job description
          if (exp.text && typeof exp.text === 'string') {
            // Split the text into job details and responsibilities
            const parts = exp.text.split(/\n•/);
            
            // If there are multiple parts, the first part is job details, rest are responsibilities
            if (parts.length > 1) {
              // Extract job details from the first part
              const jobDetailsParts = parts[0].split(',');
              
              // Parse job details
              const jobTitle = jobDetailsParts[0]?.trim() || '';
              const company = jobDetailsParts[1]?.trim() || '';
              
              // Extract date range
              const dateMatch = jobDetailsParts[jobDetailsParts.length - 1].match(/(\w+ \d{4})\s*-\s*(\w+|Present)/i);
              const startDate = dateMatch ? dateMatch[1] : '';
              const endDate = dateMatch ? dateMatch[2] : '';
              
              // Extract responsibilities (skip the first empty part)
              responsibilities = parts.slice(1).map(resp => resp.trim());
              
              console.log('Parsed Job Details:', {
                jobTitle,
                company,
                startDate,
                endDate
              });
              console.log('Extracted Responsibilities:', responsibilities);
            }
          }
          
          // Fallback to other responsibility sources
          if (responsibilities.length === 0) {
            if (Array.isArray(exp.responsibilities)) {
              responsibilities = exp.responsibilities;
            } else if (exp.responsibilities && typeof exp.responsibilities === 'string') {
              responsibilities = (exp.responsibilities && typeof exp.responsibilities === 'string') 
                ? (exp.responsibilities as string).split('\n').filter((line: string) => line.trim() !== '')
                : Array.isArray(exp.responsibilities) ? exp.responsibilities : [];
            } else if (exp.description && typeof exp.description === 'string') {
              responsibilities = (exp.description && typeof exp.description === 'string')
                ? (exp.description as string).split('\n').filter((line: string) => line.trim() !== '')
                : Array.isArray(exp.description) ? exp.description : [];
            } else if (Array.isArray(exp.description)) {
              responsibilities = exp.description;
            } else if (exp.jobDescription && typeof exp.jobDescription === 'string') {
              // Split jobDescription by bullet points
              responsibilities = exp.jobDescription
                .split(/\n[•\-*]/)
                .filter((line: string) => line.trim() !== '' && line.trim().length > 10)
                .map((line: string) => line.trim().replace(/^[•\-*]\s*/, ''));
            }
          }
          
          // Generate a unique ID if none exists
          const id = exp.id || `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          
          // Determine start date
          let startDate = '';
          if (exp.dates?.startDate) {
            startDate = exp.dates.startDate;
          } else if (exp.startDate) {
            startDate = exp.startDate;
          } else if (exp.start_date) {
            startDate = exp.start_date;
          } else if (exp.dates?.rawText) {
            // Try to extract date from raw text
            const dateMatch = exp.dates.rawText.match(/(\w+ \d{4})/i);
            startDate = dateMatch ? dateMatch[1] : '';
          }

          // Determine end date
          let endDate = '';
          if (exp.dates?.isCurrent) {
            endDate = 'Present';
          } else if (exp.endDate) {
            endDate = exp.endDate;
          } else if (exp.end_date) {
            endDate = exp.end_date;
          } else if (exp.dates?.rawText) {
            const dateMatch = exp.dates.rawText.match(/\w+ \d{4}\s*-\s*(\w+ \d{4}|Present)/i);
            endDate = dateMatch ? dateMatch[1] : '';
          }

          // Ensure location is a string, not an object
          let locationStr = '';
          if (exp.location) {
            if (typeof exp.location === 'string') {
              locationStr = exp.location;
            } else if (typeof exp.location === 'object' && exp.location !== null) {
              // Handle location object by extracting city and state or using formatted if available
              const loc = exp.location as any;
              if (loc.formatted) {
                locationStr = loc.formatted;
              } else if (loc.city && loc.state) {
                locationStr = `${loc.city}, ${loc.state}`;
              } else if (loc.city) {
                locationStr = loc.city;
              } else if (loc.rawInput) {
                locationStr = loc.rawInput;
              }
            }
          }

          return {
            id,
            jobTitle: exp.jobTitle || exp.title || exp.position || '',
            company: exp.company || exp.employer || exp.organization || '',
            startDate,
            endDate,
            location: locationStr, // Now we're using a string instead of possibly an object
            responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
            isExpanded: false,
            isEditing: false
          };
        });
        
        // Update work experience with parsed data
        if (formattedWorkExperiences.length > 0) {
          setWorkExperience(formattedWorkExperiences);
          
          // Update scan status to complete
          setScanStatus({
            isScanning: false,
            isComplete: true
          });
        } else {
          // No work experiences found
          setScanStatus({
            isScanning: false,
            isComplete: true,
            errorMessage: 'No work experience found in the resume. Please add your experience manually.'
          });
        }
      } catch (error) {
        console.error('Error in fetchResumeData:', error);
        setScanStatus({
          isScanning: false,
          isComplete: false,
          errorMessage: 'Failed to load parsed resume data. Please try again or enter information manually.'
        });
      }
    };

    // Ensure this runs only on client-side
    if (typeof window !== 'undefined') {
      fetchResumeData();
    }
  }, []);

  // Progress Indicator Component
  const ProgressIndicator = () => (
    <div className="mx-auto max-w-3xl px-4 pt-5 sm:pt-8 sm:px-6 lg:px-8">
      <div className="relative">
        {/* Progress Lines */}
        <div className="absolute left-0 right-0 top-4">
          {/* Line between Step 1 and 2 */}
          <div className="absolute left-[calc(16.666%+16px)] right-[calc(50%-16px)] h-1 rounded-full bg-gray-200">
            <div className="h-full w-full rounded-full bg-[#0e3a68]"></div>
          </div>
          {/* Line between Step 2 and 3 */}
          <div className="absolute left-[calc(50%+16px)] right-[calc(16.666%-16px)] h-1 rounded-full bg-gray-200"></div>
        </div>

        {/* Step Circles and Labels */}
        <div className="relative flex justify-between items-center w-[calc(100%+1rem)] -ml-2 -mr-2 sm:w-full sm:ml-0 sm:mr-0 sm:px-4">
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
  );

  // Loading indicator component
  const LoadingIndicator = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <FaSpinner className="animate-spin text-4xl text-[#0e3a68] mb-4" />
      <h3 className="text-xl font-medium text-gray-700">Processing your resume...</h3>
      <p className="text-gray-500 mt-2">Extracting work experience information</p>
    </div>
  );

  // Error message component
  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
      <div className="flex items-start">
        <FaExclamationTriangle className="text-red-500 mr-3 mt-1" />
        <div>
          <h3 className="text-lg font-medium text-red-800">Unable to process resume</h3>
          <p className="text-red-600 mt-1">{message}</p>
          <p className="text-gray-700 mt-4">You can proceed by adding your work experience manually below.</p>
        </div>
      </div>
    </div>
  );

  // Work Experience Card Component
  const WorkExperienceCard = ({ 
    experience, 
    index, 
    onEdit, 
    onDelete, 
    onSave,
    onToggleExpand
  }: { 
    experience: WorkExperience, 
    index: number, 
    onEdit: (index: number) => void,
    onDelete: (index: number) => void,
    onSave: (index: number, updatedExperience: WorkExperience) => void,
    onToggleExpand: (index: number) => void
  }) => {
    // Check if the experience card is complete, but only apply validation after user interaction
    const isComplete = !hasUserInteracted || isExperienceComplete(experience);
    // Removed local isEditing state
    const [editedExperience, setEditedExperience] = useState<WorkExperience>(experience);

    // Update local state when edit button is clicked
    useEffect(() => {
      setEditedExperience(experience);
    }, [experience]);

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // Immediately set isEditing to false before saving
      const updatedExperience = { ...editedExperience, isEditing: false };
      onSave(index, updatedExperience);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string, value: string } }) => {
      const { name, value } = 'target' in e ? e.target : e;
      
      if (name === 'responsibilities') {
        // Split by newline and filter out empty lines
        const responsibilities = value.split('\n')
          .map(line => line.trim())
          .filter(line => line !== '');
        
        // Ensure we have at least 3 items (pad with empty strings if needed)
        while (responsibilities.length < 3) {
          responsibilities.push(''); // Add empty placeholders to reach minimum of 3
        }
        
        setEditedExperience(prev => ({
          ...prev,
          responsibilities
        }));
      } else {
        setEditedExperience(prev => ({
          ...prev,
          [name]: value
        }));
      }
    };

    // Editing view
    if (experience.isEditing) {
      return (
        <div className="bg-white rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.1)] border border-black/20 p-5 mb-5 transform hover:translate-y-[-2px] transition-transform w-full">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-[#1e293b]">Job Title</label>
              <input
                type="text"
                name="jobTitle"
                value={editedExperience.jobTitle || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-[#173A6A]/30 focus:border-[#173A6A] transition-all duration-200 bg-white text-[#1e293b] text-base"
                style={{ WebkitTextFillColor: 'currentcolor', WebkitBoxShadow: '0 0 0px 1000px white inset' }}
                autoComplete="off"
                required
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-[#1e293b]">Company</label>
              <input
                type="text"
                name="company"
                value={editedExperience.company || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-[#173A6A]/30 focus:border-[#173A6A] transition-all duration-200 bg-white text-[#1e293b] text-base"
                style={{ WebkitTextFillColor: 'currentcolor', WebkitBoxShadow: '0 0 0px 1000px white inset' }}
                autoComplete="off"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-[#1e293b]">Start Date</label>
                <DatePicker
                  selected={editedExperience.startDate && !isNaN(Date.parse(editedExperience.startDate)) ? new Date(editedExperience.startDate) : null}
                  onChange={(date) => {
                    handleInputChange({
                      target: {
                        name: 'startDate',
                        value: date && !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : ''
                      }
                    });
                  }}
                  dateFormat="yyyy-MM-dd"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-[#173A6A]/30 focus:border-[#173A6A] transition-all duration-200 bg-white py-2 px-3 text-[#1e293b] text-base"
                  placeholderText="Select start date"
                  popperClassName="z-50"
                  popperPlacement="bottom-start"
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={15}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-[#1e293b]">End Date</label>
                <DatePicker
                  selected={editedExperience.endDate && !isNaN(Date.parse(editedExperience.endDate)) ? new Date(editedExperience.endDate) : null}
                  onChange={(date) => {
                    handleInputChange({
                      target: {
                        name: 'endDate',
                        value: date && !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : ''
                      }
                    });
                  }}
                  dateFormat="yyyy-MM-dd"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-[#173A6A]/30 focus:border-[#173A6A] transition-all duration-200 bg-white py-2 px-3 text-[#1e293b] text-base"
                  placeholderText="Select end date"
                  popperClassName="z-50"
                  popperPlacement="bottom-start"
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={15}
                />
              </div>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-[#1e293b]">Location</label>
              <input
                type="text"
                name="location"
                value={editedExperience.location || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-[#173A6A]/30 focus:border-[#173A6A] transition-all duration-200 bg-white text-[#1e293b] text-base"
                style={{ WebkitTextFillColor: 'currentcolor', WebkitBoxShadow: '0 0 0px 1000px white inset' }}
                autoComplete="off"
                placeholder="City, State, or Country"
              />
            </div>
            {/* Job Description field removed */}
            <div>
              <label htmlFor="responsibilities" className="block text-sm font-medium text-[#1e293b]">Responsibilities</label>
              <textarea
                name="responsibilities"
                value={Array.isArray(editedExperience.responsibilities) ? editedExperience.responsibilities.join('\n') : ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-[#173A6A]/30 focus:border-[#173A6A] transition-all duration-200 bg-white text-[#1e293b] text-base"
                style={{ WebkitTextFillColor: 'currentcolor', WebkitBoxShadow: '0 0 0px 1000px white inset' }}
                autoComplete="off"
                rows={4}
                placeholder="Enter responsibilities, one per line"
              />
            </div>
            <div className="flex justify-between items-center">
              <button 
                type="button" 
                onClick={() => {
                  setEditedExperience(experience); // Reset to original experience
                  onSave(index, {...experience, isEditing: false}); // Exit edit mode without saving changes
                }} 
                className="min-w-[96px] px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="min-w-[96px] px-4 py-2 rounded-md bg-[#173A6A] text-white hover:bg-opacity-90 transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      );
    }
    
    // Normal view
    return (
      <div className={`bg-white rounded-lg border ${isComplete ? 'border-black' : 'border-red-500'} p-5 sm:p-6 mb-6 relative w-full transform hover:translate-y-[-2px] transition-transform`}>
        {/* Card Number */}
        <div className="absolute top-0 left-0 w-10 h-10 flex items-center justify-center border-r border-b border-black rounded-tl-lg rounded-br-lg">
          <span className="text-lg font-medium text-[#64748b]">{index + 1}</span>
        </div>
        {/* Edit and Delete Icons */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <button 
            onClick={() => onEdit(index)}
            className="text-blue-600 hover:text-blue-800"
            aria-label="Edit Experience"
          >
            <FaEdit className="text-lg" />
          </button>
          <button 
            onClick={() => onDelete(index)}
            className="text-red-500 hover:text-red-700"
            aria-label="Delete Experience"
          >
            <FaTrash className="text-lg" />
          </button>
        </div>

        {/* Job Title and Company - Styled to match screenshot */}
        <div className="pr-14 mt-4 ml-9"> {/* Add right padding to avoid text overlapping with buttons, top margin to avoid number, and left margin to move content right */}
          <div className="flex flex-wrap items-baseline mb-1">
            <h3 className="text-lg sm:text-xl text-[#1e293b] font-helvetica-medium">{experience.jobTitle}</h3>
            <span className="mx-2 text-gray-400">|</span>
            <p className="text-lg sm:text-xl text-[#1e293b] font-helvetica-medium">{experience.company}</p>
          </div>
        </div>
        
        {/* Location and Date Range */}
        <div className="mb-3 ml-9">
          <p className="text-base">
            <span className="text-[#64748b] font-helvetica">Location:</span> <span className="text-[#1e293b] font-helvetica-light-medium">{typeof experience.location === 'string' ? experience.location : 'Not specified'} | {experience.startDate} - {experience.endDate || 'Present'}</span>
          </p>
        </div>

        {/* Responsibilities - Always show exactly 3 bullet points */}
        <ul className="list-disc pl-14 text-[#1e293b] text-base font-helvetica-light-medium">
          {(() => {
            // Process responsibilities to ensure they're properly split
            let processedResponsibilities: string[] = [];
            
            if (experience.responsibilities.length > 0) {
              // If responsibilities exist as an array
              if (experience.responsibilities.length === 1 && typeof experience.responsibilities[0] === 'string' && experience.responsibilities[0].includes('.')) {
                // If it's a single string with periods, split by periods
                processedResponsibilities = experience.responsibilities[0]
                  .split('.')
                  .map(item => item.trim())
                  .filter(item => item.length > 0);
              } else {
                // Use the existing array
                processedResponsibilities = experience.responsibilities;
              }
            }
            
            // If we have responsibilities to show
            if (processedResponsibilities.length > 0) {
              // Show up to 3 or all if expanded
              const displayCount = experience.isExpanded ? processedResponsibilities.length : Math.min(3, processedResponsibilities.length);
              const displayItems = processedResponsibilities.slice(0, displayCount);
              
              // If we have fewer than 3 items, pad with empty items
              const paddingNeeded = !experience.isExpanded && displayItems.length < 3 ? 3 - displayItems.length : 0;
              
              return (
                <>
                  {displayItems.map((resp, respIndex) => (
                    <li key={respIndex} className="mb-2">{resp}</li>
                  ))}
                  {Array(paddingNeeded).fill(null).map((_, index) => (
                    <li key={`padding-${index}`} className="mb-2 text-gray-400">Additional responsibility</li>
                  ))}
                </>
              );
            } else {
              // No responsibilities, show 3 placeholder bullets
              return Array(3).fill(null).map((_, index) => (
                <li key={index} className="mb-2 text-gray-400">No responsibility specified</li>
              ));
            }
          })()}
        </ul>

        {/* Expand/Collapse Button - Only show when there are more than 3 responsibilities */}
        {(() => {
          // Determine if we need to show the expand/collapse button
          let processedResponsibilities: string[] = [];
          
          if (experience.responsibilities.length > 0) {
            if (experience.responsibilities.length === 1 && typeof experience.responsibilities[0] === 'string' && experience.responsibilities[0].includes('.')) {
              processedResponsibilities = experience.responsibilities[0]
                .split('.')
                .map(item => item.trim())
                .filter(item => item.length > 0);
            } else {
              processedResponsibilities = experience.responsibilities;
            }
          }
          
          return processedResponsibilities.length > 3 ? (
            <button 
              onClick={() => onToggleExpand(index)}
              className="text-[#0e3a68] hover:text-[#0c3156] text-base mt-2 flex items-center ml-8 font-helvetica-neue-bold"
            >
              {experience.isExpanded ? 'Show Less' : 'Show More'}
              <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={experience.isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
            </button>
          ) : null;
        })()}
      </div>
    );
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      router.push('/profile/resume-builder/finalize');
    }
  };

  // Function to check if a work experience entry is complete
  const isExperienceComplete = (experience: WorkExperience): boolean => {
    // Skip validation for cards in edit mode
    if (experience.isEditing) {
      return true;
    }
    
    // Basic validation - check if required fields exist and aren't empty
    const hasJobTitle = !!experience.jobTitle && experience.jobTitle.trim() !== '';
    const hasCompany = !!experience.company && experience.company.trim() !== '';
    const hasLocation = !!experience.location && String(experience.location).trim() !== '';
    const hasStartDate = !!experience.startDate && experience.startDate.trim() !== '';
    
    // Check if there are at least 3 responsibilities
    const hasEnoughResponsibilities = Array.isArray(experience.responsibilities) && 
                                    experience.responsibilities.filter(r => r && r.trim() !== '').length >= 3;
    
    return hasJobTitle && hasCompany && hasLocation && hasStartDate && hasEnoughResponsibilities;
  };

  const handleBackStep = () => {
    // Navigate to the contact info page
    router.push('/profile/contact-info');
  };

  return (
    <div className="container mx-auto px-0 sm:px-4 py-5 sm:py-8 max-w-5xl">
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
        .font-sans {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
      `}</style>
      <ProgressIndicator />

      {/* Missing Information Alert - Only show after user interaction */}
      {hasUserInteracted && workExperience.length > 0 && workExperience.some(exp => !isExperienceComplete(exp)) && (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className="rounded-lg border border-red-500 bg-white p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />
              </div>
              <div className="ml-3 w-full">
                <h3 className="text-sm font-medium text-red-800">Missing information</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    To improve your application, add missing information in the highlighted sections, where you
                    can find it listed. Click the pencil icon next to a given section to edit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-0 sm:px-6 lg:px-8 mt-8 w-full">
        <div className="bg-white rounded-lg border border-black p-5 sm:p-6 mb-8 transform hover:translate-y-[-2px] transition-transform">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Work Experience</h2>

        {/* Show loading indicator if scanning is in progress */}
        {scanStatus.isScanning && <LoadingIndicator />}

        {/* Show error message if there was an error */}
        {!scanStatus.isScanning && !scanStatus.isComplete && scanStatus.errorMessage && (
          <ErrorMessage message={scanStatus.errorMessage} />
        )}

        {/* Show work experience cards */}
        {!scanStatus.isScanning && workExperience.map((experience, index) => (
          <WorkExperienceCard 
            key={experience.id} 
            experience={experience} 
            index={index} 
            onEdit={handleEditExperience}
            onDelete={handleDeleteExperience}
            onSave={handleSaveExperience}
            onToggleExpand={handleToggleExpand}
          />
        ))}

        {/* Show add experience button only after scanning is complete */}
        {!scanStatus.isScanning && (
          <button 
            onClick={() => {
              const newExperience: WorkExperience = {
                id: `temp-${Date.now()}`,
                jobTitle: '',
                company: '',
                location: '',
                startDate: '',
                endDate: '',
                responsibilities: [],
                isEditing: true,
                isExpanded: false
              };
              setWorkExperience(prev => [...prev, newExperience]);
            }}
            className="flex items-center justify-center w-full rounded-lg border-2 border-[#0e3a68] px-6 py-2.5 bg-[#0e3a68] text-white font-medium transition-colors hover:bg-[#0c3156]"
          >
            <FaPlus className="mr-2" /> Add Work Experience
          </button>
        )}
        </div>
      </div>

      {/* Sticky Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-4 w-full max-w-4xl">
          <div className="flex justify-between items-center w-full">
            <button
              onClick={handleBackStep}
              className="flex items-center w-[80px] sm:w-[100px] rounded-lg border-2 border-[#0e3a68] px-4 sm:px-6 py-2 sm:py-2.5 text-[#0e3a68] text-sm sm:text-base transition-colors hover:bg-[#0e3a68]/5"
            >
              <ArrowLeftIcon className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Back
            </button>
            <button
              onClick={handleNextStep}
              className="flex items-center w-[80px] sm:w-[100px] rounded-lg border-2 border-[#0e3a68] px-4 sm:px-6 py-2 sm:py-2.5 bg-[#0e3a68] text-white text-sm sm:text-base font-medium transition-colors hover:bg-[#0c3156]"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}