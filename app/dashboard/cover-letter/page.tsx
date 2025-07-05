'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/DashboardLayout';
import FixedResumeSelector from '../../components/FixedResumeSelector';
import { FaSpinner, FaDownload, FaCopy, FaRedo, FaFileAlt, FaFileDownload } from 'react-icons/fa';
import './cover-letter-styles.css';
import { initializeVercelEnvironment } from './vercel-fix';
import CoverLetterTemplatesContainer from '../../components/CoverLetter/CoverLetterTemplatesContainer';
import MinimalCoverLetterTemplate from '../../components/CoverLetter/MinimalCoverLetterTemplate';

// Resume interface
interface Resume {
  id: string;
  name: string;
  storageName: string;
  createdAt: string;
  updatedAt: string;
  url: string;
  isTargeted?: boolean;
  parsedResumeId: string | null;
}

// Simple client component wrapper for dashboard layout
function ClientCoverLetterPage() {
  return (
    <DashboardLayout>
      <CoverLetterContent />
    </DashboardLayout>
  );
}

export default ClientCoverLetterPage;

// Main content component with all the logic
function CoverLetterContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [isAIGenerated, setIsAIGenerated] = useState(true); // Track if AI or fallback was used
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  const [resumeContent, setResumeContent] = useState<string>('');
  const [resumeOwnerName, setResumeOwnerName] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [coverLetterData, setCoverLetterData] = useState<any>(null);

  // This ensures we're only rendering on the client side
  useEffect(() => {
    setIsClient(true);
    // Initialize Vercel environment fixes
    initializeVercelEnvironment();
  }, []);

  // Handle authentication redirects in useEffect to avoid hydration issues
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);
  
  // Fetch resumes when the component mounts
  useEffect(() => {
    if (status === 'authenticated') {
      fetchResumes();
    }
  }, [status]);
  
  // Function to fetch resumes from the API
  const fetchResumes = async () => {
    try {
      setIsLoadingResumes(true);
      const res = await fetch(`/api/resume/list?t=${Date.now()}`);
      const data = await res.json();
      
      if (data.resumes && Array.isArray(data.resumes)) {
        console.log('[COVER-LETTER] Raw resumes from API:', data.resumes);
        
        // Show all resumes, even if they don't have a parsed ID
        const formattedResumes = data.resumes
          // Log instead of filtering out resumes without parsed IDs
          .map((r: any) => {
            if (!r.parsedResumeId) {
              console.log('[COVER-LETTER] Resume without parsed ID will use storage name instead:', r);
            }
            return r;
          })
          .map((r: any) => ({
            id: r.storageName, // Keep original ID for storage operations
            name: r.name,
            storageName: r.storageName,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            isTargeted: r.isTargeted === true,
            url: r.url,
            parsedResumeId: r.parsedResumeId, // Firestore ID for parsed resume
          }));
        
        setResumes(formattedResumes);
        
        // If there are resumes, select the first one by default
        if (formattedResumes.length > 0) {
          const firstResume = formattedResumes[0];
          console.log('[COVER-LETTER] Setting initial resume:', {
            id: firstResume.id,
            parsedResumeId: firstResume.parsedResumeId,
            name: firstResume.name
          });
          // Use parsedResumeId if available, otherwise fall back to storage name
          setSelectedResumeId(firstResume.parsedResumeId || firstResume.storageName || firstResume.id || '');
          console.log('[COVER-LETTER] Selected resume ID:', firstResume.parsedResumeId || firstResume.storageName || firstResume.id || '');
          fetchResumeContent(firstResume.url, firstResume);
        }
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
      setError('Failed to load resumes');
    } finally {
      setIsLoadingResumes(false);
    }
  };
  
  // Function to fetch resume content directly from the URL
  const fetchResumeContent = async (resumeUrl: string, resumeObj?: any) => {
    try {
      // Use the provided resume object or find it in the resumes array
      const selectedResume = resumeObj || resumes.find(r => r.url === resumeUrl);
      if (!selectedResume) {
        console.error('Selected resume not found');
        setResumeContent('Error: Selected resume not found. Please try again.');
        return "Candidate";
      }
      
      console.log('Selected resume:', selectedResume.name);
      setResumeContent('Fetching resume data...');
      
      // Extract the user's name from session data instead of resume name
      let ownerName = "";
      if (session?.user?.name) {
        // Use the actual user's name from their account
        ownerName = session.user.name;
        console.log('Using name from user account:', ownerName);
      } else if (selectedResume.name) {
        // Fall back to resume name if session name is not available
        ownerName = selectedResume.name;
        console.log('Using name from resume as fallback:', ownerName);
      } else {
        ownerName = "Candidate";
      }
      
      // Set the resume owner name for use in the cover letter
      setResumeOwnerName(ownerName);
      
      // For simplicity, we'll use the resume URL directly
      // This is the URL to the actual resume file (PDF or other format)
      // The GPT API will use this information along with the job description
      const resumeInfo = `
      RESUME INFORMATION:
      Name: ${selectedResume.name}
      Resume ID: ${selectedResume.id}
      
      IMPORTANT: This resume belongs to ${ownerName}. Generate a professional cover letter
      that highlights relevant skills and experiences for the position. Focus on creating
      a personalized cover letter that connects the candidate's background to the job requirements.
      `;
      
      setResumeContent(resumeInfo);
      console.log('Resume info prepared for cover letter generation');
      return ownerName;
    } catch (error) {
      console.error('Error in fetchResumeContent:', error);
      setResumeContent('Failed to fetch resume data. Please try again.');
      return "Candidate";
    }
  };

  // Handle resume selection change
  const handleResumeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const resumeId = e.target.value;
    setSelectedResumeId(resumeId);
    
    // Find the selected resume and fetch its content
    const selectedResume = resumes.find(resume => resume.id === resumeId);
    if (selectedResume) {
      // Pass both URL and resume object to fetchResumeContent
      fetchResumeContent(selectedResume.url, selectedResume);
      
      // Clear existing cover letter when changing resumes
      setCoverLetter('');
      setIsAIGenerated(false);
    }
  };

  // Show loading state during authentication check or before client-side hydration
  if (!isClient || status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen bg-[#0a192f]">Loading...</div>;
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (status === 'unauthenticated') {
    return null;
  }

  // Function to generate a cover letter
  const generateCoverLetter = async () => {
    if (!isClient) return;
    
    // Validate inputs
    if (!jobDescription.trim()) {
      setError('Please enter a job description.');
      return;
    }
    
    if (!selectedResumeId) {
      setError('Please select a resume.');
      return;
    }
    
    if (!companyName.trim()) {
      setError('Please enter a company name.');
      return;
    }
    
    if (!position.trim()) {
      setError('Please enter a position.');
      return;
    }
    
    setIsGenerating(true);
    setError('');
    setShowOutput(true);
    
    // Set a timeout to prevent indefinite loading
    const timeoutId = setTimeout(() => {
      if (isGenerating) {
        setIsGenerating(false);
        setError('Cover letter generation timed out. Please try again.');
      }
    }, 30000); // 30 second timeout
    
    try {
      // Find the selected resume
      const selectedResume = resumes.find(r => 
        (r.parsedResumeId === selectedResumeId) || 
        (r.storageName === selectedResumeId) || 
        (r.id === selectedResumeId)
      );
      
      console.log('[COVER-LETTER] Generating cover letter:', {
        selectedResumeId,
        selectedResume,
        allResumes: resumes.map(r => ({ 
          id: r.id, 
          parsedId: r.parsedResumeId, 
          storageName: r.storageName,
          name: r.name 
        }))
      });
      
      // Call the cover letter generation API
      const response = await fetch('/api/cover-letter/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription,
          position,
          companyName,
          resumeId: selectedResumeId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate cover letter');
      }
      
      if (data.coverLetter) {
        setCoverLetter(data.coverLetter);
        setIsAIGenerated(true); // Mark as AI-generated
        console.log('Cover letter generated successfully');
        console.log('Contact info from API:', data.contactInfo);
        
        // Use contact information from API response if available
        let parsedData;
        // Always prioritize the user's actual name from session
        const userName = session?.user?.name || resumeOwnerName;
        console.log('Using name for cover letter:', userName);
        
        if (data.contactInfo) {
          parsedData = parseCoverLetterForTemplate(data.coverLetter, userName);
          
          // Override with actual contact info from the resume
          parsedData.applicantPhone = data.contactInfo.phone || parsedData.applicantPhone;
          parsedData.applicantEmail = data.contactInfo.email || parsedData.applicantEmail;
          parsedData.applicantLinkedin = data.contactInfo.linkedin || parsedData.applicantLinkedin;
          parsedData.applicantLocation = data.contactInfo.location || parsedData.applicantLocation;
        } else {
          // Fallback to extracting from text if API didn't return contact info
          parsedData = parseCoverLetterForTemplate(data.coverLetter, userName);
        }
        
        setCoverLetterData(parsedData);
      } else {
        throw new Error('No cover letter returned from API');
      }
    } catch (err: any) {
      console.error('Error generating cover letter:', err);
      setError(`Failed to generate cover letter: ${err.message || 'Unknown error'}`);
      setCoverLetter('');
      setIsAIGenerated(false);
    } finally {
      clearTimeout(timeoutId);
      setIsGenerating(false);
    }
  };
  
  // Helper function to parse cover letter text into structured data for the template
  const parseCoverLetterForTemplate = (text: string, name: string) => {
    // Extract paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    
    // Try to extract contact information from the text
    const phoneMatch = text.match(/\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}/);
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/);
    const locationMatch = text.match(/[A-Za-z]+(,\s*[A-Za-z]+)?\s*,\s*[A-Z]{2}(\s+\d{5})?/);
    
    // DIRECT APPROACH: Extract the name from the first line of the raw text
    // This ensures we use the exact name that appears in the generated cover letter
    let extractedName = "";
    
    // First try to get the name from the first line of the text
    const firstLine = paragraphs[0]?.trim();
    if (firstLine && !firstLine.includes('@') && !firstLine.includes('linkedin')) {
      // The first line is likely the name
      extractedName = firstLine;
      console.log('Using name from first line of cover letter:', extractedName);
    } 
    // If that fails, look for patterns in the text
    else {
      // Look for patterns like "Sincerely, John Doe" or just "John Doe"
      const namePatterns = [
        /Sincerely,\s+([A-Z][a-z]+(\s+[A-Z][a-z]+)+)/,
        /Regards,\s+([A-Z][a-z]+(\s+[A-Z][a-z]+)+)/,
        /([A-Z][a-z]+(\s+[A-Z][a-z]+)+)\s+[\(\d]/,  // Name followed by phone
        /([A-Z][a-z]+\s+[A-Z][a-z]+)/  // Simple FirstName LastName
      ];
      
      for (const pattern of namePatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          extractedName = match[1];
          console.log('Extracted name from text pattern:', extractedName);
          break;
        }
      }
    }
    
    // If we still don't have a name, use the provided name or default
    if (!extractedName) {
      extractedName = name || "Applicant";
      console.log('Using fallback name:', extractedName);
    }
    
    // Default data structure with extracted contact info if available
    const data: {
      applicantName: string;
      applicantTitle: string;
      applicantPhone: string;
      applicantEmail: string;
      applicantLinkedin: string;
      applicantLocation: string;
      recipientSalutation: string;
      bodyParagraphs: string[];
      closingSalutation: string;
      signatureName: string;
    } = {
      applicantName: extractedName,
      applicantTitle: position || "Job Position",
      applicantPhone: phoneMatch ? phoneMatch[0] : "(555) 123-4567",
      applicantEmail: emailMatch ? emailMatch[0] : "example@email.com",
      applicantLinkedin: linkedinMatch ? linkedinMatch[0] : "linkedin.com/in/applicant",
      applicantLocation: locationMatch ? locationMatch[0] : "City, State",
      recipientSalutation: "Dear Hiring Manager,",
      bodyParagraphs: [],
      closingSalutation: "Sincerely,",
      signatureName: extractedName
    };
    
    // Filter out contact information and duplicates from paragraphs
    const seenSalutations = new Set<string>();
    const filteredParagraphs = paragraphs.filter(para => {
      // Skip paragraphs that look like contact information
      const isContactInfo = (
        (para.includes('@') && para.includes('.com')) || // Email
        !!para.match(/\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}/) || // Phone number
        para.includes('linkedin.com') || // LinkedIn
        !!para.match(/[A-Za-z]+(,\s*[A-Za-z]+)?\s*,\s*[A-Z]{2}(\s+\d{5})?/) // Address
      );
      
      // Check if this is a duplicate salutation
      const isSalutation = para.includes('Dear') || para.includes('To') || para.includes('Hello');
      if (isSalutation) {
        if (seenSalutations.has(para)) {
          return false; // Skip duplicate salutations
        }
        seenSalutations.add(para);
      }
      
      return !isContactInfo;
    });
    
    // Create a working copy of filtered paragraphs
    const workingParagraphs = [...filteredParagraphs];
    
    // Set body paragraphs, excluding salutation and closing
    if (workingParagraphs.length > 0) {
      // Try to extract salutation from first paragraph
      const firstPara = workingParagraphs[0];
      if (firstPara && (firstPara.includes('Dear') || firstPara.includes('To') || firstPara.includes('Hello'))) {
        data.recipientSalutation = firstPara;
        workingParagraphs.shift(); // Remove salutation from working paragraphs
      }
      
      // Try to extract closing from last paragraph
      const lastPara = workingParagraphs[workingParagraphs.length - 1];
      if (lastPara && (lastPara.includes('Sincerely') || lastPara.includes('Regards') || lastPara.includes('Yours'))) {
        const closingParts = lastPara.split(',');
        if (closingParts.length > 0) {
          data.closingSalutation = closingParts[0] + ',';
          if (closingParts.length > 1) {
            data.signatureName = closingParts.slice(1).join(',').trim();
          }
          workingParagraphs.pop(); // Remove closing from working paragraphs
        }
      }
      
      // Assign the remaining paragraphs to bodyParagraphs
      data.bodyParagraphs = workingParagraphs;
    }
    
    // If no paragraphs left, add a placeholder
    if (data.bodyParagraphs.length === 0) {
      data.bodyParagraphs = ['Your cover letter content will appear here.'];
    }
    
    return data;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([coverLetter], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Cover_Letter_${companyName}_${position}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  // Function to handle downloading the cover letter as PDF (to be implemented)
  const handleDownloadPDF = () => {
    // This would require a PDF generation library
    // For now, we'll just alert the user
    alert('PDF download functionality will be implemented soon!');
  };

  // Handle resume selection
  const handleSelectResume = (resumeId: string, resume: Resume) => {
    setSelectedResumeId(resumeId);
    fetchResumeContent(resume.url, resume);
    // Clear existing cover letter when changing resumes
    setCoverLetter('');
    setIsAIGenerated(false);
  };

  // Handle resume upload completion
  const handleResumeUploaded = async () => {
    console.log('Resume uploaded, refreshing list');
    // Refresh the resume list
    await fetchResumes();
    // The fetchResumes function already updates the state internally
  };

  return (
      <div className="w-full px-4 py-8 md:max-w-7xl md:mx-auto cover-letter-page" id="cover-letter-page">
        <h1 className="text-xl font-bold text-white mb-8 cover-letter-title">Talexus Cover Letter Generator</h1>
        
        {isClient && (
          <FixedResumeSelector 
            resumes={resumes}
            isLoadingResumes={isLoadingResumes}
            selectedResumeId={selectedResumeId}
            onSelectResume={handleSelectResume}
            onResumeUploaded={handleResumeUploaded}
          />
        )}
        
        {/* Cover Letter Templates Container - Placed under resume toggle and upload box */}
        <div className="mb-8 mt-6 bg-[#0d1b2a] rounded-lg p-6 shadow-lg border border-[#1e2d3d]">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white mb-4">Select a template</h2>
            
            <div className="flex gap-4 mb-6">
              {/* Minimal Template Option - Better proportioned thumbnail */}
              <div 
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${selectedTemplate === 'minimal' ? 'border-[#2563eb]' : 'border-gray-700'} hover:border-[#2563eb] transition-all duration-200 w-60`}
                onClick={() => setSelectedTemplate('minimal')}
              >
                <div className="bg-white p-3 flex flex-col h-56">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-sm uppercase">SAMPLE NAME</h3>
                      <p className="text-[#2563eb] text-xs mb-1">Data Analyst Intern</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-gray-600">
                        <div className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                          (558) 333-1333
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                          example@email.com
                        </div>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                  </div>
                  
                  <div className="mt-3 border-t border-gray-200 pt-2">
                    <p className="text-[9px] font-medium mb-1">COVER LETTER</p>
                    <p className="text-[8px] text-gray-500 mb-1">Dear Hiring Manager,</p>
                    <div className="space-y-1">
                      <div className="h-1 bg-gray-100 rounded w-full"></div>
                      <div className="h-1 bg-gray-100 rounded w-5/6"></div>
                      <div className="h-1 bg-gray-100 rounded w-full"></div>
                      <div className="h-1 bg-gray-100 rounded w-4/5"></div>
                    </div>
                  </div>
                </div>
                {selectedTemplate === 'minimal' && (
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-[#2563eb] rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="bg-[#0a192f] text-center py-2 text-white">
                  <span className="text-[#2563eb] font-medium text-xs">Minimal</span>
                </div>
              </div>
              
              {/* Future template options will be added here - Better proportioned thumbnail */}
              <div className="relative cursor-not-allowed rounded-lg overflow-hidden border-2 border-gray-700 opacity-60 w-60">
                <div className="bg-white p-3 flex flex-col h-56">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-sm">Coming Soon</h3>
                      <p className="text-gray-500 text-xs mb-1">Modern Template</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-gray-400">
                        <div className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          Contact Info
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          Details
                        </div>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                  </div>
                  
                  <div className="mt-3 border-t border-gray-200 pt-2">
                    <p className="text-[9px] font-medium text-gray-400 mb-1">MODERN DESIGN</p>
                    <div className="space-y-1">
                      <div className="h-1 bg-gray-100 rounded w-full"></div>
                      <div className="h-1 bg-gray-100 rounded w-5/6"></div>
                      <div className="h-1 bg-gray-100 rounded w-full"></div>
                      <div className="h-1 bg-gray-100 rounded w-4/5"></div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#0a192f] text-center py-2 text-white">
                  <span className="text-gray-400 text-xs">Modern</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Only show the full template when a template is selected */}
          {selectedTemplate && (
            <div className="bg-white rounded-md overflow-hidden w-full max-w-full">
              {/* Download buttons for formatted template */}
              {coverLetter && (
                <div className="bg-[#0a192f] p-3 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      // Create text file download
                      const element = document.createElement('a');
                      const file = new Blob([coverLetter], {type: 'text/plain'});
                      element.href = URL.createObjectURL(file);
                      element.download = `Cover_Letter_${companyName}_${position}.txt`;
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                    className="bg-[#1e293b] hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition duration-300"
                    title="Download as text file"
                  >
                    <FaDownload /> Text
                  </button>
                  <button
                    onClick={() => {
                      // Get the template element
                      const templateElement = document.querySelector('.bg-white > div');
                      if (!templateElement) return;
                      
                      // Create a clone of the template to modify for printing
                      const clonedTemplate = templateElement.cloneNode(true) as HTMLElement;
                      
                      // Create a new window for the PDF version
                      const printWindow = window.open('', '_blank');
                      if (!printWindow) return;
                      
                      // Write the HTML content to the new window
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Cover Letter - ${companyName} - ${position}</title>
                            <style>
                              @media print {
                                @page { margin: 0.5in; }
                                body { font-family: Arial, sans-serif; color: #000; }
                                h1 { margin-bottom: 5px; }
                                .contact-info { margin-bottom: 20px; }
                                p { margin-bottom: 15px; line-height: 1.5; }
                                button, [contenteditable="true"] { border: none !important; outline: none !important; }
                              }
                              body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
                              h1 { margin-bottom: 5px; }
                              .contact-info { margin-bottom: 20px; }
                              p { margin-bottom: 15px; line-height: 1.5; }
                              [contenteditable="true"] { border: none; outline: none; }
                            </style>
                          </head>
                          <body>
                            <div id="cover-letter-content"></div>
                            <div style="margin-top: 20px; text-align: center;">
                              <button onclick="window.print();" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                Print/Save as PDF
                              </button>
                            </div>
                            <script>
                              document.getElementById('cover-letter-content').innerHTML = templateElement.outerHTML;
                              // Remove any edit buttons or controls
                              document.querySelectorAll('[contenteditable="true"]').forEach(el => {
                                el.setAttribute('contenteditable', 'false');
                              });
                            </script>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                    }}
                    className="bg-[#2563eb] hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition duration-300"
                    title="Download as PDF"
                  >
                    <FaFileDownload /> PDF
                  </button>
                </div>
              )}
              <MinimalCoverLetterTemplate 
                data={coverLetter ? 
                  parseCoverLetterForTemplate(coverLetter, session?.user?.name || resumeOwnerName) : 
                  {
                    applicantName: session?.user?.name || resumeOwnerName || "Applicant Name",
                    applicantTitle: position || "Job Position",
                    applicantPhone: "(555) 123-4567",
                    applicantEmail: "example@email.com",
                    applicantLinkedin: "linkedin.com/in/applicant",
                    applicantLocation: "City, State",
                    recipientSalutation: "Dear Hiring Manager,",
                    bodyParagraphs: ["Your cover letter content will appear here after you generate it."],
                    closingSalutation: "Sincerely,",
                    signatureName: session?.user?.name || resumeOwnerName || "Applicant Name"
                  }
                }
                isEditable={true}
              />
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-[#0d1b2a] rounded-lg p-6 shadow-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Job Details</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 sm:px-4 py-3 text-gray-100 text-base focus:outline-none focus:border-[#2563eb] transition shadow-inner w-full"
                placeholder="Enter company name"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Position</label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 sm:px-4 py-3 text-gray-100 text-base focus:outline-none focus:border-[#2563eb] transition shadow-inner w-full"
                placeholder="Enter job position"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-1">Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="bg-[#0d1b2a] border border-[#1e2d3d] rounded-md px-3 sm:px-4 py-3 text-gray-100 text-base focus:outline-none focus:border-[#2563eb] transition shadow-inner w-full h-40"
                placeholder="Paste job description here"
              />
            </div>
            
            {error && <p className="text-red-500 mb-4">{error}</p>}
            
            <button
              onClick={generateCoverLetter}
              disabled={isGenerating}
              className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                'Generate Cover Letter'
              )}
            </button>
          </div>
          
          {/* Output - Hidden on mobile until generate button is clicked */}
          <div className={`bg-[#0d1b2a] rounded-lg p-6 shadow-lg border border-gray-700 cover-letter-output ${!showOutput ? 'hidden lg:block' : 'block'}`}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-white">Your Cover Letter</h2>
                {coverLetter && (
                  <span className={`ml-3 text-xs px-2 py-1 rounded ${isAIGenerated ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'}`}>
                    {isAIGenerated ? 'AI Generated' : 'Template Fallback'}
                  </span>
                )}
              </div>
              {coverLetter && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopy}
                    className="bg-[#1e293b] hover:bg-gray-700 text-white p-2 rounded-md transition duration-300"
                    title="Copy to clipboard"
                  >
                    <FaCopy />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="bg-[#1e293b] hover:bg-gray-700 text-white p-2 rounded-md transition duration-300"
                    title="Download as text file"
                  >
                    <FaDownload />
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="bg-[#1e293b] hover:bg-gray-700 text-white p-2 rounded-md transition duration-300"
                    title="Download as PDF"
                  >
                    <FaFileDownload />
                  </button>
                  <button
                    onClick={generateCoverLetter}
                    className="bg-[#1e293b] hover:bg-gray-700 text-white p-2 rounded-md transition duration-300"
                    title="Regenerate"
                    disabled={isGenerating}
                  >
                    {isGenerating ? <FaSpinner className="animate-spin" /> : <FaRedo />}
                  </button>
                </div>
              )}
            </div>
            
            {coverLetter ? (
              <div className="bg-[#1e293b] border border-gray-700 rounded-md p-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Raw Text</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedTemplate('minimal')}
                      className={`px-3 py-1 text-xs font-medium ${selectedTemplate === 'minimal' ? 'bg-[#2563eb] text-white' : 'bg-[#1e293b] text-gray-300'} rounded border border-gray-700 hover:bg-[#2563eb] hover:text-white focus:ring-2 focus:ring-blue-500`}
                    >
                      View Template
                    </button>
                  </div>
                </div>
                <div className="whitespace-pre-wrap text-gray-200 h-[500px] overflow-y-auto p-4 bg-[#0a192f] rounded-md">
                  {coverLetter}
                </div>
              </div>
            ) : (
              <div className="bg-[#1e293b] border border-gray-700 rounded-md p-4 h-[500px] flex items-center justify-center text-gray-400">
                Your generated cover letter will appear here
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
