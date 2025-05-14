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

          return {
            id,
            jobTitle: exp.jobTitle || exp.title || exp.position || '',
            company: exp.company || exp.employer || exp.organization || '',
            startDate,
            endDate,
            location: exp.location || '',
            responsibilities,
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
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6 lg:px-8">
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
        <div className="relative flex justify-between w-[calc(100%+4rem)] -mx-8 px-8 sm:w-auto sm:mx-0 sm:px-4">
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
    // Removed local isEditing state
    const [editedExperience, setEditedExperience] = useState<WorkExperience>(experience);

    // Update local state when edit button is clicked
    useEffect(() => {
      setEditedExperience(experience);
    }, [experience]);

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSave(index, editedExperience);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string, value: string } }) => {
      const { name, value } = 'target' in e ? e.target : e;
      setEditedExperience(prev => ({
        ...prev,
        [name]: name === 'responsibilities' && typeof value === 'string' 
          ? value.split('\n').filter(r => r.trim() !== '') 
          : value
      }));
    };

    // Editing view
    if (experience.isEditing) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">Job Title</label>
              <input
                type="text"
                name="jobTitle"
                value={editedExperience.jobTitle}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-[#173A6A]/30 focus:border-[#173A6A] transition-all duration-200 bg-white"
                style={{ WebkitTextFillColor: 'currentcolor', WebkitBoxShadow: '0 0 0px 1000px white inset' }}
                autoComplete="off"
                required
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-[#173A6A]">Company</label>
              <input
                type="text"
                name="company"
                value={editedExperience.company}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-[#173A6A]/30 focus:border-[#173A6A] transition-all duration-200 bg-white"
                style={{ WebkitTextFillColor: 'currentcolor', WebkitBoxShadow: '0 0 0px 1000px white inset' }}
                autoComplete="off"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-[#173A6A]">Start Date</label>
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-[#173A6A]/30 focus:border-[#173A6A] transition-all duration-200 bg-white py-2 px-3 text-sm"
                  placeholderText="Select start date"
                  popperClassName="z-50"
                  popperPlacement="bottom-start"
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={15}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-[#173A6A]">End Date</label>
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-[#173A6A]/30 focus:border-[#173A6A] transition-all duration-200 bg-white py-2 px-3 text-sm"
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
              <label htmlFor="location" className="block text-sm font-medium text-[#173A6A]">Location</label>
              <input
                type="text"
                name="location"
                value={editedExperience.location || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-[#173A6A]/30 focus:border-[#173A6A] transition-all duration-200 bg-white"
                style={{ WebkitTextFillColor: 'currentcolor', WebkitBoxShadow: '0 0 0px 1000px white inset' }}
                autoComplete="off"
                placeholder="City, State, or Country"
              />
            </div>
            <div>
              <label htmlFor="responsibilities" className="block text-sm font-medium text-[#173A6A]">Responsibilities</label>
              <textarea
                name="responsibilities"
                value={editedExperience.responsibilities?.join('\n') || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-[#173A6A]/30 focus:border-[#173A6A] transition-all duration-200 bg-white"
                style={{ WebkitTextFillColor: 'currentcolor', WebkitBoxShadow: '0 0 0px 1000px white inset' }}
                autoComplete="off"
                rows={4}
                placeholder="Enter responsibilities, one per line"
              />
            </div>
            <div className="flex justify-between items-center">
              <button 
                type="button" 
                onClick={() => onEdit(index)} 
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
      <div className="bg-white rounded-lg shadow-md p-6 mb-4 relative w-[calc(100%+4rem)] sm:w-auto -mx-8 sm:mx-0">
        {/* Edit and Delete Icons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button 
            onClick={() => onEdit(index)}
            className="text-[#173A6A] hover:opacity-80"
            aria-label="Edit Experience"
          >
            <FaEdit />
          </button>
          <button 
            onClick={() => onDelete(index)}
            className="text-red-500 hover:text-red-600"
            aria-label="Delete Experience"
          >
            <FaTrash />
          </button>
        </div>

        {/* Job Details */}
        <h3 className="text-xl font-bold text-gray-800">{experience.jobTitle}</h3>
        {experience.jobDescription && (
          <div className="text-gray-700 text-sm mb-3 italic">
            {experience.jobDescription}
          </div>
        )}
        <div className="flex justify-between items-center mb-2">
          <p className="text-gray-600">{experience.company}</p>
          <p className="text-gray-600 text-sm">
            {experience.startDate} - {experience.endDate || 'Present'}
          </p>
        </div>

        {/* Location */}
        {experience.location ? (
          <div className="flex items-center text-gray-500 text-sm mb-3">
            <FaMapMarkerAlt className="mr-2" />
            {experience.location}
          </div>
        ) : (
          <div className="flex items-center text-yellow-600 text-sm mb-3">
            <FaExclamationTriangle className="mr-2" />
            Location not specified
          </div>
        )}

        {/* Responsibilities */}
        <ul className={`list-disc list-inside text-gray-700 ${experience.isExpanded ? '' : 'line-clamp-3'}`}>
          {experience.responsibilities.map((resp, respIndex) => (
            <li key={respIndex} className="mb-1">{resp}</li>
          ))}
        </ul>

        {/* Expand/Collapse Button */}
        {experience.responsibilities.length > 3 && (
          <button 
            onClick={() => onToggleExpand(index)}
            className="text-blue-500 hover:text-blue-600 text-sm mt-2"
          >
            {experience.isExpanded ? 'Collapse' : 'Expand'}
          </button>
        )}
      </div>
    );
  };

  // Add Experience Button
  const AddExperienceButton = () => {
    return (
      <button 
        onClick={() => {
          const newExperience: WorkExperience = {
            id: `temp-${Date.now()}`,
            jobTitle: '',
            company: '',
            startDate: '',
            endDate: '',
            location: '',
            responsibilities: [],
            isEditing: true
          };
          setWorkExperience(prev => [...prev, newExperience]);
        }}
        className="flex items-center justify-center w-full rounded-lg border-2 border-[#0e3a68] px-6 py-2.5 bg-[#0e3a68] text-white font-medium transition-colors hover:bg-[#0c3156]"
      >
        <FaPlus className="mr-2" /> Add Work Experience
      </button>
    );
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      router.push('/profile/resume-builder/finalize');
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      router.push('/profile');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl font-sans">
      <ProgressIndicator />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-8">
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
        {!scanStatus.isScanning && <AddExperienceButton />}
      </div>

      {/* Sticky Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <div className="flex justify-between items-center w-full">
            <button
              onClick={() => router.back()}
              className="flex items-center w-[100px] rounded-lg border-2 border-[#0e3a68] px-6 py-2.5 text-[#0e3a68] transition-colors hover:bg-[#0e3a68]/5"
            >
              <ArrowLeftIcon className="mr-2 h-5 w-5" />
              Back
            </button>
            <button
              onClick={() => router.push('/profile/contact-info')}
              className="flex items-center w-[100px] rounded-lg border-2 border-[#0e3a68] px-6 py-2.5 bg-[#0e3a68] text-white font-medium transition-colors hover:bg-[#0c3156]"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}