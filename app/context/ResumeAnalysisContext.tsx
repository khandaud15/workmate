import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

interface ScoreAnalysis {
  overallScore: number;
  categories: Array<{ name: string; score: number; color: string }>;
  issues: Array<{ type: 'warning' | 'error' | 'info'; message: string; detail: string; relatedExperiences?: string[]; relatedProjects?: string[] }>;
  summary: string;
}

interface ResumeAnalysisContextType {
  analysis: ScoreAnalysis | null;
  isLoading: boolean;
  error: string | null;
  fetchAnalysis: () => Promise<void>;
}

const ResumeAnalysisContext = createContext<ResumeAnalysisContextType | undefined>(undefined);

export const ResumeAnalysisProvider = ({ resumeId, children }: { resumeId: string; children: ReactNode }) => {
  const [analysis, setAnalysis] = useState<ScoreAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchAnalysis = async () => {
    if (hasFetched) {
      console.log('Analysis already fetched, using cached data');
      return;
    }
    
    console.log(`Fetching analysis for resumeId: ${resumeId}`);
    setIsLoading(true);
    setError(null);
    
    try {
      // First try to get cached analysis with GET
      console.log('Trying GET request to fetch cached analysis');
      const getRes = await fetch(`/api/resume/analyze?resumeId=${resumeId}`);
      
      console.log(`GET response status: ${getRes.status}`);
      
      // If GET succeeds, use the cached data
      if (getRes.ok) {
        const data = await getRes.json();
        console.log('Cached analysis data received:', data);
        
        // Handle both direct analysis object and nested analysis object
        const analysisData = data.analysis || data;
        
        setAnalysis({
          ...analysisData,
          overallScore: analysisData.overallScore || 0,
          categories: analysisData.categories || [],
          issues: analysisData.issues || [],
          summary: analysisData.summary || '',
        });
        
        setHasFetched(true);
        console.log('Cached analysis data processed and stored in context');
        setIsLoading(false);
        return;
      }
      
      // If GET fails (no cached data), generate new analysis with POST
      console.log('No cached analysis found, making POST request to generate new analysis');
      const postRes = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId }),
      });
      
      console.log(`POST response status: ${postRes.status}`);
      
      if (postRes.ok) {
        const data = await postRes.json();
        console.log('New analysis data received:', data);
        
        // Handle both direct analysis object and nested analysis object
        const analysisData = data.analysis || data;
        
        setAnalysis({
          ...analysisData,
          overallScore: analysisData.overallScore || 0,
          categories: analysisData.categories || [],
          issues: analysisData.issues || [],
          summary: analysisData.summary || '',
        });
        
        setHasFetched(true);
        console.log('New analysis data processed and stored in context');
      } else {
        const errorText = await postRes.text();
        console.error('API error response:', errorText);
        setError(`Failed to generate analysis: ${postRes.status} ${postRes.statusText}`);
      }
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError(`Failed to fetch analysis: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setHasFetched(false);
    setAnalysis(null);
    setError(null);
    fetchAnalysis();
  }, [resumeId]);

  // Create a memoized version of fetchAnalysis that doesn't change on re-renders
  const contextValue = useMemo(
    () => ({ analysis, isLoading, error, fetchAnalysis }),
    [analysis, isLoading, error]
  );

  return (
    <ResumeAnalysisContext.Provider value={contextValue}>
      {children}
    </ResumeAnalysisContext.Provider>
  );
};

export const useResumeAnalysis = () => {
  const context = useContext(ResumeAnalysisContext);
  if (!context) {
    throw new Error('useResumeAnalysis must be used within a ResumeAnalysisProvider');
  }
  return context;
};
