'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { FaPlus, FaTrash, FaPencilAlt, FaChevronDown, FaEdit, FaCheck, FaTimes, FaChevronUp } from 'react-icons/fa';
import DashboardLayout from '../../../../components/DashboardLayout';
import ResumeNameDropdown from '../../../../components/ResumeBuilder/ResumeNameDropdown';
import ResumeNavigation from '../../../../components/ResumeBuilder/ResumeNavigation';
import ScoreIndicator from '../../../../components/ScoreIndicator';
import ResumeScoreInsightsModal from '../../../../components/ResumeBuilder/ResumeScoreInsightsModal';
import { ResumeAnalysisProvider, useResumeAnalysis } from '../../../../context/ResumeAnalysisContext';
import { useResumeName } from '../../../../hooks/useResumeName';

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
  suggestedBullets: string[]; // Store AI-generated bullets awaiting approval
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

// Wrapper component that provides the ResumeAnalysisContext
export default function ExperiencePage() {
  const params = useParams();
  const resumeId = params.resumeId as string;

  return (
    <ResumeAnalysisProvider resumeId={resumeId}>
      <ExperiencePageContent />
    </ResumeAnalysisProvider>
  );
}

// Inner component that consumes the ResumeAnalysisContext
function ExperiencePageContent() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params.resumeId as string;

  // Get resume name from the same hook used by the dropdown
  const { resumeName, isLoading: resumeNameLoading } = useResumeName(resumeId);

  // Debug resume name
  useEffect(() => {
    console.log('DEBUG: Resume name from hook:', resumeName);
    console.log('DEBUG: Resume ID:', resumeId);
  }, [resumeName, resumeId]);

  // Loading state for BulletGen button
  const [loadingBullets, setLoadingBullets] = useState(false);

  const [state, setState] = useState<ExperienceState>({
    experiences: [],
    activeExperience: null,
    isLoading: false,
    isEditing: false,
    bulletCount: 0,
    showMobileForm: false,
    experienceScore: 0,
    showScoreInsights: false,
    resumeName: '',
    suggestedBullets: [],
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
    isCurrent: false,
  });

  // Use the shared resume analysis context instead of local state
  const { analysis, isLoading: isAnalysisLoading, error: analysisError, fetchAnalysis } = useResumeAnalysis();

  // Update state when resume name changes
  useEffect(() => {
    if (resumeName) {
      setState(prev => ({
        ...prev,
        resumeName: resumeName,
      }));
    }
  }, [resumeName]);

  // Fetch specific resume details to get the name
  useEffect(() => {
    async function fetchResumeDetails() {
      try {
        const response = await fetch(`/api/resume/details?resumeId=${resumeId}&t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          console.log('DEBUG: Resume details:', data);
          if (data.name) {
            setState(prev => ({
              ...prev,
              resumeName: data.name,
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching resume details:', error);
      }
    }

    fetchResumeDetails();
    // Automatically fetch resume analysis when the page loads
    fetchAnalysis();
  }, [resumeId]);

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
              isCurrent: isCurrent,
            };
          });
        }

        console.log('DEBUG: Mapped experiences:', workExperiences);

        // Extract resume name from the API response
        const resumeName = parsedData.resumeName || parsedData.name || parsedData.title || parsedData.fileName || 'Resume';
        console.log('DEBUG: Resume name:', resumeName);

        setState(prev => ({
          ...prev,
          experiences: workExperiences,
          // Set activeExperience to the first one if available, otherwise null.
          activeExperience: workExperiences.length > 0 ? workExperiences[0] : null,
          isLoading: false,
          // Only enter editing mode if there's an experience to edit.
          isEditing: workExperiences.length > 0,
          // Set the resume name from the API response
          resumeName: resumeName,
        }));
      } catch (error) {
        console.error('Error fetching experiences:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }

    fetchExperiences();
    // Automatically fetch resume analysis when the page loads
    fetchAnalysis();
  }, [resumeId]);

  // Handle selecting an experience
  const handleSelectExperience = (experience: WorkExperience) => {
    setState(prev => ({
      ...prev,
      activeExperience: experience,
      isEditing: true,
      showMobileForm: true, // Show form on mobile when experience is selected
    }));
  };

  // Handle creating a new experience
  const handleCreateExperience = () => {
    const newExperience = createNewExperience();
    setState(prev => ({
      ...prev,
      activeExperience: newExperience,
      isEditing: true,
      showMobileForm: true, // Show form when creating new experience
    }));
  };

  // Handle updating experience fields
  const handleUpdateField = (field: keyof WorkExperience, value: string | string[] | boolean | null) => {
    if (!state.activeExperience) return;

    setState(prev => ({
      ...prev,
      activeExperience: {
        ...prev.activeExperience!,
        [field]: value,
      },
    }));
  };

  // Handle adding a bullet point
  const handleAddBullet = () => {
    if (!state.activeExperience) return;

    setState(prev => ({
      ...prev,
      activeExperience: {
        ...prev.activeExperience!,
        bullets: [...prev.activeExperience!.bullets, ''],
      },
      bulletCount: prev.bulletCount + 1,
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
        bullets: updatedBullets,
      },
    }));
  };

  // Handle accepting a suggested bullet
  const handleAcceptBullet = (index: number) => {
    if (!state.activeExperience || !state.suggestedBullets.length) return;

    const bulletToAccept = state.suggestedBullets[index];
    const updatedBullets = [...state.activeExperience.bullets, `• ${bulletToAccept}`];

    // Remove the accepted bullet from suggestions
    const updatedSuggestions = state.suggestedBullets.filter((_, i) => i !== index);

    setState(prev => ({
      ...prev,
      activeExperience: {
        ...prev.activeExperience!,
        bullets: updatedBullets,
      },
      suggestedBullets: updatedSuggestions,
    }));

    // Also update the Description field for compatibility
    handleUpdateField('Description', updatedBullets);
  };

  // Handle denying a suggested bullet
  const handleDenyBullet = (index: number) => {
    if (!state.suggestedBullets.length) return;

    // Simply remove the bullet from suggestions
    const updatedSuggestions = state.suggestedBullets.filter((_, i) => i !== index);

    setState(prev => ({
      ...prev,
      suggestedBullets: updatedSuggestions,
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
        bullets: updatedBullets,
      },
      bulletCount: prev.bulletCount - 1,
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
        endDate: isCurrent ? null : prev.activeExperience?.endDate || '',
      },
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

      // Refresh the score analysis after saving changes
      fetchAnalysis();
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
        Description: exp.bullets,
      }));

      // Call the update API with the modified list
      const response = await fetch('/api/resume/update-experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId,
          'Work Experience': experiencesToSave,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setState(prev => ({
          ...prev,
          experiences: updatedExperiences,
          activeExperience: updatedExperiences.length > 0 ? updatedExperiences[0] : createNewExperience(),
          isLoading: false,
          isEditing: updatedExperiences.length > 0,
        }));

        // Refresh the score analysis after deleting an experience
        fetchAnalysis();
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
              onClick={() => {
                setState(prev => ({ 
                  ...prev, 
                  showScoreInsights: true,
                }));
                fetchAnalysis();
              }}
            >
              <ScoreIndicator 
                score={analysis?.overallScore || 0} 
                size={50}
                strokeWidth={4}
                label="Talexus AI Score" 
                description={(analysis?.overallScore || 0) < 50 ? "Needs improvement" : "Looking good!"}
              />
            </div>
          </div>
          
          {/* Score Insights Modal */}
          <ResumeScoreInsightsModal
            open={state.showScoreInsights}
            onClose={() => setState(prev => ({ ...prev, showScoreInsights: false }))}
            isLoading={isAnalysisLoading}
            error={analysisError}
            scoreAnalysis={analysis}
            resumeName={resumeName || state.resumeName}
            experiences={state.experiences}
            handleSelectExperience={handleSelectExperience}
            resumeId={resumeId}
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
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition duration-200"
                    >
                      <FaPlus size={12} />
                      <span>Add</span>
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
                        
                        {/* Suggested Bullets - Only show if there are suggestions */}
                        {state.suggestedBullets.length > 0 && (
                          <div className="mt-6 border border-blue-500 bg-blue-900/20 rounded-md p-4">
                            <h3 className="text-lg font-semibold text-blue-300 mb-3">AI-Generated Bullet Points</h3>
                            <p className="text-sm text-gray-300 mb-4">Review each suggestion and click ✓ to accept or ✗ to reject.</p>
                            
                            <div className="space-y-3">
                              {state.suggestedBullets.map((bullet, index) => (
                                <div key={index} className="flex items-start gap-2 bg-[#0d1b2a] border border-gray-700 rounded-md p-3">
                                  <div className="flex-grow">
                                    <p className="text-white">• {bullet}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <button 
                                      onClick={() => handleAcceptBullet(index)}
                                      className="text-green-400 hover:text-green-300 transition-colors bg-green-900/20 hover:bg-green-800/30 w-8 h-8 rounded-full flex items-center justify-center"
                                      title="Accept bullet point"
                                    >
                                      <FaCheck size={14} />
                                    </button>
                                    <button 
                                      onClick={() => handleDenyBullet(index)}
                                      className="text-red-400 hover:text-red-300 transition-colors bg-red-900/20 hover:bg-red-800/30 w-8 h-8 rounded-full flex items-center justify-center"
                                      title="Reject bullet point"
                                    >
                                      <FaTimes size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Bullet Points */}
                        <div className="mt-6">
                          <label className="block text-xs text-gray-300 mb-1 uppercase">WHAT DID YOU DO AT THIS COMPANY? *</label>
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
                              
                              // Store the generated bullets for approval
                              setState(prev => ({
                                ...prev,
                                suggestedBullets: cleanBullets
                              }));
                              
                              // Show a toast notification
                              alert('AI has generated bullet points! Review and accept/deny them below.');
                              
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
