'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaPencilAlt, FaChevronDown, FaEdit, FaCheck, FaTimes, FaChevronUp } from 'react-icons/fa';
import DashboardLayout from '../../../../components/DashboardLayout';
import ResumeNameDropdown from '../../../../components/ResumeBuilder/ResumeNameDropdown';
import ResumeNavigation from '../../../../components/ResumeBuilder/ResumeNavigation';
import ScoreIndicator from '../../../../components/ScoreIndicator';
import ResumeScoreInsights from '../../../../components/ResumeScoreInsights';

interface WorkExperience {
  id?: string;
  // Standard fields
  role: string;
  employer: string;
  startDate: string;
  endDate: string | null;
  location: string;
  bullets: string[];
  isCurrent?: boolean;
  // Firestore fields
  'Job Title'?: string;
  Company?: string;
  'Start/End Year'?: string;
  Location?: string;
  Description?: string[];
}

interface ExperienceState {
  experiences: WorkExperience[];
  activeExperience: WorkExperience | null;
  isLoading: boolean;
  isEditing: boolean;
  bulletCount: number;
  showMobileForm: boolean; // Track mobile form visibility
  experienceScore: number; // Score for work experience quality
  showScoreInsights: boolean; // Whether to show the score insights modal
  resumeName: string; // Name of the resume
}

// TypingText component for typing animation
import React from 'react';

type TypingTextProps = { text: string; speed?: number };
function TypingText({ text, speed = 100 }: TypingTextProps) {
  const [displayed, setDisplayed] = React.useState('');
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (index < text.length) {
      timeout = setTimeout(() => {
        setDisplayed(text.slice(0, index + 1));
        setIndex(index + 1);
      }, speed);
    } else {
      // Pause, then restart
      timeout = setTimeout(() => {
        setDisplayed('');
        setIndex(0);
      }, 1200);
    }
    return () => clearTimeout(timeout);
  }, [index, text, speed]);

  // Only show cursor while typing
  const isTyping = index < text.length;
  return (
    <span>
      {displayed}
      {isTyping && (
        <span
          className="animate-pulse"
          style={{ fontWeight: 400, color: '#a3a3a3', fontSize: '1em', marginLeft: '-2px', lineHeight: '1' }}
        >
          |
        </span>
      )}
    </span>
  );
}



export default function ExperiencePage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params.resumeId as string;

  // Loading state for BulletGen button
  const [loadingBullets, setLoadingBullets] = useState(false);
  
  const [state, setState] = useState<ExperienceState>({
    experiences: [],
    activeExperience: null,
    isLoading: true,
    isEditing: false,
    bulletCount: 3,
    showMobileForm: false, // Hide form on mobile by default
    experienceScore: 39, // Default score, can be calculated based on experiences
    showScoreInsights: false,
    resumeName: 'Resume'
  });
  
  // Create a new blank experience
  const createNewExperience = (): WorkExperience => ({
    id: `exp-${Math.random().toString(36).substr(2, 9)}`, // Add a unique ID
    role: '',
    employer: '',
    startDate: '',
    endDate: null,
    location: '',
    bullets: [],
    isCurrent: false
  });
  
  // Fetch all experiences from Firestore
  useEffect(() => {
    async function fetchExperiences() {
      try {
        console.log('DEBUG: Fetching resume data for resumeId:', resumeId);
        setState(prev => ({ ...prev, isLoading: true }));
        
        const response = await fetch(`/api/resume/experience?resumeId=${resumeId}&t=${Date.now()}`);
        const parsedData = await response.json();
        console.log('DEBUG: Received parsed resume data:', parsedData);
        console.log('DEBUG: Keys in parsedData:', Object.keys(parsedData));
        
        let workExperiences: WorkExperience[] = [];
        
        // Robustly find the experience array from the parsed data
        const rawExperiences = parsedData['Work Experience'] || parsedData.work_experience || [];

        if (Array.isArray(rawExperiences)) {
          workExperiences = rawExperiences.map((exp: any) => {
            console.log('DEBUG: Processing experience:', exp);
            
            const bullets = Array.isArray(exp.Description) ? exp.Description : 
                          Array.isArray(exp.bulletPoints) ? exp.bulletPoints : 
                          Array.isArray(exp.bullets) ? exp.bullets : [];
            
            let startDate = '';
            let endDate = null;
            let isCurrent = false;
            
            if (exp['Start/End Year']) {
              const dateStr = exp['Start/End Year'];
              const parts = dateStr.split(/[-–]/);

              if (dateStr.toLowerCase().includes('present')) {
                isCurrent = true;
                startDate = parts[0].trim();
                endDate = null;
              } else if (parts.length > 1) {
                startDate = parts[0].trim();
                endDate = parts[1].trim();
              } else {
                startDate = dateStr.trim();
              }
            } else {
              startDate = exp.startDate || '';
              endDate = exp.endDate || null;
              isCurrent = exp.isCurrent || false;
            }
            
            return {
              id: exp.id || `exp-${Math.random().toString(36).substr(2, 9)}`,
              role: exp['Job Title'] || exp.role || '',
              employer: exp.Company || exp.company || exp.employer || '',
              startDate: startDate,
              endDate: endDate,
              location: exp.Location || exp.location || '',
              bullets: bullets,
              isCurrent: isCurrent
            };
          });
        }
        
        console.log('DEBUG: Mapped experiences:', workExperiences);
        setState(prev => ({
          ...prev,
          experiences: workExperiences,
          // Set activeExperience to the first one if available, otherwise null.
          activeExperience: workExperiences.length > 0 ? workExperiences[0] : null,
          isLoading: false,
          // Only enter editing mode if there's an experience to edit.
          isEditing: workExperiences.length > 0
        }));
      } catch (error) {
        console.error('Error fetching experiences:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }
    
    fetchExperiences();
  }, [resumeId]);
  
  // Handle selecting an experience
  const handleSelectExperience = (experience: WorkExperience) => {
    setState(prev => ({
      ...prev,
      activeExperience: experience,
      isEditing: true,
      showMobileForm: true // Show form on mobile when experience is selected
    }));
  };
  
  // Handle creating a new experience
  const handleCreateExperience = () => {
    const newExperience = createNewExperience();
    setState(prev => ({
      ...prev,
      activeExperience: newExperience,
      isEditing: true,
      showMobileForm: true // Show form when creating new experience
    }));
  };
  
  // Handle updating experience fields
  const handleUpdateField = (field: keyof WorkExperience, value: string | string[] | boolean | null) => {
    if (!state.activeExperience) return;
    
    setState(prev => ({
      ...prev,
      activeExperience: {
        ...prev.activeExperience!,
        [field]: value
      }
    }));
  };
  
  // Handle adding a bullet point
  const handleAddBullet = () => {
    if (!state.activeExperience) return;
    
    setState(prev => ({
      ...prev,
      activeExperience: {
        ...prev.activeExperience!,
        bullets: [...prev.activeExperience!.bullets, '']
      },
      bulletCount: prev.bulletCount + 1
    }));
  };
  
  // Handle updating a bullet point
  const handleUpdateBullet = (index: number, value: string) => {
    if (!state.activeExperience) return;
    
    const updatedBullets = [...state.activeExperience.bullets];
    updatedBullets[index] = value;
    
    setState(prev => ({
      ...prev,
      activeExperience: {
        ...prev.activeExperience!,
        bullets: updatedBullets
      }
    }));
  };
  
  // Handle removing a bullet point
  const handleRemoveBullet = (index: number) => {
    if (!state.activeExperience) return;
    
    const updatedBullets = state.activeExperience.bullets.filter((_, i: number) => i !== index);
    
    setState(prev => ({
      ...prev,
      activeExperience: {
        ...prev.activeExperience!,
        bullets: updatedBullets
      },
      bulletCount: prev.bulletCount - 1
    }));
  };
  
  // Handle toggling current job status
  const handleToggleCurrentJob = (isCurrent: boolean) => {
    if (!state.activeExperience) return;
    
    setState(prev => ({
      ...prev,
      activeExperience: {
        ...prev.activeExperience!,
        isCurrent,
        endDate: isCurrent ? null : prev.activeExperience?.endDate || ''
      }
    }));
  };
  
  // Handle saving the experience
  const handleSaveExperience = async () => {
    if (!state.activeExperience) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Create a copy of the experiences to avoid direct mutation
      let updatedExperiences = [...state.experiences];
      
      // Find the index of the experience being edited
      const index = updatedExperiences.findIndex(exp => exp.id === state.activeExperience!.id);

      if (index > -1) {
        // If found, update it
        updatedExperiences[index] = state.activeExperience;
      } else {
        // If not found (it's a new one), add it to the array
        updatedExperiences.push(state.activeExperience);
      }
      
      // Map the data to the format expected by Firestore
      const experiencesToSave = updatedExperiences.map(exp => ({
        'id': exp.id || `exp-${Math.random().toString(36).substr(2, 9)}`,
        'Job Title': exp.role,
        'Company': exp.employer,
        'Location': exp.location,
        'Start/End Year': exp.isCurrent ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate || ''}`,
        'Description': exp.bullets,
      }));

      const response = await fetch(`/api/resume/experience?resumeId=${resumeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ experiences: experiencesToSave }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save experience');
      }

      // On successful save, update the main state and exit editing mode
      setState(prev => ({
        ...prev,
        experiences: updatedExperiences,
        isEditing: false,
        isLoading: false,
      }));

    } catch (error) {
      console.error('Error saving experience:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };
  
  // Handle deleting an experience
  const handleDeleteExperience = async () => {
    if (!state.activeExperience || !state.activeExperience.id) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Filter out the experience to be deleted
      const updatedExperiences = state.experiences.filter(exp => exp.id !== state.activeExperience?.id);

      // Convert to Firestore format
      const experiencesToSave = updatedExperiences.map(exp => ({
        id: exp.id,
        'Job Title': exp.role,
        Company: exp.employer,
        'Start/End Year': exp.isCurrent ? 
          `${exp.startDate}- Present` : 
          `${exp.startDate}- ${exp.endDate}`,
        Location: exp.location,
        Description: exp.bullets
      }));

      // Call the update API with the modified list
      const response = await fetch('/api/resume/update-experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resumeId,
          'Work Experience': experiencesToSave
        })
      });

      const data = await response.json();

      if (data.success) {
        setState(prev => ({
          ...prev,
          experiences: updatedExperiences,
          activeExperience: updatedExperiences.length > 0 ? updatedExperiences[0] : createNewExperience(),
          isLoading: false,
          isEditing: updatedExperiences.length > 0
        }));
      } else {
        console.error('Failed to delete experience:', data.error);
        // Optionally, revert state if API call fails
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <DashboardLayout>
      <div className="overflow-y-auto pt-4 lg:pt-0 bg-[#0a192f] min-h-screen w-full">
        <div className="max-w-7xl mx-auto px-1 sm:p-4 md:p-8 lg:p-10">
          {/* Resume Name Box with Dropdown */}
          <ResumeNameDropdown resumeId={resumeId} currentSection="experience" />

          {/* Navigation Buttons */}
          <ResumeNavigation resumeId={resumeId} currentSection="experience" />
          
          {/* Experience Score Indicator */}
          <div className="border border-[#1e2d3d] rounded-lg bg-[#0d1b2a] px-4 py-4 mt-2 mb-4 w-full shadow-lg">
            <div 
              className="cursor-pointer" 
              onClick={() => setState(prev => ({ ...prev, showScoreInsights: true }))}
            >
              <ScoreIndicator 
                score={state.experienceScore} 
                label="Your Experience" 
                description={state.experienceScore < 50 ? "Needs improvement" : "Looking good!"}
              />
            </div>
          </div>
          
          {/* Score Insights Modal */}
          <ResumeScoreInsights 
            isOpen={state.showScoreInsights}
            onClose={() => setState(prev => ({ ...prev, showScoreInsights: false }))}
            resumeName={`${state.resumeName} - Bioinformatician`}
            overallScore={state.experienceScore}
            categories={[
              { name: 'Content', score: 43, color: '#FFC107' },
              { name: 'Format', score: 15, color: '#f44336' },
              { name: 'Optimization', score: 99, color: '#4caf50' },
              { name: 'Best Practices', score: 54, color: '#FFC107' },
              { name: 'Application Ready', score: 39, color: '#FFC107' }
            ]}
            issues={[
              {
                type: 'warning',
                message: 'Your resume has 3 experiences with weak bullet points',
                detail: 'Weak verbs will fail to explain your experience with meaningful language.',
                relatedExperiences: state.experiences.slice(0, 3).map(exp => 
                  `${exp.role || exp['Job Title'] || 'Untitled Role'}, ${exp.employer || exp.Company || 'No Company'}`
                )
              },
              {
                type: 'error',
                message: 'Your resume has 2 experiences with an incorrect number of bullet points.',
                detail: 'It\'s critical to include between 3-6 bullet points.',
                relatedExperiences: state.experiences.slice(0, 2).map(exp => 
                  `${exp.role || exp['Job Title'] || 'Untitled Role'}, ${exp.employer || exp.Company || 'No Company'}`
                )
              },
              {
                type: 'warning',
                message: 'Your resume has 5 experiences without measured responsibilities or achievements',
                detail: 'It\'s critical to give context to the size and scope of the work that you did.',
                relatedExperiences: state.experiences.map(exp => 
                  `${exp.role || exp['Job Title'] || 'Untitled Role'}, ${exp.employer || exp.Company || 'No Company'}`
                ).slice(0, 5)
              }
            ]}
          />

          {/* Main Experience Content - Two-part layout */}
          <div className="border border-[#1e2d3d] rounded-lg bg-[#0d1b2a] px-1 sm:px-4 md:px-6 py-4 sm:py-6 mt-1 sm:mt-2 w-full max-w-full shadow-lg min-h-[400px]">
            {state.isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563eb]" />
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-4">
                {/* Left Pane - Experience List */}
                <div className="w-full md:w-1/3 border-r border-[#1e2d3d] px-2 sm:px-0 md:pr-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-white">Work Experience</h2>
                    <button 
                      onClick={handleCreateExperience}
                      className="bg-[#2563eb] hover:bg-[#2563eb]/90 text-white p-1 rounded-md transition-colors"
                    >
                      <FaPlus size={16} />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {state.experiences.length === 0 ? (
                      <p className="text-gray-400 text-sm">No work experiences yet. Click the + button to add your first experience.</p>
                    ) : (
                      state.experiences.map((exp) => (
                        <div 
                          key={exp.id} 
                          className={`p-3 rounded-md cursor-pointer transition-colors border border-gray-700 ${state.activeExperience?.id === exp.id ? 'bg-[#0d1b2a] border-l-4 border-l-[#2563eb]' : 'bg-[#0d1b2a] hover:bg-[#0d1b2a]'}`}
                          onClick={() => handleSelectExperience(exp)}
                        >
                          <h3 className="text-xl text-white font-normal">{exp.role || exp['Job Title'] || 'Untitled Role'}</h3>
                          <p className="text-base text-gray-400 mt-1">{exp.employer || exp.Company || 'No Company'}</p>
                          <p className="text-gray-500 mt-1 text-base">{exp['Start/End Year'] || `${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ' - Present'}`}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                {/* Right Column - Experience Form */}
                <div className={`w-full md:w-2/3 px-2 sm:px-0 md:pl-4 ${state.showMobileForm ? 'block' : 'hidden md:block'}`}>
                  {state.isEditing && state.activeExperience ? (
                    <div>
                      {/* Form Header */}
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">
                          {state.activeExperience.id && (state.activeExperience.role || state.activeExperience['Job Title']) ? 'Edit Experience' : 'Add New Experience'}
                        </h2>
                        {state.activeExperience.id && (
                          <button
                            onClick={handleDeleteExperience}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete Experience"
                          >
                            <FaTrash size={16} />
                          </button>
                        )}
                      </div>
                      
                      {/* Form Fields */}
                      <div className="space-y-4 mb-6">
                        {/* Role Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">
                            WHAT WAS YOUR ROLE {state.activeExperience.employer || state.activeExperience.Company ? `AT ${(state.activeExperience.employer || state.activeExperience.Company)?.toUpperCase()}` : ''}? *
                          </label>
                          <input 
                            type="text" 
                            className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]" 
                            placeholder="Job Title"
                            value={state.activeExperience.role || state.activeExperience['Job Title'] || ''}
                            onChange={(e) => {
                              handleUpdateField('role', e.target.value);
                              handleUpdateField('Job Title', e.target.value);
                            }}
                          />
                        </div>
                        
                        {/* Company Field */}
                        <div>
                          <label className="block text-xs text-gray-300 mb-1 uppercase">FOR WHICH COMPANY DID YOU WORK? *</label>
                          <input 
                            type="text" 
                            className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]" 
                            placeholder="Company Name"
                            value={state.activeExperience.employer || state.activeExperience.Company || ''}
                            onChange={(e) => {
                              handleUpdateField('employer', e.target.value);
                              handleUpdateField('Company', e.target.value);
                            }}
                          />
                        </div>
                        
                        {/* Date and Location Row */}
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Start Date */}
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                              START DATE
                            </label>
                            <input 
                              type="text" 
                              className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]" 
                              placeholder="Sep 2020"
                              value={state.activeExperience.startDate || (state.activeExperience['Start/End Year'] ? state.activeExperience['Start/End Year'].split(/[-–]/)[0].trim() : '')}
                              onChange={(e) => handleUpdateField('startDate', e.target.value)}
                            />
                          </div>
                          
                          {/* End Date */}
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <label className="block text-sm font-medium text-gray-400 mb-1">END DATE</label>
                              <div className="flex items-center">
                                <input 
                                  type="checkbox" 
                                  id="currentJob" 
                                  className="mr-2"
                                  checked={state.activeExperience.isCurrent || (state.activeExperience['Start/End Year'] ? state.activeExperience['Start/End Year'].toLowerCase().includes('present') : false)}
                                  onChange={(e) => handleToggleCurrentJob(e.target.checked)}
                                />
                                <label htmlFor="currentJob" className="text-xs text-gray-400">Current</label>
                              </div>
                            </div>
                            <input 
                              type="text" 
                              className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]" 
                              placeholder="Present"
                              value={state.activeExperience.isCurrent ? 'Present' : (state.activeExperience.endDate || (state.activeExperience['Start/End Year'] && !state.activeExperience['Start/End Year'].toLowerCase().includes('present') ? state.activeExperience['Start/End Year'].split(/[-–]/)[1]?.trim() : '') || '')}
                              onChange={(e) => handleUpdateField('endDate', e.target.value)}
                              disabled={state.activeExperience.isCurrent}
                            />
                          </div>
                          
                          {/* Location */}
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                              LOCATION
                            </label>
                            <input 
                              type="text" 
                              className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]" 
                              placeholder="New York, NY"
                              value={state.activeExperience.location || state.activeExperience.Location || ''}
                              onChange={(e) => {
                                handleUpdateField('location', e.target.value);
                                handleUpdateField('Location', e.target.value);
                              }}
                            />
                          </div>
                        </div>
                        
                        {/* Bullet Points */}
                        <div className="mt-4">
                          <label className="block text-xs text-gray-300 mb-1 uppercase">
                            WHAT DID YOU DO AT THIS COMPANY?
                          </label>
                          <label className="block text-xs text-gray-300 mb-1 uppercase">BULLET POINTS *</label>
                          <textarea
                            value={(state.activeExperience.bullets || state.activeExperience.Description || []).map(b => {
                              // Ensure each line starts with a bullet point
                              const text = b.replace(/^[\u2022\-\*]\s*/, '').trim();
                              return text ? `•    ${text}` : '';
                            }).filter(Boolean).join('\n')}
                            onChange={(e) => {
                              const cursorPos = e.target.selectionStart;
                              
                              // Split into lines
                              const lines = e.target.value.split('\n');
                              
                              // Process each line
                              const newBullets = lines.map(line => {
                                // Remove existing bullet points and trim
                                return line.replace(/^[\u2022\-\*]\s*/, '').trim();
                              }).filter(line => line.length > 0); // Remove empty lines
                              
                              handleUpdateField('bullets', newBullets);
                              handleUpdateField('Description', newBullets);
                              
                              // Restore cursor position
                              requestAnimationFrame(() => {
                                if (e.target) {
                                  e.target.selectionStart = cursorPos;
                                  e.target.selectionEnd = cursorPos;
                                }
                              });
                            }}
                            className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 font-medium text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb] h-48 resize-y"
                            placeholder="Enter each bullet point on a new line..."
                          />
                        </div>
                      </div>
                      
                      {/* Save Button */}
                      <div className="col-span-full flex justify-between items-center gap-4 mt-4">

                        <button
                          className={`flex items-center gap-2 bg-gradient-to-r from-[#2563eb] to-[#0d1b2a] text-white text-base font-semibold rounded-full border border-[#2563eb] px-6 h-10 shadow-sm hover:from-[#1d4ed8] hover:to-[#0d1b2a] transition-colors duration-150 whitespace-nowrap ${loadingBullets ? 'animate-pulse ring-2 ring-blue-400 ring-offset-2' : ''}`}
                          style={{ width: '200px', justifyContent: 'center' }}
                          type="button"
                          onClick={async () => {
                            if (!state.activeExperience) return;
                            setLoadingBullets(true);
                            try {
                              const job_title = state.activeExperience.role || state.activeExperience['Job Title'] || '';
                              const company = state.activeExperience.employer || state.activeExperience.Company || '';
                              const description = Array.isArray(state.activeExperience.Description) ? state.activeExperience.Description.join(' ') : '';
                              const existing_bullets = state.activeExperience.bullets || state.activeExperience.Description || [];
                              
                              console.log('Sending bullet generation request:', {
                                job_title,
                                company,
                                description: description.slice(0, 100) + '...',  // Log truncated description
                                existing_bullets_count: existing_bullets.length
                              });
                              
                              const res = await fetch('/api/generate-bullets', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ job_title, company, description, existing_bullets }),
                              });
                              
                              const data = await res.json();
                              console.log('Received bullet generation response:', data);
                              
                              if (!res.ok) {
                                console.error('API error:', data);
                                throw new Error(data.error || `Failed to generate bullets: ${res.status}`);
                              }
                              
                              if (!data.bullets || !Array.isArray(data.bullets)) {
                                console.error('Invalid response format:', data);
                                throw new Error('Invalid response format from bullet generation');
                              }
                              
                              if (data.bullets.length === 0) {
                                console.error('No bullets in response:', data);
                                throw new Error('No bullets were generated. Please try again.');
                              }
                              
                              // Remove any existing bullet points from the text
                              const cleanBullets: string[] = data.bullets.map((bullet: string) => bullet.replace(/^[•\-\*]\s*/, '').trim());
                              
                              // Live typing animation for each new bullet
                              for (const bullet of cleanBullets) {
                                await new Promise((resolve) => {
                                  let i = 0;
                                  const interval = setInterval(() => {
                                    i++;
                                    // Show typing animation by updating only the new bullet being typed
                                    const inProgressBullet = bullet.slice(0, i);
                                    const displayBullets = [
                                      ...existing_bullets,
                                      `• ${inProgressBullet}` // Add bullet point to in-progress text
                                    ];
                                    
                                    handleUpdateField('bullets', displayBullets);
                                    handleUpdateField('Description', displayBullets);
                                    
                                    if (i >= bullet.length) {
                                      clearInterval(interval);
                                      // Add the completed bullet
                                      const finalBullets = [...existing_bullets, `• ${bullet}`];
                                      handleUpdateField('bullets', finalBullets);
                                      handleUpdateField('Description', finalBullets);
                                      setTimeout(resolve, 350); // Pause before next bullet
                                    }
                                  }, 35); // Slower typing speed for better visibility
                                });
                                existing_bullets.push(bullet);
                              }
                            }
                            catch (error) {
                              console.error(error);
                            } finally {
                              setLoadingBullets(false);
                            }
                          }}
                          disabled={loadingBullets}
                        >
                          {loadingBullets ? (
                            <span className="animate-pulse text-gray-300">Generating...</span>
                          ) : (
                            <TypingText text="Talexus BulletGen" speed={90} />
                          )}
                        </button>
                        <button
                          onClick={handleSaveExperience}
                          className="border border-[#1e2d3d] text-white text-base font-bold rounded-lg px-7 py-2 transition-colors duration-150 hover:bg-[#0d1b2a] hover:border-[#2563eb]"
                        >
                          SAVE
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="hidden md:flex justify-center items-center h-64 text-gray-400">
                      Select an experience or create a new one to get started.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
