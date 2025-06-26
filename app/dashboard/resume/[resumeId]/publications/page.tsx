'use client';

import { useParams } from 'next/navigation';
import React from 'react';
import DashboardLayout from '../../../../components/DashboardLayout';
import ResumeNameDropdown from '../../../../components/ResumeBuilder/ResumeNameDropdown';
import ResumeNavigation from '../../../../components/ResumeBuilder/ResumeNavigation';
import ResumeScoreInsightsModal from '../../../../components/ResumeBuilder/ResumeScoreInsightsModal';
import { ResumeAnalysisProvider, useResumeAnalysis } from '../../../../context/ResumeAnalysisContext';
import { useResumeName } from '../../../../hooks/useResumeName';
import ScoreIndicator from '../../../../components/ScoreIndicator';

// Wrapper component that provides the ResumeAnalysisContext
export default function PublicationsPage() {
  const params = useParams();
  const resumeId = params.resumeId as string;
  
  return (
    <ResumeAnalysisProvider resumeId={resumeId}>
      <PublicationsPageContent />
    </ResumeAnalysisProvider>
  );
}

// Inner component that consumes the ResumeAnalysisContext
function PublicationsPageContent() {
  const params = useParams();
  const resumeId = params.resumeId as string;
  
  // Get resume name from the same hook used by the dropdown
  const { resumeName } = useResumeName(resumeId);
  
  // Use the shared resume analysis context
  const { analysis, isLoading: isAnalysisLoading, error: analysisError, fetchAnalysis } = useResumeAnalysis();

  // Initialize state
  const [state, setState] = React.useState({
    showScoreInsights: false,
    resumeName: resumeName || 'Resume',
  });

  // Update state when resume name changes
  React.useEffect(() => {
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
          <ResumeNameDropdown resumeId={resumeId} currentSection="publications" />

          {/* Navigation Buttons */}
          <ResumeNavigation resumeId={resumeId} currentSection="publications" />
          
          {/* Score Indicator */}
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
        </div>
      </div>
    </DashboardLayout>
  );
}
