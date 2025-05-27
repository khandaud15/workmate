'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaSpinner, FaExclamationTriangle, FaFilePdf, FaDownload, FaEdit } from 'react-icons/fa';
import Link from 'next/link';

export default function ResumePage() {
  const { data: session } = useSession();
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [parsedResumeData, setParsedResumeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResumeData = async () => {
      if (!session?.user?.email) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch the profile data which contains the resume URL
        const response = await fetch(`/api/profile?t=${Date.now()}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch resume data');
        }
        
        const data = await response.json();
        
        // Verify the data belongs to the current user
        if (data.userEmail !== session.user.email) {
          throw new Error('Security verification failed');
        }
        
        // Check if we have a raw resume URL and parsed resume data
        if (data.rawResumeUrl) {
          setResumeUrl(data.rawResumeUrl);
        }
        
        if (data.parsedResumeData) {
          setParsedResumeData(data.parsedResumeData);
        }
        
        if (!data.rawResumeUrl && !data.parsedResumeData) {
          setError('No resume found. Please upload a resume first.');
        }
      } catch (err) {
        console.error('Error fetching resume:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResumeData();
  }, [session]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-[#0e0c12] text-white">
        <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
        <p className="text-gray-400">Loading your resume...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-[#0e0c12] text-white">
        <FaExclamationTriangle className="text-4xl text-yellow-500 mb-4" />
        <p className="text-gray-300 text-center">{error}</p>
        <Link 
          href="/onboarding/resume" 
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
        >
          Upload Resume
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0c12] text-white p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          
          <div className="flex gap-3">
            <Link 
              href="/profile/resume-upload" 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
            >
              <FaEdit /> Edit Resume
            </Link>
            {resumeUrl && (
              <a 
                href={resumeUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
              >
                <FaDownload /> Download
              </a>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resume PDF Viewer */}
          <div className="bg-[#1f1e22] rounded-xl shadow-sm overflow-hidden" style={{ height: '80vh' }}>
            {resumeUrl ? (
              <iframe 
                src={resumeUrl} 
                className="w-full h-full border-0" 
                title="Resume Preview"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <FaFilePdf className="text-5xl text-gray-400 mb-4" />
                <p className="text-gray-300 text-center">No resume PDF found</p>
              </div>
            )}
          </div>
          
          {/* Parsed Resume Data */}
          <div className="bg-[#1f1e22] rounded-xl shadow-sm p-6 overflow-auto" style={{ height: '80vh' }}>
            <h2 className="text-xl font-semibold mb-4">Resume Information</h2>
            
            {parsedResumeData ? (
              <div className="space-y-6">
                {/* Contact Information */}
                {(parsedResumeData.name || parsedResumeData.email || parsedResumeData.phone) && (
                  <div className="bg-[#2d2c31] p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2 text-blue-400">Contact Information</h3>
                    <div className="space-y-2">
                      {parsedResumeData.name && <p><span className="text-gray-400">Name:</span> {parsedResumeData.name}</p>}
                      {parsedResumeData.email && <p><span className="text-gray-400">Email:</span> {parsedResumeData.email}</p>}
                      {parsedResumeData.phone && <p><span className="text-gray-400">Phone:</span> {parsedResumeData.phone}</p>}
                      {parsedResumeData.address && <p><span className="text-gray-400">Address:</span> {typeof parsedResumeData.address === 'string' ? parsedResumeData.address : JSON.stringify(parsedResumeData.address)}</p>}
                      {parsedResumeData.linkedin && <p><span className="text-gray-400">LinkedIn:</span> {parsedResumeData.linkedin}</p>}
                    </div>
                  </div>
                )}
                
                {/* Work Experience */}
                {parsedResumeData['Work Experience'] && Array.isArray(parsedResumeData['Work Experience']) && (
                  <div className="bg-[#2d2c31] p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2 text-green-400">Work Experience</h3>
                    <div className="space-y-4">
                      {parsedResumeData['Work Experience'].map((exp: any, index: number) => (
                        <div key={index} className="border-l-2 border-gray-700 pl-4 py-1">
                          <p className="font-medium">{exp.jobTitle || exp.title || exp.position || 'Position'}</p>
                          <p className="text-sm text-gray-400">{exp.company || exp.employer || exp.organization || 'Company'}</p>
                          <p className="text-xs text-gray-500">
                            {exp.startDate || exp.start_date || ''} 
                            {(exp.endDate || exp.end_date) ? ` - ${exp.endDate || exp.end_date}` : ' - Present'}
                          </p>
                          {exp.responsibilities && Array.isArray(exp.responsibilities) && (
                            <ul className="list-disc list-inside text-sm mt-2 text-gray-300">
                              {exp.responsibilities.slice(0, 2).map((resp: string, i: number) => (
                                <li key={i}>{resp}</li>
                              ))}
                              {exp.responsibilities.length > 2 && <li>...</li>}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Education */}
                {parsedResumeData.Education && Array.isArray(parsedResumeData.Education) && (
                  <div className="bg-[#2d2c31] p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2 text-purple-400">Education</h3>
                    <div className="space-y-4">
                      {parsedResumeData.Education.map((edu: any, index: number) => (
                        <div key={index} className="border-l-2 border-gray-700 pl-4 py-1">
                          <p className="font-medium">{edu.degree || edu.Degree || 'Degree'}</p>
                          <p className="text-sm text-gray-400">{edu.school || edu.School || edu.university || edu.University || 'School'}</p>
                          <p className="text-xs text-gray-500">
                            {edu.startDate || edu.start_date || ''} 
                            {(edu.endDate || edu.end_date) ? ` - ${edu.endDate || edu.end_date}` : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Skills */}
                {parsedResumeData.Skills && Array.isArray(parsedResumeData.Skills) && (
                  <div className="bg-[#2d2c31] p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2 text-yellow-400">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {parsedResumeData.Skills.map((skill: any, index: number) => (
                        <span key={index} className="px-2 py-1 bg-gray-700 rounded-md text-sm">
                          {typeof skill === 'string' ? skill : JSON.stringify(skill)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-gray-400">No parsed resume data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
