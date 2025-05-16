'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// TypeScript interface for Education
interface Education {
  id?: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  location?: string;
  city?: string;
  state?: string;
  gpa?: string;
  activities?: string;
  description: string;
  isEditing?: boolean;
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
              <div className="h-full w-1/2 rounded-full bg-[#0e3a68]"></div>
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

// Format date to M/YYYY or MM/YYYY format (without leading zero for single-digit months)
const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  
  try {
    // Handle raw text format like "Aug 2010 - May 2014"
    if (dateString.includes('-') && dateString.trim().split(' ').length >= 3) {
      const [startPart] = dateString.split(' - ');
      const [month, year] = startPart.trim().split(' ');
      if (month && year) {
        const monthIndex = new Date(Date.parse(month + ' 1, 2000')).getMonth() + 1;
        return `${monthIndex}/${year}`;
      }
    }
    
    // Handle ISO date format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid date
    
    const month = date.getMonth() + 1; // getMonth() is zero-based
    const year = date.getFullYear();
    return `${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return original if there's an error
  }
};

export default function EducationPage() {
  const router = useRouter();
  const [education, setEducation] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Load education data from localStorage and API
  useEffect(() => {
    const fetchEducationData = async () => {
      try {
        // Check localStorage first
        const savedEducation = localStorage.getItem('educationData');
        const parsedResumeData = localStorage.getItem('parsedResumeData');
        const rawResumeData = localStorage.getItem('rawResumeData');
        const resumeIdentifier = localStorage.getItem('resumeIdentifier');

        // Try to parse education from raw resume data first
        if (rawResumeData) {
          try {
            const rawData = JSON.parse(rawResumeData);
            if (rawData.education && Array.isArray(rawData.education) && rawData.education.length > 0) {
              const formattedEducation = parseEducationFromResume(rawData);
              setEducation(formattedEducation);
              localStorage.setItem('educationData', JSON.stringify(formattedEducation));
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
            const formattedEducation = parseEducationFromResume(parsedData);
            if (formattedEducation.length > 0) {
              setEducation(formattedEducation);
              localStorage.setItem('educationData', JSON.stringify(formattedEducation));
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
              if (data.data?.education) {
                const formattedEducation = parseEducationFromResume(data.data);
                setEducation(formattedEducation);
                localStorage.setItem('educationData', JSON.stringify(formattedEducation));
                setIsLoading(false);
                return;
              }
            }
          } catch (error) {
            console.error('Error fetching education data from API:', error);
          }
        }

        // If we have saved education data, use it
        if (savedEducation) {
          setEducation(JSON.parse(savedEducation));
        }
      } catch (error) {
        console.error('Error loading education data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEducationData();
  }, []);

  // Parse education data from resume
  const parseEducationFromResume = (resumeData: any): Education[] => {
    if (!resumeData) return [];
    
    // Try different possible paths where education data might be stored
    const possiblePaths = [
      'education', 
      'educations', 
      'education_history', 
      'academic_history',
      'data.education',
      'data.educations',
      'data.data.education',
      'data.data.educations'
    ];
    
    let educationItems: any[] = [];
    
    // Find education data in the resume
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
        educationItems = current;
        break;
      }
    }
    
    // Try to find education data in the root if not found in specific paths
    if (educationItems.length === 0) {
      for (const key in resumeData) {
        if (Array.isArray(resumeData[key]) && 
            (key.toLowerCase().includes('education') || key.toLowerCase().includes('academic'))) {
          educationItems = resumeData[key];
          break;
        }
      }
    }
    
    // Process education items
    return educationItems.map((edu: any) => {
      // Handle different date formats
      let startDate = '';
      let endDate = 'Present';
      
      // Handle date objects, strings, or raw text formats
      if (edu.dates?.rawText) {
        // If we have raw text like "Aug 2010 - May 2014"
        const [startPart, endPart] = edu.dates.rawText.split(' - ');
        startDate = startPart || '';
        endDate = endPart || 'Present';
      } else if (edu.dates?.startDate) {
        // Handle dates object with start/end dates
        startDate = typeof edu.dates.startDate === 'string' ? edu.dates.startDate : 
                  edu.dates.startDate.date || edu.dates.startDate.raw || '';
        
        if (edu.dates.completionDate) {
          endDate = typeof edu.dates.completionDate === 'string' ? edu.dates.completionDate : 
                  edu.dates.completionDate.date || edu.dates.completionDate.raw || '';
        } else if (edu.dates.endDate) {
          endDate = typeof edu.dates.endDate === 'string' ? edu.dates.endDate : 
                  edu.dates.endDate.date || edu.dates.endDate.raw || 'Present';
        } else if (edu.dates.isCurrent === false) {
          endDate = 'Present';
        }
      } else if (edu.startDate) {
        // Handle direct startDate/endDate fields
        startDate = typeof edu.startDate === 'string' ? edu.startDate : 
                  edu.startDate.date || edu.startDate.raw || '';
        
        if (edu.endDate) {
          endDate = typeof edu.endDate === 'string' ? edu.endDate : 
                  edu.endDate.date || edu.endDate.raw || 'Present';
        } else if (edu.isCurrent === false) {
          endDate = 'Present';
        }
      } else if (edu.date) {
        // Handle single date field
        startDate = typeof edu.date === 'string' ? edu.date : 
                  edu.date.date || edu.date.raw || '';
      }
      
      // Extract degree and field of study from accreditation if available
      let degree = edu.degree || edu.studyType || edu.qualification || '';
      let fieldOfStudy = edu.fieldOfStudy || edu.area || edu.major || edu.field_of_study || '';
      
      // Handle cases where degree and field are combined in accreditation
      if (edu.accreditation) {
        // If accreditation is an object with education property
        if (typeof edu.accreditation === 'object' && edu.accreditation.education) {
          const educationStr = edu.accreditation.education;
          // Try to split into degree and field of study
          const degreeParts = educationStr.split(' in ');
          if (degreeParts.length > 1) {
            degree = degreeParts[0].trim();
            fieldOfStudy = degreeParts.slice(1).join(' in ').trim();
          } else if (!degree) {
            // If we couldn't split but don't have a degree yet, use the whole string
            degree = educationStr;
          }
        } 
        // If accreditation is a string
        else if (typeof edu.accreditation === 'string') {
          const educationStr = edu.accreditation;
          const degreeParts = educationStr.split(' in ');
          if (degreeParts.length > 1) {
            degree = degreeParts[0].trim();
            fieldOfStudy = degreeParts.slice(1).join(' in ').trim();
          } else if (!degree) {
            degree = educationStr;
          }
        }
      }
      
      // Extract school information
      const school = edu.school || edu.institution || edu.name || 
                   (typeof edu.organization === 'string' ? edu.organization : '') || 
                   'School/University';
      
      // Extract location information
      let location = '';
      let stateCode = '';
      let city = '';
      
      if (typeof edu.location === 'string') {
        location = edu.location;
        // Try to extract state code from string location
        const stateMatch = location.match(/\b([A-Z]{2})\b/);
        stateCode = stateMatch ? stateMatch[1] : '';
      } else if (edu.location && typeof edu.location === 'object') {
        // Handle nested location object
        const loc = edu.location;
        location = loc.formatted || loc.rawInput || '';
        stateCode = loc.stateCode || loc.state || '';
        city = loc.city || '';
      }
      
      // Extract grade/GPA information
      let gpa = '';
      if (typeof edu.grade === 'string') {
        gpa = edu.grade;
      } else if (edu.grade && typeof edu.grade === 'object') {
        gpa = edu.grade.raw || edu.grade.value || '';
      }
      
      // Extract degree and field of study from accreditation if available
      if (edu.accreditation) {
        if (typeof edu.accreditation === 'object') {
          if (edu.accreditation.education) {
            degree = edu.accreditation.education;
          }
          if (edu.accreditation.inputStr) {
            const parts = edu.accreditation.inputStr.split(',');
            if (parts.length > 1) {
              fieldOfStudy = parts.slice(1).join(',').trim();
            }
          }
        }
      }
      
      // Build description from all available information
      const activities = edu.activities || edu.activities_and_societies || '';
      const descriptionParts = [
        edu.description,
        edu.summary,
        edu.notes,
        activities ? `Activities: ${activities}` : '',
        gpa ? `Grade: ${gpa}` : '',
        city ? `Location: ${city}, ${stateCode || ''}`.trim() : ''
      ].filter(Boolean);
      
      const description = descriptionParts.join('\n\n');
      
      return {
        id: edu.id || `edu-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        school: school.trim(),
        degree: (degree || '').trim(),
        fieldOfStudy: (fieldOfStudy || '').trim(),
        location: location.trim(),
        state: stateCode.trim(),
        city: city.trim(),
        startDate: (startDate || '').trim(),
        endDate: (endDate || 'Present').trim(),
        gpa: gpa.toString().trim(),
        activities: activities.toString().trim(),
        description: description.trim(),
        isEditing: false
      };
    });
  };

  // Add new education
  const addEducation = () => {
    const newEducation: Education = {
      id: `edu-${Date.now()}`,
      school: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      description: '',
      isEditing: true
    };
    setEducation([...education, newEducation]);
    setHasUserInteracted(true);
  };

  // Edit education
  const editEducation = (id: string) => {
    setEducation(education.map(edu => 
      edu.id === id ? { ...edu, isEditing: true } : edu
    ));
    setHasUserInteracted(true);
  };

  // Save education
  const saveEducation = (id: string, updatedEducation: Education) => {
    const updated = education.map(edu => 
      edu.id === id ? { ...updatedEducation, isEditing: false } : edu
    );
    setEducation(updated);
    localStorage.setItem('educationData', JSON.stringify(updated));
    setHasUserInteracted(true);
  };

  // Delete education
  const deleteEducation = (id: string) => {
    const updated = education.filter(edu => edu.id !== id);
    setEducation(updated);
    localStorage.setItem('educationData', JSON.stringify(updated));
    setHasUserInteracted(true);
  };

  // Handle input change
  const handleInputChange = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  // Handle date change
  const handleDateChange = (id: string, field: 'startDate' | 'endDate', date: Date | null) => {
    if (!date) return;
    const dateString = date.toISOString().split('T')[0];
    handleInputChange(id, field, dateString);
  };

  // Navigate to next step
  const handleNextStep = () => {
    // Save education data before proceeding
    localStorage.setItem('educationData', JSON.stringify(education));
    router.push('/profile/skills'); // Or the next step in your flow
  };

  // Navigate back to resume builder
  const handleBack = () => {
    router.push('/profile/resume-builder');
  };

  // Check if education is complete
  const isEducationComplete = (edu: Education): boolean => {
    return (
      !!edu.school &&
      !!edu.degree &&
      !!edu.fieldOfStudy &&
      !!edu.startDate
    );
  };

  // Education Card Component
  const EducationCard = ({ 
    edu, 
    index,
    onEdit,
    onDelete
  }: { 
    edu: Education; 
    index: number;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
  }) => {
    if (edu.isEditing) {
      return (
        <div className="bg-white rounded-lg border border-black/70 p-5 mb-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            {String(edu?.id || '').startsWith('edu-') ? 'Add Education' : 'Edit Education'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School/University *</label>
              <input
                type="text"
                value={edu.school}
                onChange={(e) => handleInputChange(edu.id!, 'school', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g. Stanford University"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => handleInputChange(edu.id!, 'degree', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g. Bachelor's"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study *</label>
              <input
                type="text"
                value={edu.fieldOfStudy}
                onChange={(e) => handleInputChange(edu.id!, 'fieldOfStudy', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="e.g. Computer Science"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <DatePicker
                  selected={edu.startDate ? new Date(edu.startDate) : null}
                  onChange={(date) => handleDateChange(edu.id!, 'startDate', date)}
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholderText="MM/YYYY"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <DatePicker
                  selected={edu.endDate && edu.endDate !== 'Present' ? new Date(edu.endDate) : null}
                  onChange={(date) => 
                    handleInputChange(edu.id!, 'endDate', date ? date.toISOString().split('T')[0] : 'Present')
                  }
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholderText="Present"
                  isClearable
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                value={edu.description}
                onChange={(e) => handleInputChange(edu.id!, 'description', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md h-24"
                placeholder="e.g. Activities, societies, or achievements"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={() => {
                if (edu.id?.startsWith('edu-')) {
                  onDelete(edu.id);
                } else {
                  saveEducation(edu.id!, { ...edu, isEditing: false });
                }
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => saveEducation(edu.id!, { ...edu, isEditing: false })}
              disabled={!isEducationComplete(edu)}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                isEducationComplete(edu) 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-300 cursor-not-allowed'
              }`}
            >
              Save
            </button>
          </div>
        </div>
      );
    }

    // View mode
    return (
      <div className={`bg-white rounded-lg border border-black/70 p-5 sm:p-6 mb-6 relative w-full transform hover:translate-y-[-2px] transition-transform font-helvetica-neue-bold`}>
        {/* Card Number */}
        <div className="absolute top-0 left-0 w-10 h-10 flex items-center justify-center border-r border-b border-black/70 rounded-tl-lg rounded-br-lg">
          <span className="text-lg font-helvetica-neue-bold text-[#64748b]">{index + 1}</span>
        </div>
        
        {/* Edit and Delete Icons */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <button 
            onClick={() => onEdit(edu.id!)}
            className="text-blue-600 hover:text-blue-800"
            aria-label="Edit Education"
          >
            <FaEdit className="text-lg" />
          </button>
          <button 
            onClick={() => onDelete(edu.id!)}
            className="text-red-500 hover:text-red-700"
            aria-label="Delete Education"
          >
            <FaTrash className="text-lg" />
          </button>
        </div>
        
        <div className="pl-8 mt-2">
          {/* First line: Degree | Field of Study */}
          <div className="mb-1">
            <h3 className="text-lg font-helvetica-neue-bold text-gray-900">
              {edu.degree || 'Degree'}
              {edu.fieldOfStudy && (
                <span className="font-helvetica-medium"> | {edu.fieldOfStudy}</span>
              )}
            </h3>
          </div>
          
          {/* Second line: University | State | Dates */}
          <div className="flex flex-wrap items-center text-gray-700 text-sm space-x-2 font-helvetica-neue-bold">
            <span className="whitespace-nowrap">{edu.school || 'School/University'}</span>
            
            {(edu.state || edu.location) && (
              <>
                <span className="text-gray-400">|</span>
                <span className="whitespace-nowrap">{edu.state || edu.location}</span>
              </>
            )}
            
            {(edu.startDate || edu.endDate) && (
              <>
                <span className="text-gray-400">|</span>
                <span className="whitespace-nowrap">
                  {formatDate(edu.startDate) || 'Start'}
                  {edu.endDate ? ` - ${formatDate(edu.endDate)}` : ' - Present'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your education information...</p>
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
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Education</h2>
            
            {/* Show education cards */}
            <div className="space-y-6">
              {education.length > 0 ? (
                education.map((edu, index) => (
                  <EducationCard
                    key={edu.id || index}
                    edu={edu}
                    index={index}
                    onEdit={editEducation}
                    onDelete={deleteEducation}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No education added yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add your education history to continue.
                  </p>
                </div>
              )}
            </div>
            
            {/* Add Education Button */}
            <button
              type="button"
              onClick={addEducation}
              className="mt-6 w-full flex items-center justify-center px-6 py-3 border-2 border-[#0e3a68] rounded-lg text-[#0e3a68] hover:bg-[#0e3a68]/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium"
            >
              <FaPlus className="h-5 w-5 mr-2" />
              <span className="font-medium">Add Education</span>
            </button>
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
                className="flex items-center w-[80px] sm:w-[100px] rounded-lg border-2 border-[#0e3a68] px-4 sm:px-6 py-2 sm:py-2.5 bg-[#0e3a68] text-white text-sm sm:text-base font-medium transition-colors hover:bg-[#0c3156]"
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
