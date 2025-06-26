'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaPencilAlt, FaChevronDown, FaEdit, FaCheck, FaTimes, FaChevronUp, FaExternalLinkAlt } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import React from 'react';
import DashboardLayout from '../../../../components/DashboardLayout';
import ResumeNameDropdown from '../../../../components/ResumeBuilder/ResumeNameDropdown';
import ResumeNavigation from '../../../../components/ResumeBuilder/ResumeNavigation';
import ScoreIndicator from '../../../../components/ScoreIndicator';
import ResumeScoreInsightsModal from '../../../../components/ResumeBuilder/ResumeScoreInsightsModal';
import { ResumeAnalysisProvider, useResumeAnalysis } from '../../../../context/ResumeAnalysisContext';
import { useResumeName } from '../../../../hooks/useResumeName';

// Define Education interface
interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa: string;
  // Additional possible field names from parsed data
  School?: string;
  Institution?: string;
  institution?: string;
  university?: string;
  University?: string;
  college?: string;
  College?: string;
}

interface EducationState {
  educations: Education[];
  activeEducation: Education | null;
  isLoading: boolean;
  isEditing: boolean;
  showMobileForm: boolean;
  educationScore: number;
  resumeName: string;
  showScoreInsights: boolean;
}

// Wrapper component that provides the ResumeAnalysisContext
export default function EducationPage() {
  const params = useParams();
  const resumeId = params.resumeId as string;
  
  return (
    <ResumeAnalysisProvider resumeId={resumeId}>
      <EducationPageContent />
    </ResumeAnalysisProvider>
  );
}

// Inner component that consumes the ResumeAnalysisContext
function EducationPageContent() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params.resumeId as string;
  
  // Get resume name from the same hook used by the dropdown
  const { resumeName } = useResumeName(resumeId);
  
  // Use the shared resume analysis context
  const { analysis, isLoading: isAnalysisLoading, error: analysisError, fetchAnalysis } = useResumeAnalysis();

  // Initialize state
  const [state, setState] = useState<{
    educations: Education[];
    activeEducation: Education | null;
    isEditing: boolean;
    isLoading: boolean;
    showMobileForm: boolean;
    educationScore: number;
    showScoreInsights: boolean;
    resumeName: string;
  }>({
    educations: [],
    activeEducation: null,
    isEditing: false,
    isLoading: false,
    showMobileForm: false,
    educationScore: 0,
    showScoreInsights: false,
    resumeName: resumeName || 'Resume',
  });

  // Update state when resume name changes
  useEffect(() => {
    if (resumeName) {
      setState(prev => ({ ...prev, resumeName }));
    }
  }, [resumeName]);
  
  // Fetch education data when component mounts
  useEffect(() => {
    if (resumeId) {
      fetchEducations();
    }
  }, [resumeId]);
  
  // Function to fetch education data from API
  const fetchEducations = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await fetch(`/api/resume/education?resumeId=${resumeId}&t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch education data: ${response.status}`);
      }
      
      const parsedData = await response.json();
      console.log('DEBUG: Received parsed resume data:', parsedData);
      console.log('DEBUG: Keys in parsedData:', Object.keys(parsedData));
      
      let educationsList: Education[] = [];
      
      // Robustly find the education array from the parsed data
      // Check multiple possible field names where education data might be stored
      const rawEducation = parsedData['Education'] || 
                          parsedData.education || 
                          parsedData['educations'] || 
                          parsedData['EducationHistory'] || 
                          parsedData['educationHistory'] || 
                          parsedData['AcademicHistory'] || 
                          parsedData['academicHistory'] || 
                          [];
      
      console.log('DEBUG: Raw education data:', rawEducation);
      
      if (Array.isArray(rawEducation)) {
        educationsList = rawEducation.map((edu: any, index: number) => {
          console.log('DEBUG: Processing education entry:', edu);
          
          // Extract school/institution name from various possible fields
          const schoolName = edu.School || 
                           edu.school || 
                           edu.Institution || 
                           edu.institution || 
                           edu.University ||
                           edu.university ||
                           edu.College ||
                           edu.college ||
                           edu.SchoolName ||
                           edu.schoolName ||
                           edu.InstitutionName ||
                           edu.institutionName ||
                           edu.UniversityName ||
                           edu.universityName ||
                           edu.CollegeName ||
                           edu.collegeName ||
                           edu.Name ||
                           edu.name ||
                           '';
          
          console.log('DEBUG: Extracted school name:', schoolName);
          
          return {
            id: edu.id || `education-${index}-${uuidv4()}`,
            school: schoolName,
            degree: edu.Degree || edu.degree || edu.DegreeType || edu.degreeType || edu.Qualification || edu.qualification || '',
            fieldOfStudy: edu.FieldOfStudy || edu.fieldOfStudy || edu.Major || edu.major || edu.Field || edu.field || edu.Program || edu.program || '',
            startDate: edu.StartDate || edu.startDate || edu.Start || edu.start || '',
            endDate: edu.EndDate || edu.endDate || edu.End || edu.end || '',
            gpa: edu.GPA || edu.gpa || edu.Grade || edu.grade || ''
          };
        });
      }
      
      console.log('DEBUG: Mapped education entries:', educationsList);
      
      // Select the first education entry by default if available
      const firstEducation = educationsList.length > 0 ? educationsList[0] : null;
      
      setState(prev => ({
        ...prev,
        educations: educationsList,
        activeEducation: firstEducation,
        isEditing: educationsList.length > 0,
        isLoading: false
      }));
      
    } catch (error) {
      console.error('Error fetching education data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Function to trigger analysis refresh
  const refreshAnalysis = () => {
    if (resumeId && fetchAnalysis) {
      fetchAnalysis();
    }
  };

  // Use the fetchEducations function defined earlier
  useEffect(() => {
    if (resumeId) {
      fetchEducations();
    }
  }, [resumeId]);

  // Fetch analysis using the context when component mounts
  useEffect(() => {
    if (analysis) {
      setState(prev => ({
        ...prev,
        educationScore: analysis?.overallScore || 0,
      }));
    }
  }, [analysis]);
  
  // Function to handle selecting an education entry
  const handleSelectEducation = (education: Education) => {
    setState(prev => ({
      ...prev,
      activeEducation: education,
      isEditing: true,
      showMobileForm: true
    }));
  };
  
  // Function to handle input changes
  const handleInputChange = (field: keyof Education, value: string) => {
    if (!state.activeEducation) return;
    
    setState(prev => ({
      ...prev,
      activeEducation: {
        ...prev.activeEducation!,
        [field]: value
      }
    }));
  };
  
  // Function to handle saving an education entry
  const handleSaveEducation = async () => {
    if (!state.activeEducation) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Check if this is a new education or an existing one
      const isNewEducation = !state.educations.some(edu => edu.id === state.activeEducation?.id);
      
      // Create a copy of the current educations list
      let updatedEducations = [...state.educations];
      
      if (isNewEducation) {
        // Add the new education to the list
        updatedEducations.push(state.activeEducation);
      } else {
        // Update the existing education in the list
        updatedEducations = updatedEducations.map(edu => 
          edu.id === state.activeEducation?.id ? state.activeEducation : edu
        );
      }
      
      // Map the data to the format expected by the API
      const educationsToSave = updatedEducations.map(edu => ({
        School: edu.school,
        Degree: edu.degree,
        FieldOfStudy: edu.fieldOfStudy,
        StartDate: edu.startDate,
        EndDate: edu.endDate,
        GPA: edu.gpa
      }));
      
      // Call the API to update the education data
      const response = await fetch(`/api/resume/education?resumeId=${resumeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId,
          Education: educationsToSave,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save education');
      }
      
      // Update local state after successful save
      setState(prev => ({
        ...prev,
        educations: updatedEducations,
        isLoading: false,
      }));
      
      alert('Education saved successfully!');
      
    } catch (error) {
      console.error('Error saving education:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      alert('Failed to save education. Please try again.');
    }
  };
  
  // Function to handle adding a new education entry
  const handleAddEducation = () => {
    const newEducation: Education = {
      id: uuidv4(),
      school: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      gpa: ''
    };
    
    setState(prev => ({
      ...prev,
      activeEducation: newEducation,
      isEditing: true,
      showMobileForm: true
    }));
  };
  
  // Function to handle deleting an education entry
  const handleDeleteEducation = async (educationId: string) => {
    if (window.confirm('Are you sure you want to delete this education entry?')) {
      setState(prev => ({ ...prev, isLoading: true }));
      
      try {
        // Filter out the education to be deleted
        const updatedEducations = state.educations.filter(edu => edu.id !== educationId);
        
        // Map the data to the format expected by the API
        const educationsToSave = updatedEducations.map(edu => ({
          School: edu.school,
          Degree: edu.degree,
          FieldOfStudy: edu.fieldOfStudy,
          StartDate: edu.startDate,
          EndDate: edu.endDate,
          GPA: edu.gpa
        }));
        
        // Call the API to update the education data
        const response = await fetch(`/api/resume/education?resumeId=${resumeId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resumeId,
            Education: educationsToSave,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete education');
        }
        
        // Update local state after successful deletion
        setState(prev => ({
          ...prev,
          educations: updatedEducations,
          activeEducation: updatedEducations.length > 0 ? updatedEducations[0] : null,
          isEditing: updatedEducations.length > 0,
          isLoading: false,
        }));
        
      } catch (error) {
        console.error('Error deleting education:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="overflow-y-auto pt-4 lg:pt-0 bg-[#0a192f] min-h-screen w-full">
        <div className="max-w-7xl mx-auto px-1 sm:p-4 md:p-8 lg:p-10">
          {/* Resume Name Box with Dropdown */}
          <ResumeNameDropdown resumeId={resumeId} currentSection="education" />

          {/* Navigation Buttons */}
          <ResumeNavigation resumeId={resumeId} currentSection="education" />
          
          {/* Education Score Indicator */}
          <div className="border border-[#1e2d3d] rounded-lg bg-[#0d1b2a] px-4 py-4 mt-2 mb-4 w-full shadow-lg">
            <div 
              className="cursor-pointer" 
              onClick={() => {
                setState(prev => ({ ...prev, showScoreInsights: true }));
                refreshAnalysis();
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
            resumeId={resumeId}
          />
          
          <div className="border border-[#1e2d3d] rounded-lg bg-[#0d1b2a] px-1 sm:px-4 md:px-6 py-4 sm:py-6 mt-1 sm:mt-2 w-full max-w-full shadow-lg min-h-[400px]">
            {state.isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2563eb]" />
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-4">
                {/* Left Column - Education List */}
                <div className="w-full md:w-1/3 border-r border-[#1e2d3d] px-2 sm:px-0 md:pr-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-white">Your Education</h2>
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition duration-200"
                      onClick={() => {
                        setState(prev => ({
                          ...prev,
                          activeEducation: {
                            id: `education-${Date.now()}`,
                            school: '',
                            degree: '',
                            fieldOfStudy: '',
                            startDate: '',
                            endDate: '',
                            gpa: ''
                          },
                          isEditing: true
                        }));
                      }}
                    >
                      <FaPlus size={12} />
                      <span>Add</span>
                    </button>
                  </div>
                  
                  {/* Education list */}
                  <div className="space-y-2">
                    {state.educations.length === 0 ? (
                      <p className="text-gray-400 text-sm">No education entries yet. Click the + button to add your first education.</p>
                    ) : (
                      state.educations.map((education) => (
                        <div 
                          key={education.id} 
                          className={`p-3 rounded-md cursor-pointer transition-colors border border-gray-700 min-h-[120px] ${state.activeEducation?.id === education.id ? 'bg-[#0d1b2a] border-l-4 border-l-[#2563eb]' : 'bg-[#0d1b2a] hover:bg-[#0d1b2a]'}`}
                          onClick={() => handleSelectEducation(education)}
                        >
                          <h3 className="text-xl text-white font-normal">{education.school || 'Unnamed School'}</h3>
                          <p className="text-base text-gray-400 mt-1">{education.degree || 'No Degree'} {education.fieldOfStudy ? `in ${education.fieldOfStudy}` : ''}</p>
                          <p className="text-gray-500 mt-1 text-base">{education.startDate}{education.endDate ? ` - ${education.endDate}` : ''}</p>
                          {education.gpa && <p className="text-gray-500 mt-1 text-base">GPA: {education.gpa}</p>}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Column - Education Form */}
                <div className="w-full md:w-2/3 md:pl-4">
                  {state.isEditing && state.activeEducation ? (
                    <div>
                      {/* Form Header */}
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">
                          Edit Education
                        </h2>
                        {state.activeEducation?.id && (
                          <button
                            onClick={() => state.activeEducation?.id && handleDeleteEducation(state.activeEducation.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete Education"
                          >
                            <FaTrash size={16} />
                          </button>
                        )}
                      </div>
                      {/* Form Fields */}
                      <div className="space-y-6">
                        {/* School */}
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            SCHOOL/UNIVERSITY NAME *
                          </label>
                          <input
                            type="text"
                            className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
                            placeholder="e.g. University of Texas at Dallas"
                            value={state.activeEducation.school}
                            onChange={(e) => handleInputChange('school', e.target.value)}
                          />
                        </div>

                        {/* Degree */}
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            DEGREE *
                          </label>
                          <input
                            type="text"
                            className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
                            placeholder="e.g. Bachelor of Science, Master's"
                            value={state.activeEducation.degree}
                            onChange={(e) => handleInputChange('degree', e.target.value)}
                          />
                        </div>

                        {/* Field of Study */}
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            FIELD OF STUDY *
                          </label>
                          <input
                            type="text"
                            className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
                            placeholder="e.g. Computer Science, Biology"
                            value={state.activeEducation.fieldOfStudy}
                            onChange={(e) => handleInputChange('fieldOfStudy', e.target.value)}
                          />
                        </div>

                        {/* Date Range */}
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            WHEN DID YOU ATTEND?
                          </label>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <input
                                type="text"
                                className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
                                placeholder="Aug 2015"
                                value={state.activeEducation.startDate}
                                onChange={(e) => handleInputChange('startDate', e.target.value)}
                              />
                            </div>
                            <div className="flex items-center text-gray-400">-</div>
                            <div className="flex-1">
                              <input
                                type="text"
                                className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
                                placeholder="Dec 2017"
                                value={state.activeEducation.endDate || ''}
                                onChange={(e) => handleInputChange('endDate', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* GPA */}
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            GPA (IF APPLICABLE)
                          </label>
                          <input
                            type="text"
                            className="w-full bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
                            placeholder="e.g. 3.82"
                            value={state.activeEducation.gpa || ''}
                            onChange={(e) => handleInputChange('gpa', e.target.value)}
                          />
                        </div>

                        {/* Save Button */}
                        <div className="pt-4">
                          <button
                            onClick={handleSaveEducation}
                            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-2 px-4 rounded-md transition-colors"
                            disabled={state.isLoading}
                          >
                            {state.isLoading ? (
                              <div className="flex justify-center items-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                                <span>Saving...</span>
                              </div>
                            ) : (
                              'Save Education'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                      <p>Select an education entry to edit or add a new one.</p>
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
