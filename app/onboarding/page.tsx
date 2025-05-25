'use client';

import Link from 'next/link';
import Image from 'next/image';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { FaBars, FaTimes, FaChevronRight, FaFileAlt, FaBriefcase, FaDollarSign, FaMapMarkerAlt, FaCheckCircle, FaArrowLeft, FaUpload, FaCheck, FaSearch, FaCreditCard, FaAddressBook, FaPlus, FaExclamationTriangle, FaEdit, FaTrash, FaGraduationCap, FaClipboardList, FaChevronDown } from 'react-icons/fa';

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

// TypeScript interface for Education
interface Education {
  id?: string;
  school?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  isEditing?: boolean;
  isExpanded?: boolean;
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

export default function Onboarding() {
  // State variables for UI components
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  // State for uploaded resume info
  const [uploadedResumeUrl, setUploadedResumeUrl] = useState<string | null>(null);
  const [uploadedResumeName, setUploadedResumeName] = useState<string | null>(null);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showWorkExperience, setShowWorkExperience] = useState(false);
  const [showEducation, setShowEducation] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showJobTitles, setShowJobTitles] = useState(false);
  const [showSalary, setShowSalary] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  // Work experience state
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [isLoadingWorkExperience, setIsLoadingWorkExperience] = useState(false);
  const [workExperienceError, setWorkExperienceError] = useState<string | null>(null);
  // Education state
  const [education, setEducation] = useState<Education[]>([]);
  const [isLoadingEducation, setIsLoadingEducation] = useState(false);
  const [educationError, setEducationError] = useState<string | null>(null);
  
  // Skills state
  const [skills, setSkills] = useState<string[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [skillsError, setSkillsError] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');
  
  // Contact info state
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    linkedin: '',
    phone: '',
    email: '',
    smsConsent: true
  });

  // Fetch uploaded resume info when Resume Upload section is shown
  useEffect(() => {
    if (showResumeUpload) {
      const fetchResumeInfo = async () => {
        try {
          const res = await fetch('/api/profile');
          if (res.ok) {
            const data = await res.json();
            if (data && data.resumeUrl) {
              setUploadedResumeUrl(data.resumeUrl);
              // Try to extract the file name from the URL
              try {
                const urlParts = data.resumeUrl.split('/');
                setUploadedResumeName(urlParts[urlParts.length - 1].split('?')[0]);
              } catch {
                setUploadedResumeName('Uploaded Resume');
              }
              console.log('DEBUG: uploadedResumeUrl:', data.resumeUrl);
              console.log('DEBUG: uploadedResumeName:', uploadedResumeName);
            } else {
              setUploadedResumeUrl(null);
              setUploadedResumeName(null);
            }
          }
        } catch {
          setUploadedResumeUrl(null);
          setUploadedResumeName(null);
        }
      };
      fetchResumeInfo();
    }
  }, [showResumeUpload]);

  // Fetch and parse work experience when the Work Experience section is shown
  // Fetch and parse education data when the Education section is shown
  // Fetch and parse skills data when the Skills section is shown
  useEffect(() => {
    if (showSkills) {
      const fetchSkills = async () => {
        try {
          setIsLoadingSkills(true);
          setSkillsError(null);
          
          // First check if we have skills in localStorage
          const savedSkills = localStorage.getItem('resumeSkills');
          if (savedSkills) {
            try {
              const parsedSkills = JSON.parse(savedSkills);
              if (Array.isArray(parsedSkills) && parsedSkills.length > 0) {
                setSkills(parsedSkills);
                setIsLoadingSkills(false);
                return; // Use saved data if available
              }
            } catch (error) {
              console.error('Failed to parse saved skills:', error);
            }
          }
          
          // If no saved data, try to get parsed resume data
          const res = await fetch('/api/profile');
          if (res.ok) {
            const data = await res.json();
            // If parsedResumeUrl exists, fetch and extract skills from parsed resume
            if (data && data.parsedResumeUrl) {
              try {
                const resp = await fetch(data.parsedResumeUrl);
                const parsed = await resp.json();
                console.log('ONBOARDING: FULL PARSED RESUME (for skills):', parsed);
                
                // Try to find skills data in various possible paths
                let extractedSkills: string[] = [];
                
                // First check for the specific format from the example
                if (parsed['Skills'] && Array.isArray(parsed['Skills'])) {
                  console.log('Found Skills in the parsed resume');
                  extractedSkills = parsed['Skills'];
                } else if (parsed['Technical Skills']) {
                  // Handle nested technical skills
                  const technicalSkills = parsed['Technical Skills'];
                  Object.keys(technicalSkills).forEach(category => {
                    if (Array.isArray(technicalSkills[category])) {
                      extractedSkills = [...extractedSkills, ...technicalSkills[category]];
                    }
                  });
                } else {
                  // Fallback to other possible paths if the specific format is not found
                  const possiblePaths = [
                    'skills', 'skill_set', 'technical_skills', 'core_competencies', 
                    'competencies', 'expertise', 'proficiencies'
                  ];
                  
                  // Look for skills in different paths
                  for (const path of possiblePaths) {
                    const skillItems = parsed[path] || parsed.data?.[path];
                    if (skillItems) {
                      if (Array.isArray(skillItems)) {
                        extractedSkills = skillItems;
                        console.log(`Found skills in path: ${path}`);
                        break;
                      } else if (typeof skillItems === 'object') {
                        // Handle case where skills are categorized
                        Object.keys(skillItems).forEach(category => {
                          if (Array.isArray(skillItems[category])) {
                            extractedSkills = [...extractedSkills, ...skillItems[category]];
                          }
                        });
                        console.log(`Found categorized skills in path: ${path}`);
                        break;
                      }
                    }
                  }
                }
                
                // If we found skills, save them
                if (extractedSkills.length > 0) {
                  // Remove duplicates and sort alphabetically
                  const uniqueSkills = Array.from(new Set(extractedSkills)).sort();
                  
                  // Set the formatted skills to state
                  // Important: completely replace old data, don't merge
                  setSkills(uniqueSkills);
                  setIsLoadingSkills(false);
                  
                  // Save to localStorage for persistence
                  try {
                    // Clear any existing data first
                    localStorage.removeItem('resumeSkills');
                    // Then save the new data
                    localStorage.setItem('resumeSkills', JSON.stringify(uniqueSkills));
                    
                    // Also save to backend with replace flag to ensure old data is cleared
                    fetch('/api/profile', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        section: 'skills',
                        data: uniqueSkills,
                        replace: true // Important: tell backend to replace, not merge
                      })
                    }).catch(err => console.error('Error saving skills to backend:', err));
                  } catch (error) {
                    console.error('Error saving skills to localStorage:', error);
                  }
                }
              } catch (e) {
                console.error('Error fetching parsed resume for skills:', e);
                setSkillsError('Failed to parse resume data. Please try again.');
              }
            }
          }
        } catch (error) {
          console.error('Error fetching skills:', error);
          setSkillsError('Failed to load skills. Please try again.');
        } finally {
          setIsLoadingSkills(false);
        }
      };
      
      fetchSkills();
    }
  }, [showSkills]);

  useEffect(() => {
    if (showEducation) {
      const fetchEducation = async () => {
        try {
          setIsLoadingEducation(true);
          setEducationError(null);
          
          // First check if we have education in localStorage
          const savedEducation = localStorage.getItem('resumeEducation');
          if (savedEducation) {
            try {
              const parsedEducation = JSON.parse(savedEducation);
              if (Array.isArray(parsedEducation) && parsedEducation.length > 0) {
                setEducation(parsedEducation);
                setIsLoadingEducation(false);
                return; // Use saved data if available
              }
            } catch (error) {
              console.error('Failed to parse saved education:', error);
            }
          }
          
          // If no saved data, try to get parsed resume data
          const res = await fetch('/api/profile');
          if (res.ok) {
            const data = await res.json();
            // If parsedResumeUrl exists, fetch and extract education from parsed resume
            if (data && data.parsedResumeUrl) {
              try {
                const resp = await fetch(data.parsedResumeUrl);
                const parsed = await resp.json();
                console.log('ONBOARDING: FULL PARSED RESUME (for education):', parsed);
                
                // Try to find education data in various possible paths
                let educations: any[] = [];
                
                // First check for the specific format from the example
                if (parsed['Education'] && Array.isArray(parsed['Education'])) {
                  console.log('Found Education in the parsed resume');
                  educations = parsed['Education'];
                } else {
                  // Fallback to other possible paths if the specific format is not found
                  const possiblePaths = [
                    'education', 'educations', 'education_history', 
                    'academic_history', 'schools', 'degrees'
                  ];
                  
                  // Look for education in different paths
                  for (const path of possiblePaths) {
                    const educationItems = parsed[path] || parsed.data?.[path];
                    if (educationItems && Array.isArray(educationItems)) {
                      educations = educationItems;
                      console.log(`Found education in path: ${path}`);
                      break;
                    }
                  }
                }
                
                // If we found education items, format them
                if (educations.length > 0) {
                  const formattedEducation = educations.map((edu: any, index: number) => {
                    // Handle the specific format from the example
                    if (edu['Institution'] && edu['Degree']) {
                      console.log('Processing education in the new format:', edu);
                      
                      // Extract dates from Year field
                      let startDate = '';
                      let endDate = '';
                      if (edu['Year']) {
                        const dateRange = edu['Year'].split(' - ');
                        startDate = dateRange[0] || '';
                        endDate = dateRange.length > 1 ? dateRange[1] : 'Present';
                      }
                      
                      return {
                        id: `edu-${index}`,
                        school: edu['Institution'] || '',
                        degree: edu['Degree'] || '',
                        fieldOfStudy: '',  // Not explicitly provided in this format
                        startDate,
                        endDate,
                        description: '',  // Not explicitly provided in this format
                        isExpanded: index === 0, // Expand the first one by default
                        isEditing: false
                      };
                    } else {
                      // Fallback to the original format for other resume formats
                      // Extract school name from various possible fields
                      const school = edu.school || edu.institution || edu.university || edu.college || '';
                      
                      // Extract degree from various possible fields
                      const degree = edu.degree || edu.certification || edu.diploma || '';
                      
                      // Extract field of study
                      const fieldOfStudy = edu.fieldOfStudy || edu.major || edu.field || edu.area || '';
                      
                      // Extract dates
                      const startDate = edu.startDate || edu.start_date || (edu.dates?.startDate) || (edu.dates?.start_date) || '';
                      const endDate = edu.endDate || edu.end_date || (edu.dates?.endDate) || (edu.dates?.end_date) || '';
                      
                      // Extract description
                      const description = edu.description || edu.notes || edu.achievements || '';
                      
                      return {
                        id: `edu-${index}`,
                        school,
                        degree,
                        fieldOfStudy,
                        startDate,
                        endDate,
                        description,
                        isExpanded: index === 0, // Expand the first one by default
                        isEditing: false
                      };
                    }
                  });
                  
                  // Set the formatted education to state
                  // Important: completely replace old data, don't merge
                  setEducation(formattedEducation);
                  setIsLoadingEducation(false);
                  
                  // Save to localStorage for persistence
                  try {
                    // Clear any existing data first
                    localStorage.removeItem('resumeEducation');
                    // Then save the new data
                    localStorage.setItem('resumeEducation', JSON.stringify(formattedEducation));
                    
                    // Also save to backend with replace flag to ensure old data is cleared
                    fetch('/api/profile', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        section: 'education',
                        data: formattedEducation,
                        replace: true // Important: tell backend to replace, not merge
                      })
                    }).catch(err => console.error('Error saving education to backend:', err));
                  } catch (error) {
                    console.error('Error saving education to localStorage:', error);
                  }
                }
              } catch (e) {
                console.error('Error fetching parsed resume for education:', e);
                setEducationError('Failed to parse resume data. Please try again.');
              }
            }
          }
        } catch (error) {
          console.error('Error fetching education:', error);
          setEducationError('Failed to load education. Please try again.');
        } finally {
          setIsLoadingEducation(false);
        }
      };
      
      fetchEducation();
    }
  }, [showEducation]);

  useEffect(() => {
    if (showWorkExperience) {
      const fetchWorkExperience = async () => {
        try {
          setIsLoadingWorkExperience(true);
          setWorkExperienceError(null);
          
          // First check if we have work experience in localStorage
          const savedWorkExperience = localStorage.getItem('resumeWorkExperience');
          if (savedWorkExperience) {
            try {
              const parsedExperience = JSON.parse(savedWorkExperience);
              if (Array.isArray(parsedExperience) && parsedExperience.length > 0) {
                setWorkExperience(parsedExperience);
                setIsLoadingWorkExperience(false);
                return; // Use saved data if available
              }
            } catch (error) {
              console.error('Failed to parse saved work experience:', error);
            }
          }
          
          
          // If no saved data, try to get parsed resume data
          const res = await fetch('/api/profile');
          if (res.ok) {
            const data = await res.json();
            // If parsedResumeUrl exists, fetch and extract work experience from parsed resume
            if (data && data.parsedResumeUrl) {
              try {
                const resp = await fetch(data.parsedResumeUrl);
                const parsed = await resp.json();
                console.log('ONBOARDING: FULL PARSED RESUME (for work exp):', parsed);
                
                // Initialize work experiences array
                let workExperiences: any[] = [];
                
                // Try to find work experience data in various possible paths
                // First check for the specific format from the example
                if (parsed['Work Experience'] && Array.isArray(parsed['Work Experience'])) {
                  console.log('Found Work Experience in the parsed resume');
                  workExperiences = parsed['Work Experience'];
                } else {
                  // Fallback to other possible paths if the specific format is not found
                  const possiblePaths = [
                    'work_experience', 'workExperience', 'work_experiences', 
                    'jobs', 'positions', 'experience', 'professional_experience'
                  ];
                  
                  // Look for work experience in different paths
                  for (const path of possiblePaths) {
                    const experiences = parsed[path] || parsed.data?.[path];
                    if (experiences && Array.isArray(experiences)) {
                      workExperiences = experiences;
                      console.log(`Found experiences in path: ${path}`);
                      break;
                    }
                  }
                }
                
                // If we found work experiences, format them
                if (workExperiences.length > 0) {
                  const formattedWorkExperiences = workExperiences.map((exp: any, index: number) => {
                    // Handle the specific format from the example
                    if (exp['Job Title'] && exp['Company']) {
                      console.log('Processing work experience in the new format:', exp);
                      // Extract dates from Start/End Year field
                      let startDate = '';
                      let endDate = '';
                      if (exp['Start/End Year']) {
                        const dateRange = exp['Start/End Year'].split(' - ');
                        startDate = dateRange[0] || '';
                        endDate = dateRange.length > 1 ? dateRange[1] : 'Present';
                      }
                      
                      // Extract responsibilities from Description array
                      let responsibilities: string[] = [];
                      if (Array.isArray(exp['Description'])) {
                        responsibilities = exp['Description'];
                      }
                      
                      // Ensure we have at least 3 responsibilities (pad with empty strings if needed)
                      while (responsibilities.length < 3) {
                        responsibilities.push('');
                      }
                      
                      return {
                        id: `exp-${index}`,
                        jobTitle: exp['Job Title'] || '',
                        company: exp['Company'] || '',
                        location: exp['Location'] || '',
                        startDate,
                        endDate,
                        responsibilities,
                        isExpanded: index === 0, // Expand the first one by default
                        isEditing: false
                      };
                    } else {
                      // Fallback to the original format for other resume formats
                      // Extract job title from various possible fields
                      const jobTitle = exp.jobTitle || exp.title || exp.position || '';
                      
                      // Extract company from various possible fields
                      const company = exp.company || exp.employer || exp.organization || '';
                      
                      // Extract dates
                      const startDate = exp.startDate || exp.start_date || exp.dates?.startDate || exp.dates?.start_date || '';
                      const endDate = exp.endDate || exp.end_date || (exp.dates?.isCurrent ? 'Present' : '') || '';
                      
                      // Extract location
                      const location = exp.location || '';
                      
                      // Helper function to clean and validate string items
                      const cleanStringItem = (item: unknown): string => {
                        if (typeof item === 'string') return item.trim();
                        return String(item || '').trim();
                      };
                      
                      // Function to split text into sentences
                      const splitIntoSentences = (text: string): string[] => {
                        // First try to split by periods followed by space or newlines
                        const byPeriods = text
                          .replace(/\. /g, '.\n')
                          .split(/\n+|\r\n+/)
                          .map(s => s.trim())
                          .filter(s => s.length > 0);
                        
                        if (byPeriods.length > 1) {
                          return byPeriods;
                        }
                        
                        // If that didn't work, try other delimiters
                        if (text.includes('•')) {
                          return text.split('•')
                            .map(s => s.trim())
                            .filter(s => s.length > 0);
                        }
                        
                        if (text.includes('- ')) {
                          return text.split(/\s*-\s+/)
                            .map(s => s.trim())
                            .filter(s => s.length > 0);
                        }
                        
                        if (text.includes(', ')) {
                          return text.split(/,\s+/)
                            .map(s => s.trim())
                            .filter(s => s.length > 0);
                        }
                        
                        // Last resort: just use the whole text
                        return text ? [text] : [];
                      };
                      
                      // Extract responsibilities from various possible formats
                      let responsibilities: string[] = [];
                      
                      // Check for responsibilities in various fields
                      if (exp.responsibilities && Array.isArray(exp.responsibilities)) {
                        responsibilities = exp.responsibilities.map(cleanStringItem).filter(Boolean);
                      } else if (exp.description) {
                        responsibilities = splitIntoSentences(cleanStringItem(exp.description));
                      } else if (exp.jobDescription) {
                        responsibilities = splitIntoSentences(cleanStringItem(exp.jobDescription));
                      } else if (exp.text) {
                        responsibilities = splitIntoSentences(cleanStringItem(exp.text));
                      }
                      
                      // Format each responsibility
                      responsibilities = responsibilities.map(resp => {
                        resp = resp.trim();
                        // Ensure proper sentence casing and periods
                        if (!resp.endsWith('.') && resp.length > 1) {
                          resp += '.';
                        }
                        // Capitalize first letter
                        return resp.charAt(0).toUpperCase() + resp.slice(1);
                      });
                      
                      // Ensure we have at least 3 responsibilities (pad with empty strings if needed)
                      while (responsibilities.length < 3) {
                        responsibilities.push('');
                      }
                      
                      return {
                        id: `exp-${index}`,
                        jobTitle,
                        company,
                        location,
                        startDate,
                        endDate,
                        responsibilities,
                        isExpanded: index === 0, // Expand the first one by default
                        isEditing: false
                      };
                    }
                  });
                  
                  // Set the formatted work experiences to state
                  setWorkExperience(formattedWorkExperiences);
                  setIsLoadingWorkExperience(false);
                  
                  // Save to localStorage for persistence
                  try {
                    // Clear any existing data first
                    localStorage.removeItem('resumeWorkExperience');
                    // Then save the new data
                    localStorage.setItem('resumeWorkExperience', JSON.stringify(formattedWorkExperiences));
                    
                    // Also save to backend with replace flag to ensure old data is cleared
                    fetch('/api/profile', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        section: 'workExperience',
                        data: formattedWorkExperiences,
                        replace: true // Important: tell backend to replace, not merge
                      })
                    }).catch(err => console.error('Error saving work experience to backend:', err));
                  } catch (error) {
                    console.error('Error saving work experience to localStorage:', error);
                  }
                }
              } catch (e) {
                console.error('Error fetching parsed resume for work experience:', e);
                setWorkExperienceError('Failed to parse resume data. Please try again.');
              }
            }
          }
        } catch (error) {
          console.error('Error fetching work experience:', error);
          setWorkExperienceError('Failed to load work experience. Please try again.');
        } finally {
          setIsLoadingWorkExperience(false);
        }
      };
      
      fetchWorkExperience();
    }
  }, [showWorkExperience]);
  
  // Prefill Contact Info on section mount (fetch from backend, fallback to localStorage)
  useEffect(() => {
    if (showContactInfo) {
      const fetchContactInfo = async () => {
        try {
          const res = await fetch('/api/profile');
          if (res.ok) {
            const data = await res.json();
            // If parsedResumeUrl exists, fetch and extract contact info from parsed resume
            if (data && data.parsedResumeUrl) {
              try {
                const resp = await fetch(data.parsedResumeUrl);
                const parsed = await resp.json();
                console.log('ONBOARDING: FULL PARSED RESUME (from saved):', parsed);
                const extractedInfo = extractContactInfoFromResume(parsed);
                console.log('DEBUG: extracted LinkedIn:', extractedInfo.linkedin);
                setContactInfo((prev) => ({ ...prev, ...extractedInfo }));
                // Sync to localStorage
                try {
                  localStorage.setItem('contactFormData', JSON.stringify({ ...contactInfo, ...extractedInfo }));
                } catch {}
                return;
              } catch (e) {
                console.error('Error fetching parsed resume from saved URL:', e);
              }
            }
            // Otherwise, fallback to contactInfo in backend profile
            if (data && data.profile && data.profile.contactInfo) {
              setContactInfo((prev) => ({ ...prev, ...data.profile.contactInfo }));
              // Sync to localStorage
              try {
                localStorage.setItem('contactFormData', JSON.stringify({ ...contactInfo, ...data.profile.contactInfo }));
              } catch {}
              return;
            }
          }
        } catch (e) {
          // Ignore fetch errors, fallback to localStorage
        }
        // Fallback: load from localStorage
        try {
          const savedFormData = localStorage.getItem('contactFormData');
          if (savedFormData) {
            setContactInfo((prev) => ({ ...prev, ...JSON.parse(savedFormData) }));
          }
        } catch {}
      };
      fetchContactInfo();
    }
  }, [showContactInfo]);
  const [isSaving, setIsSaving] = useState(false);
  const [parsedResume, setParsedResume] = useState<any>(null);
  const [salary, setSalary] = useState(50); // Starting at $50k
  const [searchTerm, setSearchTerm] = useState('');
  const [locationSearchTerm, setLocationSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [includeRemote, setIncludeRemote] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  
  // Questionnaire state
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, string>>({});
  const [questionnaireErrors, setQuestionnaireErrors] = useState<Record<string, boolean>>({});
  
  // Questionnaire data
  const questions = [
    {
      id: 'workAuth',
      text: 'Are you authorized to work in the United States?',
      options: ['Yes', 'No'],
      required: true,
    },
    {
      id: 'sponsorship',
      text: 'Will you now or in the future require sponsorship to work in the United States?',
      options: ['Yes', 'No'],
      required: true,
    },
    {
      id: 'felony',
      text: 'Have you ever been convicted of a felony?',
      options: ['Yes', 'No'],
      required: true,
    },
    {
      id: 'startDate',
      text: 'When can you start a new job?',
      options: ['Immediately', '2 weeks', '1 month', 'More than 1 month'],
      required: true,
    },
    {
      id: 'screening',
      text: 'Are you willing to conduct any sort of pre-employment screening that is required?',
      options: ['Yes', 'No', 'Prefer not to say'],
    },
    {
      id: 'relocation',
      text: 'Are you willing to relocate for a job?',
      options: ['Yes', 'No', 'Maybe'],
    },
    {
      id: 'travel',
      text: 'Are you willing to travel for work?',
      options: ['Yes', 'No', 'Maybe'],
    },
    {
      id: 'workType',
      text: 'What type of work are you looking for?',
      options: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      required: true,
    },
    {
      id: 'workLocation',
      text: 'What is your preferred work location?',
      options: ['On-site', 'Hybrid', 'Remote'],
      required: true,
    },
    {
      id: 'experience',
      text: 'How many years of relevant experience do you have?',
      options: ['0-1 years', '1-3 years', '3-5 years', '5+ years'],
      required: true,
    },
    {
      id: 'gender',
      text: 'What gender do you identify as?',
      options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
    },
    {
      id: 'pronouns',
      text: 'What are your desired pronouns?',
      options: ['He/Him', 'She/Her', 'They/Them', 'Prefer not to say'],
    },
    {
      id: 'ethnicity',
      text: 'Which race or ethnicity best describes you?',
      options: [
        'Asian',
        'Black or African American',
        'Hispanic or Latino',
        'Native American',
        'Pacific Islander',
        'White',
        'Two or more races',
        'Prefer not to say',
      ],
    },
    {
      id: 'disability',
      text: 'Do you have a disability?',
      options: ['Yes', 'No', 'Prefer not to say'],
    },
    {
      id: 'veteran',
      text: 'Are you a veteran?',
      options: ['Yes', 'No', 'Prefer not to say'],
    },
  ];
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  
  // Sample locations data
  const sampleLocations = [
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Phoenix, AZ',
    'Philadelphia, PA',
    'San Antonio, TX',
    'San Diego, CA',
    'Dallas, TX',
    'San Jose, CA',
    'London, UK',
    'Berlin, Germany',
    'Toronto, Canada',
    'Sydney, Australia',
    'Paris, France',
    'Austin, TX',
    'Seattle, WA',
    'Denver, CO',
    'Boston, MA',
    'Atlanta, GA'
  ];

  // Comprehensive list of job titles across various industries (no duplicates)
  const mockJobTitles = [
    // Technology & Engineering
    'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'DevOps Engineer', 'Site Reliability Engineer', 'Cloud Architect', 'Systems Administrator',
    'Network Engineer', 'Security Engineer', 'QA Engineer', 'Test Automation Engineer',
    'Mobile Developer', 'iOS Developer', 'Android Developer', 'Game Developer', 'Unity Developer',
    'Embedded Systems Engineer', 'Firmware Engineer', 'Hardware Engineer', 'Robotics Engineer',
    'Blockchain Developer', 'Solidity Developer', 'Web3 Developer', 'AR/VR Developer',
    'Computer Vision Engineer', 'NLP Engineer', 'Data Engineer', 'ETL Developer', 'Database Administrator',
    'Data Architect', 'Business Intelligence Developer', 'Analytics Engineer',
    
    // Data Science & AI
    'Data Scientist', 'Machine Learning Engineer', 'AI Researcher', 'MLOps Engineer',
    'Data Analyst', 'Business Analyst', 'Quantitative Analyst', 'Statistician',
    'Bioinformatician', 'Computational Biologist', 'Research Engineer',
    
    // Design & Creative
    'UX Designer', 'UI Designer', 'Product Designer', 'Interaction Designer',
    'Visual Designer', 'Graphic Designer', 'Motion Designer', '3D Artist',
    'Game Designer', 'Level Designer', 'Creative Director', 'Art Director',
    'Multimedia Artist', 'Animator', 'Illustrator', 'Photographer', 'Videographer',
    'Video Editor', 'Sound Designer', 'Music Producer', 'Content Creator', 'Copywriter',
    'Technical Writer', 'Content Strategist', 'Content Marketer',
    
    // Product & Project Management
    'Product Manager', 'Technical Product Manager', 'Product Owner', 'Product Marketing Manager',
    'Project Manager', 'Technical Program Manager', 'Scrum Master', 'Agile Coach',
    'Program Manager', 'Delivery Manager', 'Engineering Manager',
    
    // Business & Management
    'CEO', 'CTO', 'CIO', 'CFO', 'COO', 'CMO', 'CPO', 'CDO',
    'Vice President', 'Director', 'Senior Manager', 'Manager', 'Team Lead',
    'Business Development Manager', 'Partnerships Manager', 'Account Executive',
    'Sales Director', 'Sales Manager', 'Account Manager', 'Business Analyst',
    'Management Consultant', 'Strategy Consultant', 'Operations Manager',
    
    // Marketing & Communications
    'Digital Marketing Manager', 'SEO Specialist', 'SEM Specialist', 'PPC Specialist',
    'Social Media Manager', 'Community Manager', 'Brand Manager', 'Marketing Director',
    'Growth Marketing Manager', 'Performance Marketing Manager', 'Email Marketing Specialist',
    'Content Marketing Manager', 'Public Relations Manager', 'Media Planner',
    'Influencer Marketing Manager', 'Affiliate Marketing Manager',
    
    // Finance & Accounting
    'Financial Analyst', 'Investment Banker', 'Portfolio Manager', 'Hedge Fund Manager',
    'Private Equity Associate', 'Venture Capitalist', 'Financial Advisor', 'Accountant',
    'CPA', 'Auditor', 'Tax Consultant', 'Financial Controller', 'Treasury Analyst',
    'Risk Manager', 'Compliance Officer', 'Actuary', 'Underwriter',
    
    // Healthcare & Life Sciences
    'Physician', 'Surgeon', 'Dentist', 'Psychiatrist', 'Psychologist', 'Therapist',
    'Registered Nurse', 'Nurse Practitioner', 'Physician Assistant', 'Pharmacist',
    'Clinical Research Associate', 'Epidemiologist', 'Biomedical Engineer', 
    'Biotechnologist', 'Genetic Counselor', 'Healthcare Administrator', 'Medical Director',
    
    // Bioinformatics & Computational Biology
    'Genomic Data Scientist', 'Bioinformatics Scientist', 'Bioinformatics Analyst', 
    'Bioinformatics Engineer', 'Computational Genomics Scientist', 'Systems Biologist', 
    'Cheminformatician', 'Proteomics Data Analyst', 'Metabolomics Specialist', 
    'Phylogeneticist', 'Biostatistician', 'Computational Chemist', 'Structural Biologist',
    'NGS Data Analyst', 'Genome Analyst', 'Transcriptomics Specialist',
    'Single-Cell Genomics Scientist', 'Clinical Bioinformatician',
    'Microbiome Data Scientist', 'Vaccine Bioinformatics Specialist',
    'Cancer Genomics Researcher', 'Population Geneticist',
    'Evolutionary Biologist', 'Protein Engineer',
    
    // Molecular & Cellular Biology
    'Molecular Biologist', 'Cell Biologist', 'Molecular Geneticist',
    'Molecular Diagnostics Specialist', 'CRISPR Specialist', 'Gene Therapy Researcher',
    'Stem Cell Biologist', 'Immunologist', 'Virologist', 'Bacteriologist',
    'Microbiologist', 'Cell Culture Specialist', 'Protein Biochemist',
    'Enzymologist', 'Molecular Pathologist', 'Toxicologist',
    'Pharmacogenomics Scientist', 'Synthetic Biologist',
    'Molecular Imaging Specialist', 'Flow Cytometry Specialist',
    
    // Research Science & Biotech/Pharma
    'Research Scientist', 'Principal Investigator', 'Postdoctoral Researcher',
    'Research Associate', 'Lab Manager', 'Research Technician',
    'Clinical Research Coordinator', 'Research Fellow', 'Scientific Officer',
    'Field Application Scientist', 'Scientific Program Manager',
    'Translational Scientist', 'Preclinical Researcher', 'Formulation Scientist',
    'Assay Development Scientist', 'Biomarker Scientist', 'Toxicology Scientist',
    'Regulatory Affairs Specialist', 'Quality Control Scientist',
    'Process Development Scientist', 'Manufacturing Science and Technology (MSAT) Specialist',
    'Automation Scientist', 'High-Throughput Screening Specialist',
    'Biobank Manager', 'Research Compliance Officer',
    'Scientific Writer', 'Medical Science Liaison',
    'Biotechnology Research Scientist', 'Biopharmaceutical Scientist',
    'Drug Discovery Scientist', 'Therapeutic Antibody Engineer',
    'Vaccine Development Scientist', 'Cell Therapy Specialist',
    'Gene Therapy Scientist', 'Biomanufacturing Specialist',
    'Process Development Engineer', 'Fermentation Scientist',
    'Downstream Processing Specialist', 'Analytical Development Scientist',
    'Formulation Development Scientist', 'CMC Specialist',
    'Regulatory Affairs Manager', 'Clinical Trial Manager',
    'Medical Affairs Specialist', 'Pharmacovigilance Scientist',
    
    // Education & Research
    'Professor', 'Teacher', 'Lecturer', 'Education Consultant', 'Curriculum Developer', 
    'Instructional Designer', 'Librarian', 'Archivist', 'Museum Curator',
    
    // Legal
    'Lawyer', 'Attorney', 'Corporate Counsel', 'Legal Counsel', 'Paralegal',
    'Legal Assistant', 'Intellectual Property Attorney',
    'Immigration Lawyer', 'Family Lawyer', 'Criminal Defense Attorney',
    
    // Skilled Trades & Manufacturing
    'Electrician', 'Plumber', 'Carpenter', 'Welder', 'Machinist', 'Mechanic',
    'HVAC Technician', 'Construction Manager', 'Civil Engineer', 'Architect',
    'Industrial Designer', 'Manufacturing Engineer', 'Quality Assurance Inspector',
    'Production Supervisor',
    
    // Hospitality & Food Service
    'Executive Chef', 'Sous Chef', 'Pastry Chef', 'Restaurant Manager', 'Hotel Manager',
    'Event Planner', 'Catering Manager', 'Food and Beverage Director', 'Sommelier',
    'Bar Manager', 'Mixologist',
    
    // Retail & Customer Service
    'Retail Manager', 'Store Manager', 'Visual Merchandiser', 'Buyer', 'Merchandiser',
    'Customer Success Manager', 'Customer Support Specialist', 'Call Center Manager',
    
    // Transportation & Logistics
    'Logistics Manager', 'Supply Chain Manager', 'Procurement Manager', 'Warehouse Manager',
    'Fleet Manager', 'Transportation Manager', 'Operations Analyst',
    
    // Media & Entertainment
    'Journalist', 'Editor', 'Publisher', 'Producer', 'Director', 'Screenwriter',
    'Actor', 'Musician', 'Composer', 'Set Designer', 'Costume Designer',
    'Casting Director', 'Talent Agent',
    
    // Non-Profit & Social Services
    'Social Worker', 'Case Manager', 'Nonprofit Director', 'Grant Writer',
    'Fundraising Manager', 'Program Coordinator', 'Community Outreach Coordinator',
    
    // Government & Policy
    'Policy Analyst', 'Legislative Assistant', 'Public Administrator', 'Urban Planner',
    'Diplomat', 'Foreign Service Officer', 'Intelligence Analyst',
    
    // Science & Research
    'Laboratory Technician', 'Chemist', 'Biologist', 'Physicist',
    'Astronomer', 'Geologist', 'Meteorologist', 'Oceanographer', 'Environmental Scientist',
    'Wildlife Biologist', 'Zoologist', 'Botanist',
    
    // Real Estate
    'Real Estate Agent', 'Real Estate Broker', 'Property Manager', 'Real Estate Developer',
    'Appraiser', 'Real Estate Analyst',
    
    // Human Resources
    'HR Manager', 'Recruiter', 'Talent Acquisition Specialist', 'HR Business Partner',
    'Compensation Analyst', 'Learning and Development Manager', 'Diversity and Inclusion Manager',
    
    // Agriculture & Environment
    'Agricultural Scientist', 'Conservation Scientist', 'Forester', 'Horticulturist',
    'Environmental Engineer', 'Sustainability Consultant',
    
    // Aviation & Aerospace
    'Aerospace Engineer', 'Aircraft Mechanic', 'Airline Pilot', 'Flight Attendant',
    'Air Traffic Controller', 'Aerospace Technician',
    
    // Sports & Fitness
    'Personal Trainer', 'Athletic Trainer', 'Sports Coach', 'Fitness Instructor',
    'Sports Medicine Physician', 'Sports Agent', 'Athletic Director'
  ];
  
  // Update job title suggestions based on search term
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = mockJobTitles.filter(title =>
        title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);
  
  // Update location suggestions based on search term
  useEffect(() => {
    if (locationSearchTerm.trim()) {
      const filtered = sampleLocations.filter(location =>
        location.toLowerCase().includes(locationSearchTerm.toLowerCase()) &&
        !selectedLocations.includes(location)
      );
      setLocationSuggestions(filtered);
    } else {
      setLocationSuggestions([]);
    }
  }, [locationSearchTerm, selectedLocations]);
  

  
  // Handle job title search
  useEffect(() => {
    // Simulate job title suggestions based on search term
    if (searchTerm.trim() !== '') {
      const filtered = mockJobTitles.filter(title => 
        title.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);
  
  const handleSelectTitle = (title: string) => {
    if (selectedTitles.length < 5 && !selectedTitles.includes(title)) {
      setSelectedTitles([...selectedTitles, title]);
      setSearchTerm('');
      setSuggestions([]);
    }
  };
  
  const handleRemoveTitle = (title: string) => {
    setSelectedTitles(selectedTitles.filter(t => t !== title));
  };
  
  const handleSelectLocation = (location: string) => {
    if (selectedLocations.length < 5 && !selectedLocations.includes(location)) {
      setSelectedLocations([...selectedLocations, location]);
      setLocationSearchTerm('');
      setLocationSuggestions([]);
    }
  };
  
  const handleRemoveLocation = (location: string) => {
    setSelectedLocations(selectedLocations.filter(loc => loc !== location));
  };
  
  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isSidebarOpen && !target.closest('.sidebar') && !target.closest('.sidebar-toggle')) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);
  
  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (showJobTitles) {
        setShowJobTitles(false);
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    // Add to history when job titles are shown
    if (showJobTitles) {
      window.history.pushState({ jobTitles: true }, '');
    }
    
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [showJobTitles, setShowJobTitles]);
  
  // Load questionnaire answers from localStorage when section is shown
  useEffect(() => {
    if (showQuestionnaire) {
      // Load saved questionnaire answers from localStorage
      const savedAnswers = localStorage.getItem('questionnaireAnswers');
      if (savedAnswers) {
        try {
          const parsedAnswers = JSON.parse(savedAnswers);
          setQuestionnaireAnswers(parsedAnswers);
        } catch (error) {
          console.error('Failed to parse saved questionnaire answers:', error);
        }
      }
    }
  }, [showQuestionnaire]);
  
  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      // Logic for handling browser back button
      console.log('Back button pressed');
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [showJobTitles]);
  
  // Handle back button click
  const handleBackClick = () => {
    if (showQuestionnaire) {
      setShowJobTitles(true);
      setShowQuestionnaire(false);
    } else if (showJobTitles) {
      setShowResumeUpload(true);
      setShowJobTitles(false);
    } else if (showResumeUpload) {
      setShowResumeUpload(false);
    }
  };
  
  const handleFile = async (file: File) => {
    setSelectedFile(file);
    setUploadStatus('uploading');
    setUploadError(null);
    console.log('Starting upload process for file:', file.name);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Sending file to /api/resume/upload...');
      
      // Upload to API
      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
        // Prevent browser from caching the request
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
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
      
      // If parsedResumeUrl is returned, fetch the parsed resume JSON
      if (data.parsedResumeUrl) {
        try {
          const resp = await fetch(data.parsedResumeUrl);
          const parsed = await resp.json();
          console.log('FULL PARSED RESUME:', parsed);
          setParsedResume(parsed);
          
          // Reset all state variables to ensure we're starting fresh with the new resume
          // This prevents concatenation of old and new data
          setWorkExperience([]);
          setEducation([]);
          setSkills([]);
          
          // Prefill contact info with parsed resume data
          const extractedInfo = extractContactInfoFromResume(parsed);
          console.log('Extracted contact info from resume:', extractedInfo);
          
          // Completely replace the contact info with the new data from the resume
          // instead of merging with previous data
          // Ensure all required fields are present by providing defaults
          setContactInfo({
            firstName: extractedInfo.firstName || '',
            lastName: extractedInfo.lastName || '',
            dob: extractedInfo.dob || '',
            address: extractedInfo.address || '',
            city: extractedInfo.city || '',
            state: extractedInfo.state || '',
            postalCode: extractedInfo.postalCode || '',
            linkedin: extractedInfo.linkedin || '',
            phone: extractedInfo.phone || '',
            email: extractedInfo.email || '',
            smsConsent: false // Default value for smsConsent
          });
          
          // Save the extracted info to backend with a flag to replace existing data
          // This will trigger the backend to clear all related sections
          await saveContactInfoToBackend(extractedInfo, true);
          
          // Clear localStorage data for all sections
          // This ensures that when these sections are shown, they will fetch the new resume data
          localStorage.removeItem('resumeWorkExperience');
          localStorage.removeItem('resumeEducation');
          localStorage.removeItem('resumeSkills');
          localStorage.removeItem('contactInfo');
          localStorage.removeItem('selectedTitles');
          localStorage.removeItem('selectedLocations');
          localStorage.removeItem('questionnaireAnswers');
          
          // Also clear any cached data in the application state
          setWorkExperienceError(null);
          setEducationError(null);
          setSkillsError(null);
          setIsLoadingWorkExperience(false);
          setIsLoadingEducation(false);
          setIsLoadingSkills(false);
          
          // Navigate to the Contact Info section after successful parsing
          setShowResumeUpload(false);
          setShowContactInfo(true);
          
        } catch (e) {
          console.error('Failed to fetch parsed resume JSON:', e);
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadStatus('idle');
      setUploadError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };
  
  // Extract contact info from parsed resume
  const extractContactInfoFromResume = (parsedResume: any) => {
    console.log('Extracting contact info from resume:', parsedResume);
    
    // Safe extraction helper
    const getValue = (path: string[], fallback = '') => {
      const value = path.reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : undefined, parsedResume);
      // Convert to string if needed
      return value !== undefined ? String(value) : fallback;
    };
    
    // Safe array extraction
    const getArrayValue = (path: string[], fallback: any[] = []) => {
      const value = path.reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : undefined, parsedResume);
      return Array.isArray(value) ? value : fallback;
    };
    
    // Check for GPT-4 parsed resume format (our Python service)
    if (parsedResume['Full Name'] || parsedResume['Email'] || parsedResume['Phone']) {
      console.log('Detected GPT-4 parsed resume format');
      
      // Split full name into first and last name
      let firstName = '';
      let lastName = '';
      if (parsedResume['Full Name']) {
        const nameParts = parsedResume['Full Name'].split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }
      
      // Try to extract address information
      let address = '';
      let city = '';
      let state = '';
      let postalCode = '';
      
      // Check for Address field
      if (parsedResume['Address']) {
        // If it's a string, try to parse it
        if (typeof parsedResume['Address'] === 'string') {
          address = parsedResume['Address'];
          
          // Try to extract city, state, zip from address string
          const addressParts = address.split(',').map(part => part.trim());
          if (addressParts.length >= 2) {
            // Last part might contain state and zip
            const lastPart = addressParts[addressParts.length - 1];
            const stateZipMatch = lastPart.match(/([A-Z]{2})\s+(\d{5}(-\d{4})?)/);
            
            if (stateZipMatch) {
              state = stateZipMatch[1];
              postalCode = stateZipMatch[2];
            }
            
            // Second to last part might be the city
            if (addressParts.length >= 2) {
              city = addressParts[addressParts.length - 2];
            }
          }
        } else if (typeof parsedResume['Address'] === 'object') {
          // If it's an object, try to extract fields directly
          address = parsedResume['Address']['street'] || parsedResume['Address']['line1'] || '';
          city = parsedResume['Address']['city'] || '';
          state = parsedResume['Address']['state'] || parsedResume['Address']['region'] || '';
          postalCode = parsedResume['Address']['postalCode'] || parsedResume['Address']['zip'] || '';
        }
      }
      
      // Check for separate location fields
      city = parsedResume['City'] || city;
      state = parsedResume['State'] || state;
      postalCode = parsedResume['Postal Code'] || parsedResume['Zip Code'] || parsedResume['ZIP'] || postalCode;
      
      // Check if location is in Work Experience
      if (!city && !state && parsedResume['Work Experience'] && parsedResume['Work Experience'].length > 0) {
        const latestJob = parsedResume['Work Experience'][0];
        if (latestJob.Location) {
          const locationParts = latestJob.Location.split(',').map((part: string) => part.trim());
          if (locationParts.length >= 2) {
            city = locationParts[0] || city;
            // State might include zip
            const stateWithZip = locationParts[1];
            const stateZipMatch = stateWithZip.match(/([A-Z]{2})\s+(\d{5}(-\d{4})?)/);
            if (stateZipMatch) {
              state = stateZipMatch[1] || state;
              postalCode = stateZipMatch[2] || postalCode;
            } else {
              state = stateWithZip || state;
            }
          } else if (locationParts.length === 1) {
            city = locationParts[0] || city;
          }
        }
      }
      
      return {
        firstName,
        lastName,
        email: parsedResume['Email'] || '',
        phone: parsedResume['Phone'] || '',
        linkedin: parsedResume['LinkedIn'] || '',
        dob: '',
        address,
        city,
        state,
        postalCode,
        smsConsent: true
      };
    }
    
    // Extract data based on common resume parsing structures (fallback to original method)
    const links = getArrayValue(['data', 'links'], []);
    let linkedinUrl = links.find((l: any) => l?.type?.toLowerCase?.()?.includes?.('linkedin'))?.url || '';
    // Try both 'linkedin' and 'linkedIn' keys
    if (!linkedinUrl) {
      linkedinUrl = getValue(['linkedin']) || getValue(['linkedIn']);
    }
    console.log('Extracted LinkedIn:', linkedinUrl);
    
    return {
      firstName: getValue(['data', 'name', 'first']) || getValue(['name', 'first']) || getValue(['firstName']),
      lastName: getValue(['data', 'name', 'last']) || getValue(['name', 'last']) || getValue(['lastName']),
      dob: getValue(['data', 'dateOfBirth']) || getValue(['dateOfBirth']),
      address: getValue(['data', 'address', 'street']) || getValue(['address', 'street']) || getValue(['address']),
      city: getValue(['data', 'address', 'city']) || getValue(['address', 'city']),
      state: getValue(['data', 'address', 'state']) || getValue(['address', 'state']),
      postalCode: getValue(['data', 'address', 'postcode']) || getValue(['address', 'postalCode']) || getValue(['address', 'zipCode']),
      linkedin: linkedinUrl,
      phone: String(getValue(['data', 'phoneNumbers', '0', 'number']) || getValue(['phoneNumbers', '0']) || getValue(['phone']) || ''),
      email: String(getValue(['data', 'emails', '0']) || getValue(['emails', '0']) || getValue(['email']) || '')
    };
  };
  
  // Save contact info to backend
  const saveContactInfoToBackend = async (data: any, replace: boolean = false) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          section: 'contactInfo', 
          data: data,
          replace: replace // Add flag to indicate if this should replace existing data
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save contact info');
      }
      
      console.log('Contact info saved successfully');
    } catch (error) {
      console.error('Error saving contact info:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle contact info field changes
  const handleContactInfoChange = (field: string, value: string | boolean) => {
    const updatedInfo = { ...contactInfo, [field]: value };
    setContactInfo(updatedInfo);
    saveContactInfoToBackend(updatedInfo);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0f0f11]">

      
      {/* Sidebar */}
      {/* Mobile Toggle Button */}
      {!isSidebarOpen && (
        <button
          className="fixed left-0 top-1/2 transform -translate-y-1/2 z-50 bg-[#7a64c2] text-white p-2 rounded-r-lg shadow-lg lg:hidden sidebar-toggle"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <FaChevronRight size={16} />
        </button>
      )}
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <div
        className={`sidebar ${isSidebarOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Onboarding navigation"
      >
        {/* Close Button for mobile */}
        {isSidebarOpen && (
          <button
            className="absolute right-4 top-4 z-50 text-white hover:text-gray-200 transition-colors lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <FaTimes size={20} />
          </button>
        )}
        <div className="top-section">
          <div className="flex items-center gap-2.5 pl-2">
            <div className="w-5 h-5 bg-gradient-to-br from-[#d8f1eb] to-[#9bd6c4] rounded transform rotate-45"
              style={{ boxShadow: '2px 2px 5px rgba(0,0,0,0.2), -1px -1px 3px rgba(255,255,255,0.4)' }}
            />
            <div className="text-lg font-semibold text-white">Talexus AI</div>
          </div>
          {/* User avatar/info section (matches dashboard) */}
          <div 
            className="user hover:bg-white/5 rounded-lg transition-colors duration-200 p-2 -mx-2 cursor-pointer"
            onClick={() => {
              setShowAccountSettings(true);
              setShowLocation(false);
              setShowSalary(false);
              setShowJobTitles(false);
              setShowResumeUpload(false);
            }}
          >
            <div className="flex items-center gap-3">
              <img
                src={session?.user?.image || 'https://randomuser.me/api/portraits/men/75.jpg'}
                alt="User Avatar"
                className="w-11 h-11 rounded-full object-cover flex-shrink-0"
              />
              <div className="user-info min-w-0">
                <div className="text-sm font-medium text-white truncate">{session?.user?.name || 'User'}</div>
                <div className="text-xs text-gray-300 truncate">Manage Account (Free Plan)</div>
              </div>
            </div>
          </div>
          <div className="menu-group">
  <div 
    className="menu-label cursor-pointer hover:text-purple-300 transition-colors flex items-center"
    onClick={() => {
      setShowResumeUpload(false);
      setShowContactInfo(false);
      setShowWorkExperience(false);
      setShowSkills(false);
      setShowJobTitles(false);
      setShowSalary(false);
      setShowLocation(false);
      setShowAccountSettings(false);
      setIsSidebarOpen(false);
    }}
  >
    <span>Getting Started</span>
  </div>

  {/* 1. Upload Resume */}
  <button 
    onClick={() => {
      setShowResumeUpload(true);
      setShowContactInfo(false);
      setShowWorkExperience(false);
      setShowSkills(false);
      setShowJobTitles(false);
      setShowSalary(false);
      setShowLocation(false);
      setShowAccountSettings(false);
      setIsSidebarOpen(false);
    }} 
    className="menu-item"
  >
    <FaFileAlt className="icon" /><span>Upload Resume</span>
  </button>

  {/* 2. Contact Info */}
  <button 
    onClick={() => {
      setShowResumeUpload(false);
      setShowContactInfo(true);
      setShowWorkExperience(false);
      setShowSkills(false);
      setShowJobTitles(false);
      setShowSalary(false);
      setShowLocation(false);
      setShowAccountSettings(false);
      setIsSidebarOpen(false);
    }} 
    className="menu-item text-left w-full"
  >
    <FaAddressBook className="icon" /><span>Contact Info</span>
  </button>

  {/* 3. Work Experience */}
  <button 
    onClick={() => {
      setShowResumeUpload(false);
      setShowContactInfo(false);
      setShowWorkExperience(true);
      setShowEducation(false);
      setShowSkills(false);
      setShowJobTitles(false);
      setShowSalary(false);
      setShowLocation(false);
      setShowAccountSettings(false);
      setIsSidebarOpen(false);
    }} 
    className="menu-item text-left w-full"
  >
    <FaBriefcase className="icon" /><span>Work Experience</span>
  </button>

  {/* 4. Education */}
  <button 
    onClick={() => {
      setShowResumeUpload(false);
      setShowContactInfo(false);
      setShowWorkExperience(false);
      setShowEducation(true);
      setShowSkills(false);
      setShowJobTitles(false);
      setShowSalary(false);
      setShowLocation(false);
      setShowAccountSettings(false);
      setIsSidebarOpen(false);
    }} 
    className="menu-item text-left w-full"
  >
    <FaGraduationCap className="icon" /><span>Education</span>
  </button>

  {/* 5. Skills */}
  <button 
    onClick={() => {
      setShowResumeUpload(false);
      setShowContactInfo(false);
      setShowWorkExperience(false);
      setShowEducation(false);
      setShowSkills(true);
      setShowJobTitles(false);
      setShowSalary(false);
      setShowLocation(false);
      setShowAccountSettings(false);
      setIsSidebarOpen(false);
    }} 
    className="menu-item text-left w-full"
  >
    <FaCheckCircle className="icon" /><span>Skills</span>
  </button>

  {/* 5. Job Title */}
  <button 
    onClick={() => {
      setShowResumeUpload(false);
      setShowContactInfo(false);
      setShowWorkExperience(false);
      setShowSkills(false);
      setShowJobTitles(true);
      setShowSalary(false);
      setShowLocation(false);
      setShowAccountSettings(false);
      setIsSidebarOpen(false);
    }} 
    className="menu-item text-left w-full"
  >
    <FaBriefcase className="icon" /><span>Job Title</span>
  </button>

  {/* 6. Questionnaire */}
  <button 
    onClick={() => {
      setShowResumeUpload(false);
      setShowContactInfo(false);
      setShowWorkExperience(false);
      setShowSkills(false);
      setShowJobTitles(false);
      setShowSalary(false);
      setShowLocation(false);
      setShowQuestionnaire(true);
      setShowAccountSettings(false);
      setIsSidebarOpen(false);
    }} 
    className="menu-item text-left w-full"
  >
    <FaClipboardList className="icon" /><span>Questionnaire</span>
  </button>

  {/* 9. Finalize */}
  <a href="#finish" className="menu-item"><FaCheckCircle className="icon" /><span>Finalize</span></a>
</div>
          
          {/* Sidebar menu items end */}
        </div>
        <div className="bottom-card mt-10">
          <strong>Need help?</strong>
          <p>Contact support for onboarding assistance</p>
          <button>Contact Us</button>
        </div>
      </div>
      {/* Main onboarding content */}
      <main className="h-screen overflow-y-auto flex-1 bg-[#0e0c12] text-white">
        {/* Hide the main UI when Education section is shown */}
        {showAccountSettings ? (
          <div className="w-[calc(100%-1rem)] max-w-4xl text-center border border-gray-700 rounded-xl pt-8 pb-10 px-6 bg-[#12101a]/50 mx-auto mt-[2px]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Account</h1>
                <p className="text-gray-400 text-sm">Manage billing and account settings</p>
              </div>
              {/* Cross button removed as requested */}
            </div>

            <div className="bg-[#1f1e22] rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img 
                    src={session?.user?.image || 'https://randomuser.me/api/portraits/men/75.jpg'} 
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-white font-medium text-sm">{session?.user?.name || 'User'}</h3>
                    <p className="text-gray-400 text-xs">{session?.user?.email || 'No email provided'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="bg-white text-black px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>

            <div className="bg-[#1f1e22] rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#2a2830] rounded-lg">
                    <FaCreditCard className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">Manage Billing Information</h3>
                    <p className="text-gray-400 text-xs">Manage, upgrade or cancel your plan</p>
                  </div>
                </div>
                <button className="bg-white text-black px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                  Manage
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Current Plan</h2>
              <p className="text-gray-400 mb-6">Free Plan</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Trial Access Card */}
                <div className="bg-[#1f1e22] rounded-[14px] p-6 border-2 border-transparent transition duration-300 hover:border-[#6f60e2] hover:shadow-[0_0_16px_2px_rgba(111,96,226,0.3)] mt-2">
                  <div className="text-lg font-semibold mb-1">Trial Access</div>
                  <div className="text-2xl font-bold mb-2">$2.95</div>
                  <div className="text-sm text-gray-300 mt-3 mb-2 space-y-1">
                    <div><span className="text-[#2ecc71] mr-2">&#10003;</span>AI-powered job search</div>
                    <div><span className="text-[#2ecc71] mr-2">&#10003;</span>Auto-fill your applications</div>
                    <div><span className="text-[#2ecc71] mr-2">&#10003;</span>Full access with unlimited applications</div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">Try it risk-free • Money-back guarantee • Cancel anytime</div>
                </div>

                {/* 3 Month Full Access Card */}
                <div className="bg-[#1f1e22] rounded-[14px] p-6 border-2 border-transparent transition duration-300 hover:border-[#6f60e2] hover:shadow-[0_0_16px_2px_rgba(111,96,226,0.3)] focus-within:shadow-[0_0_16px_2px_rgba(111,96,226,0.3)] mt-2">
                  <div className="text-lg font-semibold mb-1 flex items-center">3 Month Full Access <span className="ml-2 bg-[#2ecc71] text-black text-[11px] px-2 py-0.5 rounded-full">RECOMMENDED</span></div>
                  <div className="text-2xl font-bold mb-2">$13.95<span className="text-base font-normal">/mo</span></div>
                  <div className="text-sm text-gray-300 mt-3 mb-2 space-y-1">
                    <div><span className="text-[#2ecc71] mr-2">&#10003;</span>AI-powered job search</div>
                    <div><span className="text-[#2ecc71] mr-2">&#10003;</span>Auto-fill your applications</div>
                    <div><span className="text-[#2ecc71] mr-2">&#10003;</span>Full access with unlimited applications</div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">$41.85 up front • Cancel anytime</div>
                </div>

                {/* 6 Month Full Access Card */}
                <div className="bg-[#1f1e22] rounded-[14px] p-6 border-2 border-transparent transition duration-300 hover:border-[#6f60e2] hover:shadow-[0_0_16px_2px_rgba(111,96,226,0.3)] mt-2">
                  <div className="text-lg font-semibold mb-1">6 Month Full Access</div>
                  <div className="text-2xl font-bold mb-2">$10.95<span className="text-base font-normal">/mo</span></div>
                  <div className="text-sm text-gray-300 mt-3 mb-2 space-y-1">
                    <div><span className="text-[#2ecc71] mr-2">&#10003;</span>AI-powered job search</div>
                    <div><span className="text-[#2ecc71] mr-2">&#10003;</span>Auto-fill your applications</div>
                    <div><span className="text-[#2ecc71] mr-2">&#10003;</span>Full access with unlimited applications</div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">$65.70 up front • Save 63% • Cancel anytime</div>
                </div>
              </div>
            </div>
          </div>
        ) : !showResumeUpload && !showContactInfo && !showWorkExperience && !showEducation && !showSkills && !showJobTitles && !showSalary && !showLocation && !showQuestionnaire && !showAccountSettings && (
          <div className="w-[calc(100%-1rem)] max-w-5xl text-center mt-24 border border-gray-700 rounded-xl pt-8 pb-10 px-6 bg-[#12101a]/50 mx-auto mt-2">
            <h2 className="text-[28px] font-semibold mb-2">Let's set you up for success!</h2>
            <p className="text-[#a0a0a0] text-[15px] mb-8">Automate your job search in 3 simple steps.</p>

            <div className="card-container flex flex-col md:flex-row gap-6 justify-center w-full items-center md:items-stretch mt-2">
              {/* Card 1 - Resume Upload */}
              <div 
                className="card w-[95%] md:w-[300px] h-[300px] bg-gradient-to-br from-[#1e1b2d] to-[#0f0e15] border border-[#282630] rounded-[20px] p-5 shadow-[0_10px_40px_rgba(168,85,247,0.15)] transition-all duration-300 hover:border-[#a855f7] hover:scale-[1.04] hover:shadow-[0_0_18px_rgba(168,85,247,0.35)] flex flex-col justify-between md:max-w-none"
              >
                <div className="text-left pt-0">
                  <h2 className="text-[1.2rem] mb-2 font-semibold text-white text-left">Upload your resume.</h2>
                  <p className="text-[#a3a3a3] text-[0.95rem] mb-3 text-left">Help us understand your experience.</p>
                  <div className="badge bg-[#6d28d9] text-white text-[14px] rounded-[8px] py-[6px] px-[14px] inline-block mb-3">
                    Resume.pdf
                  </div>
                  <ul className="features list-none p-0 m-0 text-[0.95rem] text-left leading-tight">
                    <li className="mb-[4px] text-[#d4d4d4] before:content-['✔'] before:text-[#a855f7] before:mr-2">Personal Information</li>
                    <li className="mb-[4px] text-[#d4d4d4] before:content-['✔'] before:text-[#a855f7] before:mr-2">Experience</li>
                    <li className="mb-[4px] text-[#d4d4d4] before:content-['✔'] before:text-[#a855f7] before:mr-2">Skills</li>
                    <li className="mb-[4px] text-[#d4d4d4] before:content-['✔'] before:text-[#a855f7] before:mr-2">Education</li>
                    <li className="mb-[4px] text-[#d4d4d4] before:content-['✔'] before:text-[#a855f7] before:mr-2">Summary...</li>
                  </ul>
                </div>
              </div>

              {/* Card 2 - Job Titles */}
              <div
                className="card w-[95%] md:w-[300px] h-[300px] bg-gradient-to-br from-[#1e1b2d] to-[#0f0e15] border border-[#282630] rounded-[20px] p-5 shadow-[0_10px_40px_rgba(168,85,247,0.15)] transition-all duration-300 hover:border-[#a855f7] hover:scale-[1.04] hover:shadow-[0_0_18px_rgba(168,85,247,0.35)] flex flex-col justify-between md:max-w-none"
              >
                <div className="text-left pt-0">
                  <h2 className="text-[1.2rem] mb-2 font-semibold text-white text-left">Complete a quick profile.</h2>
                  <p className="text-[#a3a3a3] text-[0.95rem] mb-3 text-left">Share your preferences and career goals.</p>
                  <p className="text-[0.95rem] mb-2 text-left"><span className="bold text-white font-semibold">Desired job?</span><br/>Project Manager</p>
                  <p className="text-[0.95rem] mb-2 text-left"><span className="bold text-white font-semibold">Your desired salary:</span><br/>$110,000</p>
                  <p className="text-[0.95rem] text-left"><span className="bold text-white font-semibold">Where do you want to work?</span><br/>New York, NY</p>
                </div>
              </div>

              {/* Card 3 - Job Applications */}
              <div 
                className="card w-[95%] md:w-[300px] h-[300px] bg-gradient-to-br from-[#1e1b2d] to-[#0f0e15] border border-[#282630] rounded-[20px] p-5 shadow-[0_10px_40px_rgba(168,85,247,0.15)] transition-all duration-300 hover:border-[#a855f7] hover:scale-[1.04] hover:shadow-[0_0_18px_rgba(168,85,247,0.35)] flex flex-col justify-between md:max-w-none"
              >
                <div className="text-left pt-0">
                  <h2 className="text-[1.2rem] mb-2 font-semibold text-white text-left">We find jobs and fill out applications.</h2>
                  <p className="text-[#a3a3a3] text-[0.95rem] mb-3 text-left">Sit back while we do the heavy lifting.</p>
                  <div className="badge bg-[#6d28d9] text-white text-[14px] rounded-[8px] py-[6px] px-[14px] inline-block mb-2">
                    Resume.pdf
                  </div>
                  <a className="match-link text-[#60a5fa] no-underline font-medium block my-[10px] text-left" href="#">15 job matches</a>
                  <div className="job-item text-[0.95rem] mb-1 text-left">A Software Developer <span className="applied text-[#22c55e] font-bold ml-[10px]">Applied</span></div>
                  <div className="job-item text-[0.95rem] text-left">G Business Analyst <span className="applied text-[#22c55e] font-bold ml-[10px]">Applied</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Contact Info Section */}
        {showContactInfo && (
          <div className="w-[calc(100%-1rem)] max-w-4xl text-center border border-gray-700 rounded-xl pt-8 pb-10 px-6 bg-[#12101a]/50 mx-auto mt-2">
            {/* Box header for visual consistency with skills section */}
            <div className="w-full bg-gradient-to-r from-[#1e1a2e] to-[#19172d] p-6 rounded-t-xl border border-[#2e2a3d] mb-6">
              <h2 className="text-xl font-semibold text-white mb-1">Your Contact Information</h2>
              <p className="text-gray-400 text-sm">Ensure your contact details are up to date — employers may reach out anytime.</p>
            </div>
            
            <div className="w-full">
              
              <form className="text-left">
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block mb-1 font-medium text-white" htmlFor="firstName">First Name *</label>
                    <input 
                      className="w-full p-3 rounded bg-[#1a1625] border border-gray-700 text-white" 
                      id="firstName" 
                      type="text" 
                      value={contactInfo.firstName} 
                      onChange={(e) => handleContactInfoChange('firstName', e.target.value)} 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 font-medium text-white" htmlFor="lastName">Last Name *</label>
                    <input 
                      className="w-full p-3 rounded bg-[#1a1625] border border-gray-700 text-white" 
                      id="lastName" 
                      type="text" 
                      value={contactInfo.lastName} 
                      onChange={(e) => handleContactInfoChange('lastName', e.target.value)} 
                    />
                  </div>
                </div>

                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block mb-1 font-medium text-white" htmlFor="dob">Date of Birth *</label>
                    <input 
                      className="w-full p-3 rounded bg-[#1a1625] border border-gray-700 text-white" 
                      id="dob" 
                      type="date" 
                      value={contactInfo.dob} 
                      onChange={(e) => handleContactInfoChange('dob', e.target.value)} 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 font-medium text-white" htmlFor="address">Address *</label>
                    <input 
                      className="w-full p-3 rounded bg-[#1a1625] border border-gray-700 text-white" 
                      id="address" 
                      type="text" 
                      value={contactInfo.address} 
                      onChange={(e) => handleContactInfoChange('address', e.target.value)} 
                    />
                  </div>
                </div>

                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block mb-1 font-medium text-white" htmlFor="city">City *</label>
                    <input 
                      className="w-full p-3 rounded bg-[#1a1625] border border-gray-700 text-white" 
                      id="city" 
                      type="text" 
                      value={contactInfo.city} 
                      onChange={(e) => handleContactInfoChange('city', e.target.value)} 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 font-medium text-white" htmlFor="state">State *</label>
                    <input 
                      className="w-full p-3 rounded bg-[#1a1625] border border-gray-700 text-white" 
                      id="state" 
                      type="text" 
                      value={contactInfo.state} 
                      onChange={(e) => handleContactInfoChange('state', e.target.value)} 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 font-medium text-white" htmlFor="postalCode">Postal Code *</label>
                    <input 
                      className="w-full p-3 rounded bg-[#1a1625] border border-gray-700 text-white" 
                      id="postalCode" 
                      type="text" 
                      value={contactInfo.postalCode} 
                      onChange={(e) => handleContactInfoChange('postalCode', e.target.value)} 
                    />
                  </div>
                </div>

                <label className="block mb-1 font-medium text-white" htmlFor="linkedin">LinkedIn Profile</label>
                <input 
                  className="w-full mb-4 p-3 rounded bg-[#1a1625] border border-gray-700 text-white" 
                  id="linkedin" 
                  type="url" 
                  value={contactInfo.linkedin} 
                  onChange={(e) => handleContactInfoChange('linkedin', e.target.value)} 
                />

                <label className="block mb-1 font-medium text-white" htmlFor="phone">Phone Number *</label>
                <input 
                  className="w-full mb-4 p-3 rounded bg-[#1a1625] border border-gray-700 text-white" 
                  id="phone" 
                  type="tel" 
                  value={contactInfo.phone} 
                  onChange={(e) => handleContactInfoChange('phone', e.target.value)} 
                />

                <label className="block mb-1 font-medium text-white" htmlFor="email">Email Address *</label>
                <input 
                  className="w-full mb-4 p-3 rounded bg-[#1a1625] border border-gray-700 text-white" 
                  id="email" 
                  type="email" 
                  value={contactInfo.email} 
                  onChange={(e) => handleContactInfoChange('email', e.target.value)} 
                />

                <div className="flex items-start gap-3 mb-4">
                  <input 
                    type="checkbox" 
                    id="smsConsent" 
                    className="mt-1" 
                    checked={contactInfo.smsConsent} 
                    onChange={(e) => handleContactInfoChange('smsConsent', e.target.checked)} 
                  />
                  <label htmlFor="smsConsent" className="text-sm text-gray-300 text-left block px-1">
                    By providing your phone number and selecting the checkbox, you consent to receive new job alerts and account information via SMS text messages. Message frequency may vary based on your interactions with us. Message &amp; data rates may apply. You can opt-out at any time by replying "STOP" to unsubscribe or contacting Customer Service. For more information, please refer to our{' '}
                    <a href="#" className="text-blue-400 underline inline">Privacy Policy</a> and <a href="#" className="text-blue-400 underline inline">Terms of Service</a>.
                  </label>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setShowContactInfo(false);
                      setShowResumeUpload(true);
                    }}
                    className="w-24 px-3 py-2 text-sm border border-gray-600 rounded-lg text-white hover:bg-gray-800 transition-colors flex items-center justify-center"
                  >
                    Back
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setShowContactInfo(false);
                      setShowWorkExperience(true);
                      // Save data to backend before proceeding
                      saveContactInfoToBackend(contactInfo);
                    }}
                    className="w-24 px-3 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                  >
                    Next
                  </button>
                </div>
                
                {isSaving && <div className="text-xs text-gray-400 mt-2 text-center">Saving...</div>}
              </form>
            </div>
          </div>
        )}
        
        {/* Work Experience Section */}
        {showWorkExperience && (
          <div className="w-[calc(100%-1rem)] max-w-4xl text-center border border-gray-700 rounded-xl pt-8 pb-10 px-6 bg-[#12101a]/50 mx-auto mt-2">
            {/* Box header for visual consistency with skills section */}
            <div className="w-full bg-gradient-to-r from-[#1e1a2e] to-[#19172d] p-6 rounded-t-xl border border-[#2e2a3d] mb-6">
              <h2 className="text-xl font-semibold text-white mb-1">Your Work Experience</h2>
              <p className="text-gray-400 text-sm">Review and edit your work history from your resume</p>
            </div>
            
            <div className="w-full overflow-y-auto">
              {isLoadingWorkExperience ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 rounded-full border-4 border-t-purple-500 border-r-purple-300 border-b-purple-200 border-l-purple-400 animate-spin mb-4"></div>
                  <p className="text-white">Loading your work experience...</p>
                </div>
              ) : workExperienceError ? (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center mb-6">
                  <FaExclamationTriangle className="text-red-400 text-2xl mx-auto mb-2" />
                  <p className="text-red-200">{workExperienceError}</p>
                  <button 
                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm"
                    onClick={() => {
                      setIsLoadingWorkExperience(true);
                      setWorkExperienceError(null);
                      // Retry fetching work experience
                      setTimeout(() => {
                        setIsLoadingWorkExperience(false);
                      }, 1500);
                    }}
                  >
                    Try Again
                  </button>
                </div>
              ) : workExperience.length === 0 ? (
                <div className="bg-[#1a1625] border border-gray-700 rounded-xl p-6 mb-6 text-center">
                  <p className="text-gray-300 mb-4">No work experience found in your resume.</p>
                  <button 
                    className="w-full p-4 border border-dashed border-purple-500 rounded-lg text-purple-400 hover:bg-purple-900/20 transition-colors flex items-center justify-center gap-2"
                    onClick={() => {
                      const newExperience: WorkExperience = {
                        id: `exp-${Date.now()}`,
                        jobTitle: '',
                        company: '',
                        location: '',
                        startDate: '',
                        endDate: '',
                        responsibilities: ['', '', ''],
                        isEditing: true,
                        isExpanded: true
                      };
                      setWorkExperience([newExperience]);
                    }}
                  >
                    <FaPlus /> Add Work Experience
                  </button>
                </div>
              ) : (
                <>
                  {/* Work Experience Entries */}
                  {workExperience.map((exp, index) => (
                    <div key={exp.id} className="bg-[#1a1625] border border-gray-700 rounded-xl p-6 mb-4 text-left">
                      {exp.isEditing ? (
                        /* Edit Form */
                        <div className="text-left">
                          <h3 className="text-xl font-semibold text-white mb-4">Edit Work Experience</h3>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-gray-300 mb-1 text-sm">Position Title</label>
                              <input 
                                type="text" 
                                className="w-full bg-[#2a292e] border border-gray-700 rounded-lg px-3 py-2 text-white"
                                value={exp.jobTitle || ''}
                                onChange={(e) => {
                                  setWorkExperience(prev => 
                                    prev.map((item, i) => 
                                      i === index ? { ...item, jobTitle: e.target.value } : item
                                    )
                                  );
                                }}
                              />
                            </div>
                            
                            <div>
                              <label className="block text-gray-300 mb-1 text-sm">Company</label>
                              <input 
                                type="text" 
                                className="w-full bg-[#2a292e] border border-gray-700 rounded-lg px-3 py-2 text-white"
                                value={exp.company || ''}
                                onChange={(e) => {
                                  setWorkExperience(prev => 
                                    prev.map((item, i) => 
                                      i === index ? { ...item, company: e.target.value } : item
                                    )
                                  );
                                }}
                              />
                            </div>
                            
                            <div>
                              <label className="block text-gray-300 mb-1 text-sm">Location</label>
                              <input 
                                type="text" 
                                className="w-full bg-[#2a292e] border border-gray-700 rounded-lg px-3 py-2 text-white"
                                value={exp.location || ''}
                                onChange={(e) => {
                                  setWorkExperience(prev => 
                                    prev.map((item, i) => 
                                      i === index ? { ...item, location: e.target.value } : item
                                    )
                                  );
                                }}
                              />
                            </div>
                            
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <label className="block text-gray-300 mb-1 text-sm">Start Date</label>
                                <input 
                                  type="date" 
                                  className="w-full bg-[#2a292e] border border-gray-700 rounded-lg px-3 py-2 text-white"
                                  value={exp.startDate || ''}
                                  onChange={(e) => {
                                    setWorkExperience(prev => 
                                      prev.map((item, i) => 
                                        i === index ? { ...item, startDate: e.target.value } : item
                                      )
                                    );
                                  }}
                                />
                              </div>
                              
                              <div className="flex-1">
                                <label className="block text-gray-300 mb-1 text-sm">End Date</label>
                                <input 
                                  type="date" 
                                  className="w-full bg-[#2a292e] border border-gray-700 rounded-lg px-3 py-2 text-white"
                                  placeholder="Leave empty for 'Present'"
                                  value={exp.endDate || ''}
                                  onChange={(e) => {
                                    setWorkExperience(prev => 
                                      prev.map((item, i) => 
                                        i === index ? { ...item, endDate: e.target.value } : item
                                      )
                                    );
                                  }}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-gray-300 mb-1 text-sm">Responsibilities</label>
                              {exp.responsibilities.map((resp, respIndex) => (
                                <div key={respIndex} className="mb-2">
                                  <input 
                                    type="text" 
                                    className="w-full bg-[#2a292e] border border-gray-700 rounded-lg px-3 py-2 text-white"
                                    value={resp}
                                    onChange={(e) => {
                                      const newResponsibilities = [...exp.responsibilities];
                                      newResponsibilities[respIndex] = e.target.value;
                                      setWorkExperience(prev => 
                                        prev.map((item, i) => 
                                          i === index ? { ...item, responsibilities: newResponsibilities } : item
                                        )
                                      );
                                    }}
                                  />
                                </div>
                              ))}
                              
                              <button 
                                className="mt-2 px-3 py-1 text-sm bg-[#2a292e] text-purple-400 hover:bg-purple-900/20 rounded-lg transition-colors flex items-center gap-1"
                                onClick={() => {
                                  const newResponsibilities = [...exp.responsibilities, ''];
                                  setWorkExperience(prev => 
                                    prev.map((item, i) => 
                                      i === index ? { ...item, responsibilities: newResponsibilities } : item
                                    )
                                  );
                                }}
                              >
                                <FaPlus size={12} /> Add Responsibility
                              </button>
                            </div>
                          </div>
                          
                          <div className="mt-6 flex justify-between">
                            <button 
                              className="w-24 h-10 border border-gray-600 rounded-full text-white hover:bg-gray-800 transition-colors text-sm"
                              onClick={() => {
                                // Cancel editing - revert to previous state
                                setWorkExperience(prev => 
                                  prev.map((e, i) => 
                                    i === index ? { ...e, isEditing: false } : e
                                  )
                                );
                              }}
                            >
                              Cancel
                            </button>
                            <button 
                              className="w-24 h-10 bg-purple-600 hover:bg-purple-700 rounded-full text-white transition-colors text-sm"
                              onClick={() => {
                                // Save changes, exit editing mode, and collapse the card
                                setWorkExperience(prev => {
                                  const updated = prev.map((e, i) => 
                                    i === index ? { ...e, isEditing: false, isExpanded: false } : e
                                  );
                                  // Save to localStorage
                                  try {
                                    localStorage.setItem('resumeWorkExperience', JSON.stringify(updated));
                                  } catch (error) {
                                    console.error('Error saving work experience:', error);
                                  }
                                  return updated;
                                });
                              }}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Display Mode */
                        <>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-semibold text-white">{exp.jobTitle || 'Position Title'}</h3>
                              <div className="text-gray-300 mt-1">{exp.company || 'Company Name'}</div>
                              <div className="flex items-center text-gray-400 text-sm mt-1">
                                {exp.location && (
                                  <span className="flex items-center mr-3">
                                    <FaMapMarkerAlt className="mr-1" /> {exp.location}
                                  </span>
                                )}
                                <span>
                                  {exp.startDate} - {exp.endDate || 'Present'}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                onClick={() => {
                                  // Toggle expanded state
                                  setWorkExperience(prev => 
                                    prev.map((e, i) => 
                                      i === index ? { ...e, isExpanded: !e.isExpanded } : e
                                    )
                                  );
                                }}
                                aria-label={exp.isExpanded ? 'Collapse' : 'Expand'}
                              >
                                {exp.isExpanded ? <FaChevronRight className="transform rotate-90" /> : <FaChevronRight />}
                              </button>
                              <button 
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                onClick={() => {
                                  // Set editing state
                                  setWorkExperience(prev => 
                                    prev.map((e, i) => 
                                      i === index ? { ...e, isEditing: true, isExpanded: true } : e
                                    )
                                  );
                                }}
                                aria-label="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                onClick={() => {
                                  // Remove this experience
                                  setWorkExperience(prev => {
                                    const updated = prev.filter((_, i) => i !== index);
                                    // Save to localStorage after deletion
                                    try {
                                      localStorage.setItem('resumeWorkExperience', JSON.stringify(updated));
                                    } catch (error) {
                                      console.error('Error saving work experience after deletion:', error);
                                    }
                                    return updated;
                                  });
                                }}
                                aria-label="Delete"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                          
                          {exp.isExpanded && (
                            <div className="mt-4">
                              <h4 className="text-white font-medium mb-2">Responsibilities</h4>
                              <ul className="text-gray-300 space-y-2 pl-5 list-disc">
                                {exp.responsibilities.filter(Boolean).map((resp, respIndex) => (
                                  <li key={respIndex}>{resp}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  
                  {/* Add Another Position Button */}
                  <button 
                    className="w-full p-4 border border-dashed border-purple-500 rounded-lg text-purple-400 hover:bg-purple-900/20 transition-colors mb-6 flex items-center justify-center gap-2"
                    onClick={() => {
                      const newExperience: WorkExperience = {
                        id: `exp-${Date.now()}`,
                        jobTitle: '',
                        company: '',
                        location: '',
                        startDate: '',
                        endDate: '',
                        responsibilities: ['', '', ''],
                        isEditing: true,
                        isExpanded: true
                      };
                      setWorkExperience(prev => [newExperience, ...prev]);
                    }}
                  >
                    <FaPlus /> Add Another Position
                  </button>
                </>
              )}
              
              {/* Tips */}
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-left mb-4">
                <h4 className="text-purple-300 font-medium mb-2">Tips for a Strong Work History</h4>
                <ul className="text-purple-200 text-sm space-y-2">
                  <li>• Include positions from the past 10 years that are relevant to your job search</li>
                  <li>• Use action verbs and quantify achievements when possible</li>
                  <li>• Focus on responsibilities that demonstrate skills for your target roles</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 flex justify-between">
              <button 
                onClick={() => {
                  setShowWorkExperience(false);
                  setShowContactInfo(true);
                }}
                className="w-24 px-3 py-2 text-sm border border-gray-600 rounded-lg text-white hover:bg-gray-800 transition-colors flex items-center justify-center"
              >
                Back
              </button>
              
              <button 
                onClick={() => {
                  setShowWorkExperience(false);
                  setShowEducation(true);
                  // Save work experience to localStorage before proceeding
                  try {
                    localStorage.setItem('resumeWorkExperience', JSON.stringify(workExperience));
                  } catch (error) {
                    console.error('Error saving work experience:', error);
                  }
                }}
                className="w-24 px-3 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {/* Skills Section */}
        {showSkills && !showEducation && !showWorkExperience && !showContactInfo && !showResumeUpload && !showJobTitles && !showSalary && !showLocation && (
          <div className="w-[calc(100%-1rem)] max-w-4xl text-center border border-gray-700 rounded-xl pt-8 pb-10 px-6 bg-[#12101a]/50 mx-auto mt-2">
            {/* Box header for visual consistency with other sections */}
            <div className="w-full bg-gradient-to-r from-[#1e1a2e] to-[#19172d] p-6 rounded-t-xl border border-[#2e2a3d] mb-6">
              <h2 className="text-xl font-semibold text-white mb-1">Your Skills</h2>
              <p className="text-gray-400 text-sm">Add or remove skills to highlight your expertise</p>
            </div>

            {isLoadingSkills ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : skillsError ? (
              <div className="text-red-400 p-4 rounded-lg bg-red-900/20 mb-4 flex items-center">
                <FaExclamationTriangle className="mr-2" />
                {skillsError}
              </div>
            ) : (
              <div className="bg-[#1a1625] border border-gray-700 rounded-b-xl p-6">
                {/* Skills list */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-purple-900/30 border border-purple-500 text-purple-100 px-3 py-1.5 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          onClick={() => {
                            const updatedSkills = skills.filter((_, i) => i !== index);
                            setSkills(updatedSkills);
                            localStorage.setItem('resumeSkills', JSON.stringify(updatedSkills));
                          }}
                          className="ml-2 text-purple-300 hover:text-white"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add new skill */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a new skill..."
                      className="flex-1 bg-[#2a292e] border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newSkill.trim()) {
                          const updatedSkills = [...skills, newSkill.trim()];
                          setSkills(updatedSkills);
                          setNewSkill('');
                          localStorage.setItem('resumeSkills', JSON.stringify(updatedSkills));
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newSkill.trim()) {
                          const updatedSkills = [...skills, newSkill.trim()];
                          setSkills(updatedSkills);
                          setNewSkill('');
                          localStorage.setItem('resumeSkills', JSON.stringify(updatedSkills));
                        }
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Skill categories from resume */}
                {skills.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-white mb-3">Skill Suggestions</h3>
                    <p className="text-gray-400 text-sm mb-4">Based on your resume and industry trends, you might want to add these skills:</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#1f1e22] rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Technical Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {['Python', 'JavaScript', 'React', 'Node.js', 'SQL'].filter(skill => !skills.includes(skill)).map((skill, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                const updatedSkills = [...skills, skill];
                                setSkills(updatedSkills);
                                localStorage.setItem('resumeSkills', JSON.stringify(updatedSkills));
                              }}
                              className="bg-[#2a292e] hover:bg-purple-900/30 text-gray-300 hover:text-purple-100 px-3 py-1.5 rounded-full text-sm transition-colors"
                            >
                              + {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-[#1f1e22] rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Soft Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {['Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Time Management'].filter(skill => !skills.includes(skill)).map((skill, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                const updatedSkills = [...skills, skill];
                                setSkills(updatedSkills);
                                localStorage.setItem('resumeSkills', JSON.stringify(updatedSkills));
                              }}
                              className="bg-[#2a292e] hover:bg-purple-900/30 text-gray-300 hover:text-purple-100 px-3 py-1.5 rounded-full text-sm transition-colors"
                            >
                              + {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Navigation Buttons */}
                <div className="mt-8 flex justify-between items-center w-full">
                  <button
                    onClick={() => {
                      setShowSkills(false);
                      setShowEducation(true);
                    }}
                    className="w-24 px-3 py-2 text-sm border border-gray-600 rounded-lg text-white hover:bg-gray-800 transition-colors flex items-center justify-center"
                  >
                    <FaArrowLeft className="mr-1 h-4 w-4" />
                    Back
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowSkills(false);
                      setShowJobTitles(true);
                    }}
                    className="w-24 px-3 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Education Section */}
        {showEducation && !showSkills && !showWorkExperience && !showContactInfo && !showResumeUpload && !showJobTitles && !showSalary && !showLocation && (
          <div className="w-[calc(100%-1rem)] max-w-4xl text-center border border-gray-700 rounded-xl pt-8 pb-10 px-6 bg-[#12101a]/50 mx-auto mt-2">
            {/* Box header for visual consistency with skills section */}
            <div className="w-full bg-gradient-to-r from-[#1e1a2e] to-[#19172d] p-6 rounded-t-xl border border-[#2e2a3d] mb-6">
              <h2 className="text-xl font-semibold text-white mb-1">Your Education</h2>
              <p className="text-gray-400 text-sm">Review and edit your education history from your resume</p>
            </div>
            
            <div className="w-full overflow-y-auto">
              {isLoadingEducation ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 rounded-full border-4 border-t-purple-500 border-r-purple-300 border-b-purple-200 border-l-purple-400 animate-spin mb-4"></div>
                  <p className="text-white">Loading your education...</p>
                </div>
              ) : educationError ? (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center mb-6">
                  <FaExclamationTriangle className="text-red-400 text-2xl mx-auto mb-2" />
                  <p className="text-red-200">{educationError}</p>
                  <button 
                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm"
                    onClick={() => {
                      setIsLoadingEducation(true);
                      setEducationError(null);
                      // Retry fetching education
                      setTimeout(() => {
                        setIsLoadingEducation(false);
                      }, 1500);
                    }}
                  >
                    Try Again
                  </button>
                </div>
              ) : education.length === 0 ? (
                <div className="bg-[#1a1625] border border-gray-700 rounded-xl p-6 mb-6 text-center">
                  <p className="text-gray-300 mb-4">No education found in your resume.</p>
                  <button 
                    className="w-full p-4 border border-dashed border-purple-500 rounded-lg text-purple-400 hover:bg-purple-900/20 transition-colors flex items-center justify-center gap-2"
                    onClick={() => {
                      const newEducation: Education = {
                        id: `edu-${Date.now()}`,
                        school: '',
                        degree: '',
                        fieldOfStudy: '',
                        startDate: '',
                        endDate: '',
                        description: '',
                        isEditing: true,
                        isExpanded: true
                      };
                      setEducation([newEducation]);
                    }}
                  >
                    <FaPlus /> Add Education
                  </button>
                </div>
              ) : (
                <>
                  {/* Education Entries */}
                  {education.map((edu, index) => (
                    <div key={edu.id} className="bg-[#1a1625] border border-gray-700 rounded-xl p-6 mb-4 text-left">
                      {edu.isEditing ? (
                        /* Edit Form */
                        <div className="text-left">
                          <h3 className="text-xl font-semibold text-white mb-4">Edit Education</h3>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-gray-300 mb-1 text-sm">School/Institution</label>
                              <input 
                                type="text" 
                                className="w-full bg-[#2a292e] border border-gray-700 rounded-lg px-3 py-2 text-white"
                                value={edu.school || ''}
                                onChange={(e) => {
                                  setEducation(prev => 
                                    prev.map((item, i) => 
                                      i === index ? { ...item, school: e.target.value } : item
                                    )
                                  );
                                }}
                              />
                            </div>
                            
                            <div>
                              <label className="block text-gray-300 mb-1 text-sm">Degree</label>
                              <input 
                                type="text" 
                                className="w-full bg-[#2a292e] border border-gray-700 rounded-lg px-3 py-2 text-white"
                                value={edu.degree || ''}
                                onChange={(e) => {
                                  setEducation(prev => 
                                    prev.map((item, i) => 
                                      i === index ? { ...item, degree: e.target.value } : item
                                    )
                                  );
                                }}
                              />
                            </div>
                            
                            <div>
                              <label className="block text-gray-300 mb-1 text-sm">Field of Study</label>
                              <input 
                                type="text" 
                                className="w-full bg-[#2a292e] border border-gray-700 rounded-lg px-3 py-2 text-white"
                                value={edu.fieldOfStudy || ''}
                                onChange={(e) => {
                                  setEducation(prev => 
                                    prev.map((item, i) => 
                                      i === index ? { ...item, fieldOfStudy: e.target.value } : item
                                    )
                                  );
                                }}
                              />
                            </div>
                            
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <label className="block text-gray-300 mb-1 text-sm">Start Date</label>
                                <input 
                                  type="date" 
                                  className="w-full bg-[#2a292e] border border-gray-700 rounded-lg px-3 py-2 text-white"
                                  value={edu.startDate || ''}
                                  onChange={(e) => {
                                    setEducation(prev => 
                                      prev.map((item, i) => 
                                        i === index ? { ...item, startDate: e.target.value } : item
                                      )
                                    );
                                  }}
                                />
                              </div>
                              
                              <div className="flex-1">
                                <label className="block text-gray-300 mb-1 text-sm">End Date</label>
                                <input 
                                  type="date" 
                                  className="w-full bg-[#2a292e] border border-gray-700 rounded-lg px-3 py-2 text-white"
                                  placeholder="Leave empty for 'Present'"
                                  value={edu.endDate || ''}
                                  onChange={(e) => {
                                    setEducation(prev => 
                                      prev.map((item, i) => 
                                        i === index ? { ...item, endDate: e.target.value } : item
                                      )
                                    );
                                  }}
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-gray-300 mb-1 text-sm">Description</label>
                              <textarea 
                                className="w-full bg-[#2a292e] border border-gray-700 rounded-lg px-3 py-2 text-white min-h-[100px]"
                                value={edu.description || ''}
                                onChange={(e) => {
                                  setEducation(prev => 
                                    prev.map((item, i) => 
                                      i === index ? { ...item, description: e.target.value } : item
                                    )
                                  );
                                }}
                              />
                            </div>
                          </div>
                          
                          <div className="mt-6 flex justify-between">
                            <button 
                              className="w-24 h-10 border border-gray-600 rounded-full text-white hover:bg-gray-800 transition-colors text-sm"
                              onClick={() => {
                                // Cancel editing - revert to previous state
                                setEducation(prev => 
                                  prev.map((e, i) => 
                                    i === index ? { ...e, isEditing: false } : e
                                  )
                                );
                              }}
                            >
                              Cancel
                            </button>
                            <button 
                              className="w-24 h-10 bg-purple-600 hover:bg-purple-700 rounded-full text-white transition-colors text-sm"
                              onClick={() => {
                                // Save changes, exit editing mode, and collapse the card
                                setEducation(prev => {
                                  const updated = prev.map((e, i) => 
                                    i === index ? { ...e, isEditing: false, isExpanded: false } : e
                                  );
                                  // Save to localStorage
                                  try {
                                    localStorage.setItem('resumeEducation', JSON.stringify(updated));
                                  } catch (error) {
                                    console.error('Error saving education:', error);
                                  }
                                  return updated;
                                });
                              }}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Display Mode */
                        <>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-semibold text-white">{edu.school || 'School/Institution'}</h3>
                              <div className="text-gray-300 mt-1">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</div>
                              <div className="text-gray-400 text-sm mt-1">
                                <span>
                                  {edu.startDate} - {edu.endDate || 'Present'}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                onClick={() => {
                                  // Toggle expanded state
                                  setEducation(prev => 
                                    prev.map((e, i) => 
                                      i === index ? { ...e, isExpanded: !e.isExpanded } : e
                                    )
                                  );
                                }}
                                aria-label={edu.isExpanded ? 'Collapse' : 'Expand'}
                              >
                                {edu.isExpanded ? <FaChevronRight className="transform rotate-90" /> : <FaChevronRight />}
                              </button>
                              <button 
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                onClick={() => {
                                  // Set editing state
                                  setEducation(prev => 
                                    prev.map((e, i) => 
                                      i === index ? { ...e, isEditing: true, isExpanded: true } : e
                                    )
                                  );
                                }}
                                aria-label="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                onClick={() => {
                                  // Remove this education
                                  setEducation(prev => {
                                    const updated = prev.filter((_, i) => i !== index);
                                    // Save to localStorage after deletion
                                    try {
                                      localStorage.setItem('resumeEducation', JSON.stringify(updated));
                                    } catch (error) {
                                      console.error('Error saving education after deletion:', error);
                                    }
                                    return updated;
                                  });
                                }}
                                aria-label="Delete"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                          
                          {edu.isExpanded && edu.description && (
                            <div className="mt-4">
                              <h4 className="text-white font-medium mb-2">Description</h4>
                              <p className="text-gray-300">{edu.description}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  
                  {/* Add Another Education Button */}
                  <button 
                    className="w-full p-4 border border-dashed border-purple-500 rounded-lg text-purple-400 hover:bg-purple-900/20 transition-colors mb-6 flex items-center justify-center gap-2"
                    onClick={() => {
                      const newEducation: Education = {
                        id: `edu-${Date.now()}`,
                        school: '',
                        degree: '',
                        fieldOfStudy: '',
                        startDate: '',
                        endDate: '',
                        description: '',
                        isEditing: true,
                        isExpanded: true
                      };
                      setEducation(prev => [newEducation, ...prev]);
                    }}
                  >
                    <FaPlus /> Add Another Education
                  </button>
                </>
              )}
              
              {/* Tips */}
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-left mb-4">
                <h4 className="text-purple-300 font-medium mb-2">Tips for Education Section</h4>
                <ul className="text-purple-200 text-sm space-y-2">
                  <li>• Include your highest level of education and any relevant certifications</li>
                  <li>• Add academic achievements, honors, or relevant coursework in the description</li>
                  <li>• List education in reverse chronological order (most recent first)</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 flex justify-between">
              <button 
                onClick={() => {
                  setShowEducation(false);
                  setShowWorkExperience(true);
                }}
                className="w-24 px-3 py-2 text-sm border border-gray-600 rounded-lg text-white hover:bg-gray-800 transition-colors flex items-center justify-center"
              >
                Back
              </button>
              
              <button 
                onClick={() => {
                  setShowEducation(false);
                  setShowSkills(true);
                  // Save education to localStorage before proceeding
                  try {
                    localStorage.setItem('resumeEducation', JSON.stringify(education));
                  } catch (error) {
                    console.error('Error saving education:', error);
                  }
                }}
                className="w-24 px-3 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {/* Resume Upload Section */}
        {showResumeUpload && !showJobTitles && !showSalary && (
          <div className="w-[calc(100%-1rem)] max-w-2xl text-center mt-24 border border-gray-700 rounded-xl pt-8 pb-10 px-6 bg-[#12101a]/50 mx-auto mt-2">
            <div className="mb-6">
              {/* Back button removed as requested */}
            </div>
            
            <div 
              onClick={triggerFileInput}
              className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-all min-h-[300px] ${uploadStatus === 'success' ? 'border-green-500 bg-green-500/10' : 'border-gray-600 hover:border-purple-500 hover:bg-purple-500/5'}`}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFile(file);
                  }
                }}
              />
              
              {uploadStatus === 'success' ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCheck className="text-green-500" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Resume uploaded successfully!</h3>
                  <p className="text-gray-400">{selectedFile?.name}</p>
                </div>
              ) : uploadStatus === 'uploading' ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full border-4 border-t-purple-500 border-r-purple-300 border-b-purple-200 border-l-purple-400 animate-spin mb-4"></div>
                  <h3 className="text-xl font-semibold text-white mb-2">Uploading...</h3>
                  <p className="text-gray-400">{selectedFile?.name}</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUpload className="text-purple-400" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Select your resume file</h3>
                  <p className="text-gray-400">Drag and drop or click to browse</p>
                  <p className="text-gray-500 text-sm mt-2">Supported formats: PDF, DOC, DOCX</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 flex justify-between">
              <button 
                onClick={() => {
                  setShowResumeUpload(false);
                  if (uploadStatus !== 'success') {
                    setSelectedFile(null);
                    setUploadStatus('idle');
                  }
                }}
                className="w-24 px-3 py-2 text-sm border border-gray-600 rounded-lg text-white hover:bg-gray-800 transition-colors flex items-center justify-center"
              >
                Cancel
              </button>
              
              <button 
                onClick={() => {
                  if (uploadStatus === 'success') {
                    setShowResumeUpload(false);
                    setShowContactInfo(true);
                  } else {
                    triggerFileInput();
                  }
                }}
                className={`w-24 px-3 py-2 text-sm rounded-lg ${uploadStatus === 'success' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'} text-white transition-colors`}
              >
                {uploadStatus === 'success' ? 'Next' : 'Next'}
              </button>
            </div>
          </div>
        )}
        
        {showJobTitles && !showSalary && (
          <div className="w-[calc(100%-1rem)] max-w-2xl text-center mt-24 border border-gray-700 rounded-xl pt-8 pb-10 px-6 bg-[#12101a]/50 mx-auto mt-2">
            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 mt-2">
              {/* Headers */}
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">
                  What kind of jobs are you looking for?
                </h1>
                <p className="text-base text-gray-400">
                  We recommend up to 5 titles to get a great list of jobs.
                </p>
              </div>
              
              {/* Selected Titles */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedTitles.map((title) => (
                    <div
                      key={title}
                      className="flex items-center bg-purple-900/30 border border-purple-500 text-purple-100 px-3 py-1.5 rounded-full text-sm"
                    >
                      {title}
                      <button
                        onClick={() => handleRemoveTitle(title)}
                        className="ml-2 text-purple-300 hover:text-white"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for job titles..."
                    className="w-full bg-[#1a1625] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-[#1a1625] border border-gray-700 rounded-lg shadow-lg">
                      {suggestions.map((title) => (
                        <div
                          key={title}
                          onClick={() => handleSelectTitle(title)}
                          className="px-4 py-2 text-white hover:bg-purple-900/50 cursor-pointer"
                        >
                          {title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="mt-8">
              <div className="flex justify-between items-center w-full">
                <button
                  onClick={handleBackClick}
                  className="w-24 px-3 py-2 text-sm border border-gray-600 rounded-lg text-white hover:bg-gray-800 transition-colors flex items-center justify-center"
                >
                  <FaArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={() => {
                    if (selectedTitles.length > 0) {
                      // Save selected titles to localStorage
                      try {
                        localStorage.setItem('selectedTitles', JSON.stringify(selectedTitles));
                      } catch (error) {
                        console.error('Error saving job titles:', error);
                      }
                      
                      // Navigate to questionnaire section
                      setShowJobTitles(false);
                      setShowQuestionnaire(true);
                    }
                  }}
                  disabled={selectedTitles.length === 0}
                  className={`w-24 px-3 py-2 text-sm rounded-lg text-white transition-colors ${selectedTitles.length > 0 ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 opacity-50 cursor-not-allowed'}`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Questionnaire Section */}
        {showQuestionnaire && !showJobTitles && !showSkills && !showEducation && !showWorkExperience && !showContactInfo && !showResumeUpload && (
          <div className="w-[calc(100%-1rem)] max-w-4xl text-center border border-gray-700 rounded-xl pt-8 pb-10 px-6 bg-[#12101a]/50 mx-auto mt-2">
            {/* Box header for visual consistency with other sections */}
            <div className="w-full bg-gradient-to-r from-[#1e1a2e] to-[#19172d] p-6 rounded-t-xl border border-[#2e2a3d] mb-6">
              <h2 className="text-xl font-semibold text-white mb-1">Key Questions</h2>
              <p className="text-gray-400 text-sm">These questions will help us best auto-fill your applications</p>
              <p className="text-xs italic text-red-500 mt-2">* marks required fields</p>
            </div>
            
            <div className="w-full">
              <form className="space-y-5 mx-auto">
                {questions.map((question) => (
                  <div key={question.id} className="mb-4 text-left">
                    <label
                      htmlFor={question.id}
                      className="block text-sm font-medium text-white mb-1"
                    >
                      {question.text}
                      {question.required && (
                        <span className="ml-1 text-red-500">*</span>
                      )}
                    </label>
                    <div className="relative">
                      <select
                        id={question.id}
                        value={questionnaireAnswers[question.id] || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newAnswers = {
                            ...questionnaireAnswers,
                            [question.id]: value,
                          };
                          setQuestionnaireAnswers(newAnswers);
                          localStorage.setItem('questionnaireAnswers', JSON.stringify(newAnswers));
                          if (questionnaireErrors[question.id]) {
                            setQuestionnaireErrors((prev) => ({
                              ...prev,
                              [question.id]: false,
                            }));
                          }
                        }}
                        className={`mt-1 block w-full rounded-lg border ${
                          questionnaireErrors[question.id] ? 'border-red-500' : 'border-gray-600'
                        } bg-[#1a1625] pl-3 pr-8 py-2.5 text-white shadow-sm transition-colors hover:border-purple-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm appearance-none`}
                      >
                        <option value="">Select</option>
                        {question.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <FaChevronDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    {questionnaireErrors[question.id] && (
                      <p className="mt-1 text-sm text-red-500">
                        This field is required
                      </p>
                    )}
                  </div>
                ))}
              </form>
              
              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between items-center w-full">
                <button
                  onClick={() => {
                    setShowQuestionnaire(false);
                    setShowLocation(true);
                  }}
                  className="w-24 px-3 py-2 text-sm border border-gray-600 rounded-lg text-white hover:bg-gray-800 transition-colors flex items-center justify-center"
                >
                  <FaArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={() => {
                    // Validate required questions
                    const newErrors: Record<string, boolean> = {};
                    let hasErrors = false;
                    
                    questions.forEach((question) => {
                      if (question.required && (!questionnaireAnswers[question.id] || questionnaireAnswers[question.id] === '')) {
                        newErrors[question.id] = true;
                        hasErrors = true;
                      }
                    });
                    
                    if (hasErrors) {
                      setQuestionnaireErrors(newErrors);
                      return;
                    }
                    
                    // Save answers to localStorage
                    try {
                      localStorage.setItem('questionnaireAnswers', JSON.stringify(questionnaireAnswers));
                    } catch (error) {
                      console.error('Error saving questionnaire answers:', error);
                    }
                    
                    // Navigate to the next section (this would be the final section in the flow)
                    setShowQuestionnaire(false);
                    // You can redirect to dashboard or show a completion screen here
                    // For now, we'll just go back to the beginning
                    setShowResumeUpload(true);
                  }}
                  className="w-24 px-3 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                >
                  Finish
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <style jsx global>{`
        .sidebar {
          width: 280px;
          height: 100vh;
          background: linear-gradient(to bottom, #141019, #7a64c2);
          color: white;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 2px 0 15px rgba(0, 0, 0, 0.2);
          position: fixed;
          top: 0;
          left: 0;
          z-index: 50;
          transform: translateX(-100%);
          transition: transform 0.3s ease-in-out;
        }
        .sidebar.open {
          transform: translateX(0);
        }
        @media (min-width: 1024px) {
          .sidebar {
            position: static;
            transform: none;
            box-shadow: none;
          }
          main {
            margin-left: 0;
          }
        }
        .top-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
          overflow-y: auto;
          max-height: calc(100vh - 180px);
          padding-right: 4px;
        }
        .top-section::-webkit-scrollbar {
          width: 6px;
        }
        .top-section::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .top-section::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .top-section::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        .top-section {
          -ms-overflow-style: auto;
          scrollbar-width: thin;
        }
        .menu-group {
          margin-top: 10px;
        }
        .menu-label {
          font-size: 13px;
          text-transform: uppercase;
          margin: 18px 0 8px;
          color: #cfcfcf;
        }
        .menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          color: white;
          text-decoration: none;
          transition: all 0.15s ease;
          margin: 2px 0;
        }
        .menu-item:hover,
        .menu-item.active {
          background: rgba(255, 255, 255, 0.08);
          transform: translateX(2px);
        }
        .menu-item .icon {
          min-width: 20px;
          text-align: center;
          font-size: 16px;
        }
        .bottom-card {
          background: black;
          border-radius: 20px;
          padding: 20px;
          text-align: center;
          color: white;
        }
        .bottom-card p {
          font-size: 14px;
          margin: 8px 0;
          color: #cfcfcf;
        }
        .bottom-card button {
          margin-top: 12px;
          padding: 10px 18px;
          background: #4b32d4;
          border: none;
          color: white;
          font-size: 14px;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          width: 100%;
        }
        .bottom-card button:hover {
          background: #3a27ad;
        }
      `}</style>
      
      {/* Custom styles for range input */}
      <style jsx global>{`
        input[type='range'] {
          -webkit-appearance: none;
          height: 8px;
          width: 100%;
          border-radius: 4px;
          background: #4B5563;
          outline: none;
          padding: 0;
          margin: 10px 0;
        }

        /* Webkit (Chrome, Safari, etc) */
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: #8b5cf6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(139, 92, 246, 0.5);
          margin-top: -8px;
          position: relative;
          z-index: 2;
        }

        /* Firefox */
        input[type='range']::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #8b5cf6;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(139, 92, 246, 0.5);
          position: relative;
          z-index: 2;
        }

        input[type='range']:focus {
          outline: none;
        }

        /* For the filled portion of the track */
        input[type='range']::-webkit-slider-runnable-track {
          width: 100%;
          height: 8px;
          cursor: pointer;
          background: linear-gradient(to right, #8b5cf6 0%, #8b5cf6 var(--progress, 0%), #4B5563 var(--progress, 0%), #4B5563 100%);
          border-radius: 4px;
        }

        input[type='range']::-moz-range-track {
          width: 100%;
          height: 8px;
          cursor: pointer;
          background: #4B5563;
          border-radius: 4px;
        }

        input[type='range']::-moz-range-progress {
          background: #8b5cf6;
          border-radius: 4px;
          height: 8px;
          width: var(--progress, 0%);
        }
      `}</style>
    </div>
  );
}
