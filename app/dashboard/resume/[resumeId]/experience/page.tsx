'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaPencilAlt, FaChevronDown, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import DashboardLayout from '../../../../components/DashboardLayout';
import ResumeNameDropdown from '../../../../components/ResumeBuilder/ResumeNameDropdown';
import ResumeNavigation from '../../../../components/ResumeBuilder/ResumeNavigation';

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
}

export default function ExperiencePage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params.resumeId as string;
  
  const [state, setState] = useState<ExperienceState>({
    experiences: [],
    activeExperience: null,
    isLoading: true,
    isEditing: false,
    bulletCount: 0
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
          activeExperience: workExperiences.length > 0 ? workExperiences[0] : createNewExperience(),
          isLoading: false,
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
      isEditing: true
    }));
  };
  
  // Handle creating a new experience
  const handleCreateExperience = () => {
    const newExperience = createNewExperience();
    setState(prev => ({
      ...prev,
      activeExperience: newExperience,
      isEditing: true
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
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Format the experience data for the API
      // Use the same format as seen in the Firestore data
      const experienceData = {
        id: state.activeExperience.id,
        'Job Title': state.activeExperience.role,
        Company: state.activeExperience.employer,
        'Start/End Year': state.activeExperience.isCurrent ? 
          `${state.activeExperience.startDate}- Present` : 
          `${state.activeExperience.startDate}- ${state.activeExperience.endDate}`,
        Location: state.activeExperience.location,
        Description: state.activeExperience.bullets
      };
      
      console.log('DEBUG: Saving experience data:', experienceData);
      
      // Get current experiences array and convert to Firestore format
      const currentExperiences = state.experiences.map(exp => ({
        id: exp.id,
        'Job Title': exp.role,
        Company: exp.employer,
        'Start/End Year': exp.isCurrent ? 
          `${exp.startDate}- Present` : 
          `${exp.startDate}- ${exp.endDate}`,
        Location: exp.location,
        Description: exp.bullets
      }));
      
      // Add or update the current experience
      const existingIndex = currentExperiences.findIndex(exp => exp.id === state.activeExperience?.id);
      if (existingIndex >= 0) {
        currentExperiences[existingIndex] = experienceData;
      } else {
        currentExperiences.push(experienceData);
      }
      
      // Save to Firestore
      const response = await fetch('/api/resume/update-experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resumeId,
          'Work Experience': currentExperiences
        })
      });
      
      const data = await response.json();
      console.log('DEBUG: Save response:', data);
      
      if (data.success) {
        // Map the saved experience back to our internal format
        const savedExperience = {
          id: experienceData.id,
          role: experienceData['Job Title'],
          employer: experienceData.Company,
          startDate: experienceData['Start/End Year'].split('-')[0].trim(),
          endDate: experienceData['Start/End Year'].includes('Present') ? null : experienceData['Start/End Year'].split('-')[1].trim(),
          location: experienceData.Location,
          bullets: experienceData.Description,
          isCurrent: experienceData['Start/End Year'].includes('Present')
        };
        
        // Update state with the saved experience
        setState(prev => {
          const updatedExperiences = [...prev.experiences];
          const idx = updatedExperiences.findIndex(exp => exp.id === savedExperience.id);
          
          if (idx >= 0) {
            updatedExperiences[idx] = savedExperience;
          } else {
            updatedExperiences.push(savedExperience);
          }
          
          return {
            ...prev,
            experiences: updatedExperiences,
            activeExperience: savedExperience,
            isLoading: false,
            isEditing: true
          };
        });
      } else {
        console.error('Failed to save experience:', data.error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
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
      <div className="overflow-y-auto pt-4 lg:pt-0">
        <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-8 lg:p-10">
          {/* Resume Name Box with Dropdown */}
          <ResumeNameDropdown resumeId={resumeId} currentSection="experience" />

          {/* Navigation Buttons */}
          <ResumeNavigation resumeId={resumeId} currentSection="experience" />

          {/* Main Experience Content - Two-part layout */}
          <div className="border border-[#23263a] rounded-lg bg-[#0e0c12] px-3 sm:px-4 md:px-6 py-4 sm:py-6 mt-1 sm:mt-2 w-full max-w-full shadow-lg min-h-[400px]">
            {state.isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-4">
                {/* Left Pane - Experience List */}
                <div className="w-full md:w-1/3 border-r border-[#23263a] pr-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-white">Work Experience</h2>
                    <button 
                      onClick={handleCreateExperience}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded-md transition-colors"
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
                          className={`p-3 rounded-md cursor-pointer transition-colors ${state.activeExperience?.id === exp.id ? 'bg-[#23263a] border-l-4 border-blue-500' : 'bg-[#171923] hover:bg-[#1e2130]'}`}
                          onClick={() => handleSelectExperience(exp)}
                        >
                          <h3 className="font-medium text-white">{exp.role || exp['Job Title'] || 'Untitled Role'}</h3>
                          <p className="text-sm text-gray-400">{exp.employer || exp.Company || 'No Company'}</p>
                          <p className="text-xs text-gray-500 mt-1">{exp['Start/End Year'] || `${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ' - Present'}`}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                {/* Right Pane - Experience Form */}
                <div className="w-full md:w-2/3">
                  {state.activeExperience ? (
                    <div>
                      {/* Form Header */}
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">
                          {state.activeExperience.id ? 'Edit Experience' : 'Add New Experience'}
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
                            WHAT WAS YOUR ROLE {state.activeExperience.employer ? `AT ${state.activeExperience.employer.toUpperCase()}` : ''}? *
                          </label>
                          <input 
                            type="text" 
                            className="w-full bg-[#171923] border border-[#23263a] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]" 
                            placeholder="Job Title"
                            value={state.activeExperience['Job Title'] || state.activeExperience.role || ''}
                            onChange={(e) => {
                              handleUpdateField('role', e.target.value);
                              handleUpdateField('Job Title', e.target.value);
                            }}
                          />
                        </div>
                        
                        {/* Company Field */}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">FOR WHICH COMPANY DID YOU WORK? *</label>
                          <input 
                            type="text" 
                            className="w-full bg-[#171923] border border-[#23263a] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]" 
                            placeholder="Company Name"
                            value={state.activeExperience.Company || state.activeExperience.employer || ''}
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
                              className="w-full bg-[#171923] border border-[#23263a] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]" 
                              placeholder="Sep 2020"
                              value={state.activeExperience.startDate || (state.activeExperience['Start/End Year'] ? state.activeExperience['Start/End Year'].split('-')[0].trim() : '')}
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
                                  checked={state.activeExperience.isCurrent || (state.activeExperience['Start/End Year'] ? state.activeExperience['Start/End Year'].includes('Present') : false)}
                                  onChange={(e) => handleToggleCurrentJob(e.target.checked)}
                                />
                                <label htmlFor="currentJob" className="text-xs text-gray-400">Current</label>
                              </div>
                            </div>
                            <input 
                              type="text" 
                              className="w-full bg-[#171923] border border-[#23263a] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]" 
                              placeholder="Present"
                              value={
                                state.activeExperience.isCurrent ? 'Present' : 
                                state.activeExperience.endDate || 
                                (state.activeExperience['Start/End Year'] && !state.activeExperience['Start/End Year'].includes('Present') ? 
                                  state.activeExperience['Start/End Year'].split('-')[1].trim() : '')
                              }
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
                              className="w-full bg-[#171923] border border-[#23263a] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]" 
                              placeholder="New York, NY"
                              value={state.activeExperience.Location || state.activeExperience.location || ''}
                              onChange={(e) => {
                                handleUpdateField('location', e.target.value);
                                handleUpdateField('Location', e.target.value);
                              }}
                            />
                          </div>
                        </div>
                        
                        {/* Bullet Points */}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">
                            WHAT DID YOU DO AT {state.activeExperience.employer ? state.activeExperience.employer.toUpperCase() : 'THIS COMPANY'}?
                          </label>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">BULLET POINTS *</label>
                            <div className="space-y-2">
                              {state.activeExperience && (state.activeExperience.Description || state.activeExperience.bullets || []).map((bullet, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <input 
                                    type="text" 
                                    className="flex-1 bg-[#171923] border border-[#23263a] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]" 
                                    placeholder="Enter bullet point"
                                    value={bullet}
                                    onChange={(e) => {
                                      if (!state.activeExperience) return;
                                      handleUpdateBullet(index, e.target.value);
                                      // Also update Description field
                                      const updatedBullets = [...(state.activeExperience.Description || state.activeExperience.bullets || [])];
                                      updatedBullets[index] = e.target.value;
                                      handleUpdateField('Description', updatedBullets);
                                    }}
                                  />
                                  <button 
                                    type="button"
                                    className="text-red-500 hover:text-red-600"
                                    onClick={() => {
                                      if (!state.activeExperience) return;
                                      handleRemoveBullet(index);
                                      // Also update Description field
                                      const updatedBullets = [...(state.activeExperience.Description || state.activeExperience.bullets || [])];
                                      updatedBullets.splice(index, 1);
                                      handleUpdateField('Description', updatedBullets);
                                    }}
                                  >
                                    <FaTrash size={14} />
                                  </button>
                                </div>
                              ))}
                              <button 
                                type="button"
                                className="w-full bg-[#171923] border border-[#23263a] rounded-md px-3 py-2 text-gray-400 hover:text-white hover:border-[#2563eb] flex items-center justify-center gap-2"
                                onClick={() => {
                                  if (!state.activeExperience) return;
                                  handleAddBullet();
                                  // Also update Description field
                                  const updatedBullets = [...(state.activeExperience.Description || state.activeExperience.bullets || []), ''];
                                  handleUpdateField('Description', updatedBullets);
                                }}
                              >
                                <FaPlus size={14} /> Add Bullet Point
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Save Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={handleSaveExperience}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors"
                        >
                          SAVE EXPERIENCE
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-64 text-gray-400">
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
