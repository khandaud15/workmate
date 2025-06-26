'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaPencilAlt, FaChevronDown, FaEdit, FaCheck, FaTimes, FaChevronUp, FaExternalLinkAlt } from 'react-icons/fa';
import React from 'react';

// TypingText component for typing animation
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
import DashboardLayout from '../../../../components/DashboardLayout';
import ResumeNameDropdown from '../../../../components/ResumeBuilder/ResumeNameDropdown';
import ResumeNavigation from '../../../../components/ResumeBuilder/ResumeNavigation';
import ScoreIndicator from '../../../../components/ScoreIndicator';
import ResumeScoreInsightsModal from '../../../../components/ResumeBuilder/ResumeScoreInsightsModal';
import { ResumeAnalysisProvider, useResumeAnalysis } from '../../../../context/ResumeAnalysisContext';
import { useResumeName } from '../../../../hooks/useResumeName';

interface Project {
  id: string;
  title: string;
  organization: string;
  description: string;
  technologies: string[];
  url: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

interface ProjectsState {
  projects: Project[];
  activeProject: Project | null;
  isLoading: boolean;
  isEditing: boolean;
  bulletCount: number;
  showMobileForm: boolean;
  projectScore: number;
  resumeName: string;
  showScoreInsights: boolean;
  suggestedBullets: string[];
}

// Wrapper component that provides the ResumeAnalysisContext
export default function ProjectsPage() {
  const params = useParams();
  const resumeId = params.resumeId as string;
  
  return (
    <ResumeAnalysisProvider resumeId={resumeId}>
      <ProjectsPageContent />
    </ResumeAnalysisProvider>
  );
}

// Inner component that consumes the ResumeAnalysisContext
function ProjectsPageContent() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params.resumeId as string;
  
  // Get resume name from the same hook used by the dropdown
  const { resumeName } = useResumeName(resumeId);
  
  // Use the shared resume analysis context
  const { analysis, isLoading: isAnalysisLoading, error: analysisError, fetchAnalysis } = useResumeAnalysis();

  const [state, setState] = useState<ProjectsState>({
    projects: [],
    activeProject: null,
    isLoading: true,
    isEditing: false,
    bulletCount: 3,
    showMobileForm: false,
    projectScore: 0,
    resumeName: resumeName || 'Resume',
    showScoreInsights: false,
    suggestedBullets: [],
  });

  // State for bullet generation loading
  const [loadingBullets, setLoadingBullets] = useState(false);

  // Update state when resume name changes
  useEffect(() => {
    if (resumeName) {
      setState(prev => ({
        ...prev,
        resumeName: resumeName
      }));
    }
  }, [resumeName]);

  // Fetch all projects from API
  useEffect(() => {
    async function fetchProjects() {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        const response = await fetch(`/api/resume/projects?resumeId=${resumeId}&t=${Date.now()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const parsedData = await response.json();
        console.log('DEBUG: Received parsed resume data:', parsedData);
        console.log('DEBUG: Keys in parsedData:', Object.keys(parsedData));
        
        let projectsList: Project[] = [];
        
        // Robustly find the projects array from the parsed data
        const rawProjects = parsedData['Projects'] || parsedData.projects || [];
        
        if (Array.isArray(rawProjects)) {
          projectsList = rawProjects.map((proj: any, index: number) => {
            console.log('DEBUG: Processing project:', proj);
            
            const bullets = Array.isArray(proj.Description) ? proj.Description :
              Array.isArray(proj.bullets) ? proj.bullets : [];
              
            return {
              id: proj.id || `project-${index}`,
              title: proj.Title || proj.title || '',
              organization: proj.Organization || proj.organization || '',
              description: Array.isArray(proj.Description) ? proj.Description.join('\n') : (proj.description || ''),
              technologies: proj.Technologies || proj.technologies || [],
              url: proj.URL || proj.url || '',
              startDate: proj.StartDate || proj.startDate || '',
              endDate: proj.EndDate || proj.endDate || '',
              bullets: bullets
            };
          });
        }
        
        console.log('DEBUG: Mapped projects:', projectsList);
        
        // Select the first project by default if available
        const firstProject = projectsList.length > 0 ? projectsList[0] : null;
        
        setState(prev => ({
          ...prev,
          projects: projectsList || [],
          activeProject: firstProject,
          isEditing: true, // Always default to edit mode
          isLoading: false
        }));
      } catch (error) {
        console.error('Error fetching projects:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }

    if (resumeId) {
      fetchProjects();
    }
  }, [resumeId]);

  // Fetch analysis using the context when component mounts
  useEffect(() => {
    if (analysis) {
      setState(prev => ({
        ...prev,
        projectScore: analysis.overallScore || 0,
      }));
    }
  }, [analysis]);

  // Function to handle creating a new project
  const handleCreateProject = () => {
    // Create a new project with a unique ID
    const newProject: Project = {
      id: `project-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: '',
      organization: '',
      description: '',
      technologies: [],
      url: '',
      startDate: '',
      endDate: '',
      bullets: ['', '', '']
    };

    console.log('Creating new project:', newProject);

    setState(prev => ({
      ...prev,
      activeProject: newProject,
      isEditing: true,
      bulletCount: 3,
      showMobileForm: true // Show form when creating new project
    }));
  };

  // Function to handle selecting an existing project
  const handleSelectProject = (project: Project) => {
    setState(prev => ({
      ...prev,
      activeProject: { ...project },
      isEditing: true,
      bulletCount: project.bullets?.length || 3,
      showMobileForm: true // Ensure details panel shows on mobile
    }));
  };

  // Function to handle saving a project (create or update)
  const handleSaveProject = async () => {
    if (!state.activeProject) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    console.log('Saving project:', state.activeProject);
    
    try {
      // Filter out empty bullets
      const bullets = state.activeProject.bullets.filter(bullet => bullet.trim() !== '');
      
      const updatedProject = {
        ...state.activeProject,
        bullets
      };
      
      // Create a copy of the projects to avoid direct mutation
      let updatedProjects = [...state.projects];
      
      // Find the index of the project being edited
      const index = updatedProjects.findIndex(p => p.id === updatedProject.id);
      console.log('Project index in array:', index);
      
      if (index > -1) {
        // If found, update it
        console.log('Updating existing project');
        updatedProjects[index] = updatedProject;
      } else {
        // If not found (it's a new one), add it to the array
        console.log('Adding new project to array');
        updatedProjects.push(updatedProject);
      }
      
      // Map the data to the format expected by Firestore - include all fields
      const projectsToSave = updatedProjects.map(proj => ({
        Title: proj.title || 'Untitled Project',
        Description: proj.bullets,
        Organization: proj.organization || '',
        URL: proj.url || '',
        StartDate: proj.startDate || '',
        EndDate: proj.endDate || ''
      }));
      
      console.log('Projects to save:', projectsToSave);
      
      // Add cache-busting parameter to prevent stale data
      const timestamp = Date.now();
      
      // Call the API to save to Firestore
      const response = await fetch(`/api/resume/projects?resumeId=${resumeId}&t=${timestamp}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId,
          Projects: projectsToSave,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save project');
      }
      
      const responseData = await response.json();
      console.log('Save project response:', responseData);
      
      // On successful save, update the main state and exit editing mode
      setState(prev => ({
        ...prev,
        projects: updatedProjects,
        activeProject: null,
        isEditing: false,
        isLoading: false,
      }));
      
      // Refresh analysis to update scores
      if (fetchAnalysis) fetchAnalysis();
      
    } catch (error) {
      console.error('Error saving project:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      alert('Failed to save project. Please try again.');
    }
  };

  // Function to handle deleting a project
  const handleDeleteProject = (projectId: string) => {
    // Filter out the project to be deleted
    const updatedProjects = state.projects.filter(proj => proj.id !== projectId);
    
    // Update local state immediately for responsive UI
    setState(prev => ({
      ...prev,
      projects: updatedProjects,
      activeProject: updatedProjects.length > 0 ? updatedProjects[0] : null,
      isEditing: updatedProjects.length > 0,
    }));
    
    // Then update the backend
    const projectsToSave = updatedProjects.map(proj => ({
      id: proj.id,
      Title: proj.title,
      Description: proj.bullets,
      Organization: proj.organization || '',
      URL: proj.url || '',
      StartDate: proj.startDate || '',
      EndDate: proj.endDate || ''
    }));
    
    // Send the update to the server in the background
    fetch(`/api/resume/projects?resumeId=${resumeId}&t=${Date.now()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeId,
        Projects: projectsToSave,
      }),
    })
    .then(response => {
      if (!response.ok) {
        console.error('Failed to delete project, server returned:', response.status);
      } else {
        console.log('Project deleted successfully');
      }
    })
    .catch(error => {
      console.error('Error deleting project:', error);
    });
  };

  // Function to handle canceling edit
  const handleCancelEdit = () => {
    setState(prev => ({
      ...prev,
      activeProject: null,
      isEditing: false
    }));
  };

  // Function to add a bullet point
  const handleAddBullet = () => {
    if (!state.activeProject) return;
    
    setState(prev => ({
      ...prev,
      activeProject: {
        ...prev.activeProject!,
        bullets: [...prev.activeProject!.bullets, '']
      },
      bulletCount: prev.bulletCount + 1
    }));
  };

  // Function to remove a bullet point
  const handleRemoveBullet = (index: number) => {
    if (!state.activeProject) return;
    
    setState(prev => ({
      ...prev,
      activeProject: {
        ...prev.activeProject!,
        bullets: prev.activeProject!.bullets.filter((_, i) => i !== index)
      },
      bulletCount: prev.bulletCount - 1
    }));
  };

  // Function to update bullet text
  const handleBulletChange = (index: number, value: string) => {
    if (!state.activeProject) return;
    
    const updatedBullets = [...state.activeProject.bullets];
    updatedBullets[index] = value;
    
    setState(prev => ({
      ...prev,
      activeProject: {
        ...prev.activeProject!,
        bullets: updatedBullets
      }
    }));
  };

  // Function to handle input changes for project fields
  const handleInputChange = (field: keyof Project, value: string | string[]) => {
    if (!state.activeProject) return;
    
    setState(prev => ({
      ...prev,
      activeProject: {
        ...prev.activeProject!,
        [field]: value
      }
    }));
  };

  // Function to handle technologies input (comma-separated)
  const handleTechnologiesChange = (value: string) => {
    const techArray = value.split(',').map(tech => tech.trim()).filter(tech => tech !== '');
    handleInputChange('technologies', techArray);
  };
  
  // Function to handle bullet generation
  const handleGenerateBullets = async () => {
    if (!state.activeProject) return;
    
    try {
      setLoadingBullets(true);
      
      // Extract project details for the API call
      const title = state.activeProject.title || '';
      const organization = state.activeProject.organization || '';
      const description = state.activeProject.description || '';
      const existing_bullets = state.activeProject.bullets || [];
      
      console.log('Sending project bullet generation request:', {
        title,
        organization,
        description: description.slice(0, 100) + '...',  // Log truncated description
        existing_bullets_count: existing_bullets.length
      });
      
      const res = await fetch('/api/generate-bullets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          job_title: title, 
          company: organization, 
          description, 
          existing_bullets 
        }),
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
      alert(`Error generating bullets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingBullets(false);
    }
  };
  
  // Function to accept a single bullet
  const handleAcceptBullet = (index: number) => {
    if (!state.activeProject || index >= state.suggestedBullets.length) return;
    
    const bulletToAccept = state.suggestedBullets[index];
    const currentBullets = state.activeProject.bullets || [];
    
    setState(prev => ({
      ...prev,
      activeProject: {
        ...prev.activeProject!,
        bullets: [...currentBullets, bulletToAccept],
        description: [...currentBullets, bulletToAccept].join('\n')
      },
      suggestedBullets: prev.suggestedBullets.filter((_, i) => i !== index)
    }));
  };
  
  // Function to reject a single bullet
  const handleDenyBullet = (index: number) => {
    setState(prev => ({
      ...prev,
      suggestedBullets: prev.suggestedBullets.filter((_, i) => i !== index)
    }));
  };
  
  // Function to accept all bullets
  const handleAcceptBullets = () => {
    if (state.suggestedBullets.length === 0 || !state.activeProject) return;
    
    setState(prev => ({
      ...prev,
      activeProject: {
        ...prev.activeProject!,
        bullets: [...prev.suggestedBullets],
        description: prev.suggestedBullets.join('\n')
      },
      suggestedBullets: []
    }));
  };
  
  // Function to reject all bullets
  const handleRejectBullets = () => {
    setState(prev => ({
      ...prev,
      suggestedBullets: []
    }));
  };

  return (
    <DashboardLayout>
      <div className="overflow-y-auto pt-4 lg:pt-0 bg-[#0a192f] min-h-screen w-full">
        <div className="max-w-7xl mx-auto px-1 sm:p-4 md:p-8 lg:p-10">
          {/* Resume Name Box with Dropdown */}
          <ResumeNameDropdown resumeId={resumeId} currentSection="project" />

          {/* Navigation Buttons */}
          <ResumeNavigation resumeId={resumeId} currentSection="project" />
          
          {/* Project Score Indicator */}
          <div className="border border-[#1e2d3d] rounded-lg bg-[#0d1b2a] px-4 py-4 mt-2 mb-4 w-full shadow-lg">
            <div 
              className="cursor-pointer" 
              onClick={() => {
                setState(prev => ({ ...prev, showScoreInsights: true }));
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
            experiences={state.projects}
            resumeId={resumeId}
          />
          
          <div className="border border-[#1e2d3d] rounded-lg bg-[#0d1b2a] px-1 sm:px-4 md:px-6 py-4 sm:py-6 mt-1 sm:mt-2 w-full max-w-full shadow-lg min-h-[400px]">
            {state.isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563eb]" />
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-4">
                {/* Left Column - Project List */}
                <div className="w-full md:w-1/3 border-r border-[#1e2d3d] px-2 sm:px-0 md:pr-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-white">Your Projects</h2>
                    <button
                      onClick={() => {
                        console.log('Add button clicked');
                        handleCreateProject();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition duration-200"
                      type="button"
                    >
                      <FaPlus size={12} />
                      <span>Add</span>
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {state.projects.length === 0 ? (
                      <p className="text-gray-400 text-sm">No projects yet. Click the + button to add your first project.</p>
                    ) : (
                      state.projects.map((project) => (
                        <div 
                          key={project.id} 
                          className={`p-3 rounded-md cursor-pointer transition-colors border border-gray-700 min-h-[120px] ${state.activeProject?.id === project.id ? 'bg-[#0d1b2a] border-l-4 border-l-[#2563eb]' : 'bg-[#0d1b2a] hover:bg-[#0d1b2a]'}`}
                          onClick={() => handleSelectProject(project)}
                        >
                          <h3 className="text-xl text-white font-normal">{project.title || 'Untitled Project'}</h3>
                          <p className="text-base text-gray-400 mt-1">{project.organization || 'No Organization'}</p>
                          <p className="text-gray-500 mt-1 text-base">{project.startDate}{project.endDate ? ` - ${project.endDate}` : ''}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
            
                {/* Right Column - Project Form */}
                <div className="w-full md:w-2/3 px-2 sm:px-0 md:pl-4">
                  {state.isEditing && state.activeProject ? (
                    <div>
                      {/* Form Header */}
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">
                          Edit Project
                        </h2>
                        {state.activeProject?.id && (
                          <button
                            onClick={() => state.activeProject?.id && handleDeleteProject(state.activeProject.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete Project"
                          >
                            <FaTrash size={16} />
                          </button>
                        )}
                      </div>
                  
                  {/* Form Fields */}
                  <div className="space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        GIVE YOUR PROJECT A TITLE *
                      </label>
                      <input
                        type="text"
                        className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
                        placeholder="e.g. Portfolio Website"
                        value={state.activeProject.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                      />
                    </div>

                    {/* Organization */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        IN WHICH ORGANIZATION DID YOU DO YOUR PROJECT?
                      </label>
                      <input
                        type="text"
                        className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
                        placeholder="e.g. Personal Project, Habitat for Humanity"
                        value={state.activeProject.organization}
                        onChange={(e) => handleInputChange('organization', e.target.value)}
                      />
                    </div>



                    {/* Date Range */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        WHEN DID YOU DO YOUR PROJECT?
                      </label>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <input
                            type="text"
                            className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
                            placeholder="June 2025"
                            value={state.activeProject.startDate}
                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                          />
                        </div>
                        <div className="flex items-center text-gray-400">-</div>
                        <div className="flex-1">
                          <input
                            type="text"
                            className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
                            placeholder="June 2025"
                            value={state.activeProject.endDate || ''}
                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Project URL */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        PROJECT URL
                      </label>
                      <input
                        type="text"
                        className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
                        placeholder="https://www.talexus.ai/"
                        value={state.activeProject.url || ''}
                        onChange={(e) => handleInputChange('url', e.target.value)}
                      />
                    </div>
                    
                    {/* Description / Bullet Points */}
                    <div className="col-span-full">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs text-gray-300 uppercase">NOW DESCRIBE WHAT YOU DID</label>
                      </div>
                      {state.isEditing ? (
                        <>
                          <textarea
                            value={(state.activeProject?.bullets || []).map(b => {
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
                              
                              handleInputChange('bullets', newBullets);
                              handleInputChange('description', newBullets.join('\n'));
                              
                              // Restore cursor position
                              requestAnimationFrame(() => {
                                if (e.target) {
                                  e.target.selectionStart = cursorPos;
                                  e.target.selectionEnd = cursorPos;
                                }
                              });
                            }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              
                              const textArea = e.target as HTMLTextAreaElement;
                              const cursorPos = textArea.selectionStart;
                              const value = textArea.value;
                              
                              // Insert a new line with bullet point
                              const newValue = value.substring(0, cursorPos) + '\n•    ' + value.substring(cursorPos);
                              textArea.value = newValue; // Directly update the textarea value
                              
                              // Update the state
                              const lines = newValue.split('\n');
                              const newBullets = lines.map(line => {
                                return line.replace(/^[\u2022\-\*]\s*/, '').trim();
                              }).filter(line => line.length > 0);
                              
                              handleInputChange('bullets', newBullets);
                              handleInputChange('description', newBullets.join('\n'));
                              
                              // Set cursor position after the new bullet
                              setTimeout(() => {
                                if (textArea) {
                                  const newCursorPos = cursorPos + 6; // 6 = length of '\n•    '
                                  textArea.selectionStart = newCursorPos;
                                  textArea.selectionEnd = newCursorPos;
                                  textArea.focus();
                                }
                              }, 0);
                              
                              return false;
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              
                              const textArea = e.target as HTMLTextAreaElement;
                              const cursorPos = textArea.selectionStart;
                              const value = textArea.value;
                              
                              // Insert a new line with bullet point
                              const newValue = value.substring(0, cursorPos) + '\n•    ' + value.substring(cursorPos);
                              textArea.value = newValue; // Directly update the textarea value
                              
                              // Update the state
                              const lines = newValue.split('\n');
                              const newBullets = lines.map(line => {
                                return line.replace(/^[\u2022\-\*]\s*/, '').trim();
                              }).filter(line => line.length > 0);
                              
                              handleInputChange('bullets', newBullets);
                              handleInputChange('description', newBullets.join('\n'));
                              
                              // Set cursor position after the new bullet
                              setTimeout(() => {
                                if (textArea) {
                                  const newCursorPos = cursorPos + 6; // 6 = length of '\n•    '
                                  textArea.selectionStart = newCursorPos;
                                  textArea.selectionEnd = newCursorPos;
                                  textArea.focus();
                                }
                              }, 0);
                            }
                          }}
                          className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 font-medium text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb] h-48 resize-y"
                          placeholder="Enter each bullet point on a new line..."
                        />
                        <div className="relative">
                          <div className="absolute bottom-4 right-2">
                            <button
                              className={`flex items-center gap-2 bg-gradient-to-r from-[#2563eb] to-[#0d1b2a] text-white text-sm font-semibold rounded-full border border-[#2563eb] px-4 py-1 shadow-sm hover:from-[#1d4ed8] hover:to-[#0d1b2a] transition-colors duration-150 ${loadingBullets ? 'animate-pulse ring-2 ring-blue-400 ring-offset-2' : ''}`}
                              type="button"
                              onClick={handleGenerateBullets}
                              disabled={loadingBullets || !state.activeProject}
                            >
                              {loadingBullets ? 'Generating...' : <TypingText text="Generate with AI" speed={80} />}
                            </button>
                          </div>
                        </div>
                        </>
                      ) : (
                        <ul className="list-disc pl-6 text-white">
                          {(state.activeProject?.bullets || []).filter(line => line.trim() !== '').map((bullet, idx) => (
                            <li key={idx} style={{ marginBottom: 4 }}>{bullet}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    
                    {/* Suggested Bullets Section */}
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
                  </div>
                  

                  
                  {/* Save and Cancel Buttons */}
                  <div className="col-span-full flex justify-between items-center gap-4 mt-6">
                    <button
                      onClick={handleCancelEdit}
                      className="border border-[#1e2d3d] text-white text-base font-bold rounded-lg px-7 py-2 transition-colors duration-150 hover:bg-[#0d1b2a] hover:border-[#2563eb]"
                      type="button"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={handleSaveProject}
                      className="border border-[#1e2d3d] text-white text-base font-bold rounded-lg px-7 py-2 transition-colors duration-150 hover:bg-[#0d1b2a] hover:border-[#2563eb]"
                      type="button"
                    >
                      SAVE
                    </button>
                  </div>
                </div>
                  ) : (
                    state.activeProject ? (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-semibold text-white mb-1">{state.activeProject.title || 'Untitled Project'}</h2>
                          <div className="text-gray-400 text-base mb-2">{state.activeProject.organization || 'No Organization'}</div>
                          <div className="text-gray-500 text-sm mb-4">{state.activeProject.startDate}{state.activeProject.endDate ? ` - ${state.activeProject.endDate}` : ''}</div>
                        </div>
                        {/* Bullets Display */}
                        <div>
                          <ul className="list-disc pl-6 text-white">
                            {((state.activeProject.bullets && state.activeProject.bullets.length > 0)
                              ? state.activeProject.bullets
                              : (state.activeProject.description ? state.activeProject.description.split('\n') : [])
                            ).filter(line => line.trim() !== '').map((bullet, idx) => (
                              <li key={idx} style={{ marginBottom: 4 }}>{bullet}</li>
                            ))}
                          </ul>
                        </div>
                        {state.activeProject.url && (
                          <div className="mt-2">
                            <a href={state.activeProject.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                              <FaExternalLinkAlt size={14} />
                              {state.activeProject.url}
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col justify-center items-center h-64 text-gray-400">
                        <p className="text-center">
                          Click the <span className="text-blue-500">Add</span> button to create a new project
                        </p>
                      </div>
                    )
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
