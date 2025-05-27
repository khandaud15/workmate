'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaSpinner, FaExclamationTriangle, FaFilePdf, FaDownload, FaUpload } from 'react-icons/fa';

interface ResumeViewerProps {
  className?: string;
}

export default function ResumeViewer({ className = '' }: ResumeViewerProps) {
  const { data: session } = useSession();
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parsedResumeData, setParsedResumeData] = useState<any>(null);

  useEffect(() => {
    const fetchResumeData = async () => {
      if (!session?.user?.email) {
        console.log('[ResumeViewer] No user session, skipping resume fetch');
        return;
      }
      
      const userEmail = session.user.email;
      console.log(`[ResumeViewer] Fetching resume for user: ${userEmail}`);
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Helper function to get resume URL from localStorage
        const getResumeUrlFromLocalStorage = () => {
          console.log('[ResumeViewer] All localStorage keys:', Object.keys(localStorage));
          
          // Check possible keys in order of priority
          const possibleKeys = [
            // User-specific keys
            `user_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}_resumeUrl`,
            // Generic keys
            'resumeUrl',
            'lastUploadedResumeUrl',
            'rawResumeUrl'
          ];
          
          // Try each key
          for (const key of possibleKeys) {
            const value = localStorage.getItem(key);
            if (value) {
              console.log(`[ResumeViewer] Found resume URL in localStorage key '${key}':`, value);
              return value;
            }
          }
          
          // If no direct matches, look for any keys containing 'resume' and 'url'
          console.log('[ResumeViewer] Checking for any resume URL in localStorage');
          const resumeKeys = Object.keys(localStorage).filter(key => 
            key.includes('resume') && key.includes('url'));
          
          if (resumeKeys.length > 0) {
            console.log('[ResumeViewer] Found resume-related keys:', resumeKeys);
            const fallbackUrl = localStorage.getItem(resumeKeys[0]);
            if (fallbackUrl) {
              console.log('[ResumeViewer] Using fallback resume URL:', fallbackUrl);
              return fallbackUrl;
            }
          }
          
          return null;
        };
        
        // Get resume URL from localStorage
        const localResumeUrl = getResumeUrlFromLocalStorage();
        
        if (localResumeUrl) {
          try {
            // Try parsing it as JSON first
            const parsedUrl = JSON.parse(localResumeUrl);
            console.log('[ResumeViewer] Successfully parsed URL as JSON:', parsedUrl);
            setResumeUrl(parsedUrl);
            setIsLoading(false);
            return;
          } catch (e) {
            // If parsing fails, use the string directly
            console.log('[ResumeViewer] Using URL directly:', localResumeUrl);
            setResumeUrl(localResumeUrl);
            setIsLoading(false);
            return;
          }
        }
        
        // Fall back to the profile endpoint
        const endpoint = '/api/profile';
        console.log(`[ResumeViewer] Fetching from ${endpoint}`);
        
        try {
          const timestamp = Date.now();
          console.log(`[ResumeViewer] Adding cache-busting timestamp: ${timestamp}`);
          
          const response = await fetch(`${endpoint}?t=${timestamp}`, {
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          console.log(`[ResumeViewer] Response status: ${response.status}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log('[ResumeViewer] API response from', endpoint, data);
            console.log('[ResumeViewer] Available fields in response:', Object.keys(data));
            
            if (data.profile) {
              console.log('[ResumeViewer] Profile fields:', Object.keys(data.profile));
            }
            
            // Check all possible resume URL fields
            const possibleUrlFields = ['resumeUrl', 'rawResumeUrl', 'url', 'pdfUrl', 'fileUrl', 'uploadsResumeUrl', 'directStorageUrl'];
            console.log('[ResumeViewer] Checking fields:', possibleUrlFields);
            
            let resumeFound = false;
            
            // Check direct fields
            for (const field of possibleUrlFields) {
              console.log(`[ResumeViewer] Checking field '${field}':`, data[field]);
              if (data[field]) {
                console.log(`[ResumeViewer] Found resume URL in field '${field}':`, data[field]);
                setResumeUrl(data[field]);
                resumeFound = true;
                break;
              }
            }
            
            // Also check if there's parsed resume data
            if (data.parsedResumeData) {
              console.log('[ResumeViewer] Found parsed resume data');
              setParsedResumeData(data.parsedResumeData);
            }
            
            // Check profile object if it exists
            if (data.profile && !resumeFound) {
              for (const field of possibleUrlFields) {
                console.log(`[ResumeViewer] Checking profile.${field}:`, data.profile[field]);
                if (data.profile[field]) {
                  console.log(`[ResumeViewer] Found resume URL in profile.${field}:`, data.profile[field]);
                  setResumeUrl(data.profile[field]);
                  resumeFound = true;
                  break;
                }
              }
            }
            
            if (!resumeFound) {
              console.log('[ResumeViewer] No resume URL found in any field');
            }
          }
        } catch (err) {
          console.error(`[ResumeViewer] Error fetching from ${endpoint}:`, err);
        }
        
        // Only set the sample PDF if we know for sure there is no uploaded resume
        if (!resumeUrl) {
          console.log('[ResumeViewer] No uploaded resume found, using sample PDF as fallback');
          setResumeUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
        }
      } catch (err) {
        console.error('[ResumeViewer] Error fetching resume:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        // Do not force sample PDF on error; let the user see the error state if resume is not available
        // Only set sample PDF in the main logic if no resume is found

      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResumeData();
  }, [session]);


  // Debug the current resumeUrl
  console.log('[ResumeViewer] Current resumeUrl before rendering:', resumeUrl);
  
  // Function to determine if a URL is valid for an iframe
  const isValidUrl = (url: string | null): boolean => {
    if (!url) return false;
    try {
      new URL(url); // This will throw if url is not valid
      return true;
    } catch (e) {
      return false;
    }
  };
  
  // Get a safe URL for the iframe
  const safeResumeUrl = isValidUrl(resumeUrl) ? resumeUrl : 'about:blank';
  console.log('[ResumeViewer] Safe URL for iframe:', safeResumeUrl);
  
  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex justify-between items-center mb-6 px-4">
        <h3 className="text-xl font-semibold text-white">Your Resume</h3>
        {isValidUrl(resumeUrl) && (
          <a 
            href={resumeUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <FaDownload /> Download
          </a>
        )}
      </div>
      
      <div className="w-full bg-gradient-to-r from-[#1e1a2e] to-[#19172d] p-6 rounded-t-xl border border-[#2e2a3d]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[500px] bg-[#1f1e22]">
            <FaSpinner className="animate-spin text-blue-400 text-2xl" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[500px] p-6 text-center bg-[#1f1e22]">
            <FaExclamationTriangle className="text-amber-500 text-4xl mb-4" />
            <p className="text-gray-200 mb-2">Unable to load your resume</p>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        ) : !isValidUrl(resumeUrl) ? (
          <div className="flex flex-col items-center justify-center h-[500px] p-6 text-center bg-[#1f1e22]">
            <FaFilePdf className="text-purple-500 text-4xl mb-4" />
            <p className="text-gray-200 mb-2">No resume uploaded yet</p>
            <p className="text-sm text-gray-400">Upload a resume to see it here</p>
          </div>
        ) : (
          <div className="relative">
            <iframe
              src={safeResumeUrl || undefined}
              className="w-full h-[500px] border-0 bg-[#1f1e22]"
              title="Resume Preview"
            />
            
            {/* Simple page navigation controls */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <button 
                className="bg-[#2d2c31] hover:bg-[#3d3c41] text-gray-200 p-2 rounded-full shadow-md transition-all"
                aria-label="Previous page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button 
                className="bg-[#2d2c31] hover:bg-[#3d3c41] text-gray-200 p-2 rounded-full shadow-md transition-all"
                aria-label="Next page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
