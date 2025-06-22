'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaPencilAlt, FaChevronDown, FaEdit, FaCheck, FaTimes, FaChevronUp, FaExternalLinkAlt } from 'react-icons/fa';
import DashboardLayout from '../../../../components/DashboardLayout';
import ResumeNameDropdown from '../../../../components/ResumeBuilder/ResumeNameDropdown';
import ResumeNavigation from '../../../../components/ResumeBuilder/ResumeNavigation';
import ScoreIndicator from '../../../../components/ScoreIndicator';
import ResumeScoreInsights from '../../../../components/ResumeScoreInsights';
import { useResumeName } from '../../../../hooks/useResumeName';

interface Project {
  id: string;
  title: string;
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
  scoreAnalysis: {
    overallScore: number;
    categories: Array<{ name: string; score: number; color: string }>;
    issues: Array<{ type: "warning" | "error" | "info"; message: string; detail: string; relatedProjects?: string[] }>;
    summary?: string;
  } | null;
  isAnalysisLoading: boolean;
  analysisError: string | null;
}

export default function ProjectsPage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params.resumeId as string;
  
  // Get resume name from the same hook used by the dropdown
  const { resumeName } = useResumeName(resumeId);

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
    scoreAnalysis: null,
    isAnalysisLoading: false,
    analysisError: null
  });

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
        const response = await fetch(`/api/resume/projects?resumeId=${resumeId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const projects = await response.json();
        
        setState(prev => ({
          ...prev,
          projects: projects || [],
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

  // Function to handle creating a new project
  const handleCreateProject = () => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      title: '',
      description: '',
      technologies: [],
      url: '',
      startDate: '',
      endDate: '',
      bullets: ['', '', '']
    };

    setState(prev => ({
      ...prev,
      activeProject: newProject,
      isEditing: true,
      bulletCount: 3
    }));
  };

  // Function to handle selecting an existing project
  const handleSelectProject = (project: Project) => {
    setState(prev => ({
      ...prev,
      activeProject: { ...project },
      isEditing: true,
      bulletCount: project.bullets?.length || 3
    }));
  };

  // Function to handle saving a project (create or update)
  const handleSaveProject = async () => {
    if (!state.activeProject) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    // Filter out empty bullets
    const bullets = state.activeProject.bullets.filter(bullet => bullet.trim() !== '');
    
    const updatedProject = {
      ...state.activeProject,
      bullets
    };
    
    // Here you would typically save to your backend
    // For now, we'll just update the local state
    setState(prev => {
      const isNewProject = !prev.projects.some(p => p.id === updatedProject.id);
      const updatedProjects = isNewProject 
        ? [...prev.projects, updatedProject]
        : prev.projects.map(p => p.id === updatedProject.id ? updatedProject : p);
        
      return {
        ...prev,
        projects: updatedProjects,
        activeProject: null,
        isEditing: false,
        isLoading: false
      };
    });
  };

  // Function to handle deleting a project
  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Here you would typically delete from your backend
      // For now, we'll just update the local state
      setState(prev => ({
        ...prev,
        projects: prev.projects.filter(p => p.id !== projectId),
        isLoading: false
      }));
    }
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
                setState(prev => ({ 
                  ...prev, 
                  showScoreInsights: true
                }));
              }}
            >
              <ScoreIndicator 
                score={state.projectScore} 
                size={50}
                strokeWidth={4}
                label="Your Projects" 
                description={state.projectScore < 50 ? "Needs improvement" : "Looking good!"}
              />
            </div>
          </div>
          
          {/* Score Insights Modal */}
          {state.showScoreInsights && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-1 sm:p-6">
              <div className="px-2 sm:px-11 py-6 bg-[#0d1b2a] border border-[#1e2d3d] rounded-lg shadow-lg max-w-5xl w-full text-white relative overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center relative mb-4">
                  <div className="absolute left-0">
                    {/* Empty div for spacing */}
                  </div>
                  <h2 className="text-2xl font-bold mx-auto">Talexus Score</h2>
                  <button onClick={() => setState(prev => ({ ...prev, showScoreInsights: false, analysisError: null }))} className="text-gray-400 hover:text-white text-2xl absolute right-0">&times;</button>
                </div>
                {state.isAnalysisLoading ? (
                  <div className="text-center py-8">
                    <p className="text-lg">Analyzing your resume against the job description...</p>
                    <p className="text-sm text-gray-400 mt-2">This may take a moment. We're providing real-time, GPT-powered feedback.</p>
                  </div>
                ) : state.analysisError ? (
                  <div className="text-center py-8 text-red-400">
                    <p className="font-bold text-lg">Analysis Failed</p>
                    <p className="mt-2">{state.analysisError}</p>
                  </div>
                ) : state.scoreAnalysis ? (
                  <div>
                    {/* Score analysis content would go here */}
                    <p className="text-center">Project score analysis will be available soon.</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-lg">Project analysis not available yet</p>
                    <p className="text-sm text-gray-400 mt-2">Complete your projects to get detailed feedback.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="bg-[#0a1624] rounded-lg p-6 mt-6">
          {/* Two column layout */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column - Project List */}
            <div className="w-full md:w-1/3">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Your Projects</h2>
                <button
                  onClick={handleCreateProject}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center gap-2 transition-colors"
                  disabled={state.isEditing}
                  type="button"
                >
                  <FaPlus /> Add Project
                </button>
              </div>
              
              <div className="space-y-3">
                {state.isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : state.projects.length === 0 ? (
                  <p className="text-gray-400 text-sm">No projects yet. Click the + button to add your first project.</p>
                ) : (
                  state.projects.map((project) => (
                    <div 
                      key={project.id} 
                      className={`p-3 rounded-md cursor-pointer transition-colors border border-gray-700 ${state.activeProject?.id === project.id ? 'bg-[#0d1b2a] border-l-4 border-l-[#2563eb]' : 'bg-[#0d1b2a] hover:bg-[#0d1b2a]'}`}
                      onClick={() => handleSelectProject(project)}
                    >
                      <h3 className="text-xl text-white font-normal">{project.title || 'Untitled Project'}</h3>
                      <p className="text-base text-gray-400 mt-1">{project.description || 'No Description'}</p>
                      <p className="text-gray-500 mt-1 text-base">{project.startDate}{project.endDate ? ` - ${project.endDate}` : ''}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Right Column - Project Form */}
            <div className="w-full md:w-2/3">
              {state.isEditing && state.activeProject ? (
                <div className="bg-[#0d1b2a] border border-[#1e2d3d] rounded-lg p-6">
                  {/* Form Header */}
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">
                      {state.activeProject.id ? 'Edit Project' : 'Add New Project'}
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="border border-[#1e2d3d] hover:bg-[#1e2d3d] text-white py-2 px-4 rounded-md flex items-center gap-2 transition-colors"
                        type="button"
                      >
                        <FaTimes /> Cancel
                      </button>
                      <button
                        onClick={handleSaveProject}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center gap-2 transition-colors"
                        type="button"
                      >
                        <FaCheck /> Save to Project List
                      </button>
                    </div>
                  </div>
                  
                  {/* Form Fields */}
                  <div className="space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        GIVE YOUR PROJECT A TITLE
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
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        IN WHICH ORGANIZATION DID YOU DO YOUR PROJECT?
                      </label>
                      <input
                        type="text"
                        className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
                        placeholder="e.g. Personal Project, Habitat for Humanity"
                        value={state.activeProject.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                      />
                    </div>

                    {/* Date Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        WHEN DID YOU DO YOUR PROJECT?
                      </label>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <input
                            type="text"
                            className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
                            placeholder="June 2023"
                            value={state.activeProject.startDate}
                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                          />
                        </div>
                        <div className="flex items-center text-gray-400">-</div>
                        <div className="flex-1">
                          <input
                            type="text"
                            className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
                            placeholder="Present"
                            value={state.activeProject.endDate || ''}
                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Project URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        PROJECT URL
                      </label>
                      <input
                        type="text"
                        className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
                        placeholder="https://myproject.com"
                        value={state.activeProject.url || ''}
                        onChange={(e) => handleInputChange('url', e.target.value)}
                      />
                    </div>

                    {/* Technologies */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        TECHNOLOGIES USED (COMMA SEPARATED)
                      </label>
                      <input
                        type="text"
                        className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
                        placeholder="React, TypeScript, Firebase"
                        value={state.activeProject.technologies?.join(', ') || ''}
                        onChange={(e) => handleTechnologiesChange(e.target.value)}
                      />
                    </div>

                    {/* Bullet Points */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-400">
                          PROJECT HIGHLIGHTS
                        </label>
                        <button
                          onClick={handleAddBullet}
                          className="text-blue-400 hover:text-blue-300 p-1"
                          type="button"
                        >
                          <FaPlus size={14} /> Add Bullet
                        </button>
                      </div>
                      
                      {state.activeProject.bullets?.map((bullet, index) => (
                        <div key={index} className="flex items-start gap-2 mb-2">
                          <input
                            type="text"
                            className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
                            placeholder="• Developed a responsive web application with React"
                            value={bullet}
                            onChange={(e) => handleBulletChange(index, e.target.value)}
                          />
                          <button
                            onClick={() => handleRemoveBullet(index)}
                            className="text-red-400 hover:text-red-300 p-2"
                            type="button"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      ))}
                      
                      <p className="text-sm text-gray-400 mt-2">
                        <span className="inline-flex items-center gap-2">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                          </svg>
                          Aim for a balanced mix of descriptive and key number bullet points.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-center">
                    Select a project from the list or add a new one to edit details.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
