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

// Define Certification interface
interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expirationDate: string;
  credentialId: string;
  url: string;
}

interface CertificationState {
  certifications: Certification[];
  activeCertification: Certification | null;
  isLoading: boolean;
  isEditing: boolean;
  showMobileForm: boolean;
  certificationScore: number;
  resumeName: string;
  showScoreInsights: boolean;
}

// Wrapper component that provides the ResumeAnalysisContext
export default function CertificationPage() {
  const params = useParams();
  const resumeId = params?.resumeId as string;
  
  return (
    <ResumeAnalysisProvider resumeId={resumeId}>
      <CertificationPageContent />
    </ResumeAnalysisProvider>
  );
}

// Inner component that consumes the ResumeAnalysisContext
function CertificationPageContent() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params?.resumeId as string;
  
  // Get resume name from the same hook used by the dropdown
  const { resumeName } = useResumeName(resumeId);
  
  // Use the shared resume analysis context
  const { analysis, isLoading: isAnalysisLoading, error: analysisError, fetchAnalysis } = useResumeAnalysis();

  // Initialize state
  const [state, setState] = useState<CertificationState>({
    certifications: [],
    activeCertification: null,
    isEditing: false,
    isLoading: false,
    showMobileForm: false,
    certificationScore: 0,
    showScoreInsights: false,
    resumeName: resumeName || 'Resume',
  });

  // Update state when resume name changes
  useEffect(() => {
    if (resumeName) {
      setState(prev => ({ ...prev, resumeName }));
    }
  }, [resumeName]);

  // Function to refresh the analysis
  const refreshAnalysis = () => {
    if (fetchAnalysis) {
      fetchAnalysis();
    }
  };

  return (
    <DashboardLayout>
      <div className="overflow-y-auto pt-4 lg:pt-0 bg-[#0a192f] min-h-screen w-full">
        <div className="max-w-7xl mx-auto px-1 sm:p-4 md:p-8 lg:p-10">
          {/* Resume Name Box with Dropdown */}
          <ResumeNameDropdown resumeId={resumeId} currentSection="certification" />

          {/* Navigation Buttons */}
          <ResumeNavigation resumeId={resumeId} currentSection="certification" />
          
          {/* Certification Score Indicator */}
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
                {/* Content will be added later */}
                <div className="w-full flex justify-center items-center h-64">
                  <p className="text-gray-400">Certification section is being set up.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
