'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/DashboardLayout';
import FixedResumeSelector from '../../components/FixedResumeSelector';
import { FaSpinner, FaDownload, FaCopy, FaRedo, FaFileAlt, FaFileDownload } from 'react-icons/fa';
import Script from 'next/script';
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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
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
  
  interface CoverLetterData {
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
  }

  // Helper function to parse cover letter text into structured data for the template
  const parseCoverLetterForTemplate = (text: string, name: string): CoverLetterData => {
    // Split text into lines and paragraphs
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    
    // Initialize data with defaults
    let extractedName = name;
    let currentTitle = "";
    let location = "";
    let email = "";
    let phone = "";
    let linkedin = "";
    
    // Extract header information (first 3-4 lines)
    if (lines.length >= 2) {
      // First line is name
      extractedName = lines[0];
      
      // Second line is current title
      currentTitle = lines[1];
      
      // Try to find location in the first few lines
      const locationLine = lines.find(line => 
        line.match(/[A-Za-z]+(,\s*[A-Za-z]+)?\s*,\s*[A-Z]{2}/) &&
        !line.includes('@') &&
        !line.includes('linkedin.com') &&
        !line.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/)
      );
      if (locationLine) {
        location = locationLine;
      }
      
      // Look for contact info line (contains email, phone, or LinkedIn)
      const contactLine = lines.find(line => 
        line.includes('@') || 
        line.includes('linkedin.com') || 
        line.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/)
      );
      
      if (contactLine) {
        // Split contact line by common separators
        const parts = contactLine.split(/[\s|•]+/).map(part => part.trim());
        
        parts.forEach(part => {
          if (part.includes('@')) {
            email = part;
          } else if (part.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/)) {
            phone = part;
          } else if (part.includes('linkedin.com')) {
            linkedin = part;
          }
        });
      }
    }
    
    // Find salutation
    const salutation = paragraphs.find(p => p.startsWith('Dear'));
    
    // Find the closing section and signature
    const closingIndex = paragraphs.findIndex(p => 
      p.toLowerCase().trim() === 'sincerely,' ||
      p.toLowerCase().trim() === 'sincerely' ||
      p.toLowerCase().includes('best regards') ||
      p.toLowerCase().includes('yours truly')
    );

    let closingSignature = extractedName;
    
    // Extract body paragraphs (excluding header, closing, and signature)
    const bodyParagraphs = paragraphs.filter((p, index) => {
      // Skip header info
      const isHeaderInfo = 
        p.includes(extractedName) ||
        p.includes(email) ||
        p.includes(phone) ||
        p.includes(linkedin) ||
        p.includes(location) ||
        p.startsWith('Dear');
      
      // Skip closing and signature
      const isClosing = 
        p.toLowerCase().includes('sincerely') ||
        p.toLowerCase().includes('best regards') ||
        p.toLowerCase().includes('yours truly');
      
      // Skip signature line
      const isSignature = index === closingIndex + 1;
      
      return !isHeaderInfo && !isClosing && !isSignature;
    });
    
    // Get signature if it exists
    if (closingIndex >= 0 && closingIndex + 1 < paragraphs.length) {
      const nameParagraph = paragraphs[closingIndex + 1].trim();
      if (nameParagraph && !nameParagraph.toLowerCase().includes('dear')) {
        closingSignature = nameParagraph;
      }
    }
    
    // Return structured data
    return {
      applicantName: extractedName,
      applicantTitle: currentTitle || 'Professional',
      applicantPhone: phone,
      applicantEmail: email,
      applicantLinkedin: linkedin,
      applicantLocation: location,
      recipientSalutation: salutation || 'Dear Hiring Manager,',
      bodyParagraphs: bodyParagraphs,
      closingSalutation: 'Sincerely,',
      signatureName: closingSignature
    };
  };

  const handleCopy = async () => {
    if (!coverLetter) return;
    try {
      await navigator.clipboard.writeText(coverLetter);
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownload = () => {
    if (!coverLetter) return;
    const element = document.createElement('a');
    const file = new Blob([coverLetter], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'cover-letter.txt';
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
            
            {/* Use our enhanced CoverLetterTemplatesContainer for template selection */}
            <div className="mb-6">
              <CoverLetterTemplatesContainer
                selectedTemplate={selectedTemplate}
                onSelectTemplate={(template) => setSelectedTemplate(template)}
              />
            </div>
            
            {/* Legacy template options - can be removed once new component is fully integrated */}
            <div className="flex gap-4 mb-6 hidden">
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
            <div className="bg-white rounded-md overflow-hidden w-full max-w-full cover-letter-output">
              {/* Download buttons for formatted template */}
              {coverLetter && (
                <div className="bg-[#0a192f] p-3 flex justify-end gap-3">
                  <button
                    onClick={async () => {
                      try {
                        // Show loading indicator
                        setIsGeneratingPDF(true);
                        
                        // Get the actual rendered cover letter template element
                        // Make sure we're only getting the cover letter content, not the buttons
                        const coverLetterOutput = document.querySelector('.cover-letter-output');
                        const coverLetterElement = coverLetterOutput?.querySelector('.bg-white');
                        if (!coverLetterElement) {
                          console.error('Could not find cover letter element');
                          alert('Could not find cover letter content to download. Please try again.');
                          setIsGeneratingPDF(false);
                          return;
                        }
                        
                        // Set a clean filename
                        const filename = `Cover_Letter_${companyName || 'Company'}_${position || 'Position'}.pdf`.replace(/\s+/g, '_');
                        
                        // Create a clone of the element to avoid modifying the original
                        const clonedElement = coverLetterElement.cloneNode(true) as HTMLElement;
                        
                        // Remove any contenteditable attributes for the PDF
                        const editableElements = clonedElement.querySelectorAll('[contenteditable="true"]');
                        editableElements.forEach(el => {
                          el.removeAttribute('contenteditable');
                        });
                        
                        // Create a temporary container with proper styling for PDF output
                        const container = document.createElement('div');
                        container.style.position = 'absolute';
                        container.style.left = '-9999px';
                        container.style.width = '8.5in';
                        container.style.height = 'auto';
                        container.style.backgroundColor = 'white';
                        container.style.padding = '0';
                        container.style.margin = '0';
                        container.style.overflow = 'hidden';
                        
                        // Apply specific styling to the cloned element
                        clonedElement.style.width = '100%';
                        clonedElement.style.height = 'auto';
                        clonedElement.style.minHeight = '11in';
                        clonedElement.style.padding = '0.5in';
                        clonedElement.style.boxSizing = 'border-box';
                        clonedElement.style.backgroundColor = 'white';
                        clonedElement.style.position = 'relative';
                        
                        // Remove any buttons or controls that might be in the template
                        const elementsToRemove = clonedElement.querySelectorAll('button, .controls, .edit-controls, .photo-control');
                        elementsToRemove.forEach(element => element.remove());
                        
                        container.appendChild(clonedElement);
                        document.body.appendChild(container);
                        
                        // Dynamically import html2canvas and jsPDF
                        const html2canvas = (await import('html2canvas')).default;
                        const { jsPDF } = await import('jspdf');
                        
                        // Use html2canvas to capture the element as an image
                        const canvas = await html2canvas(clonedElement, {
                          scale: 2, // Higher scale for better quality
                          useCORS: true, // Allow loading cross-origin images
                          logging: false,
                          backgroundColor: '#ffffff',
                          windowWidth: clonedElement.scrollWidth,
                          windowHeight: clonedElement.scrollHeight
                        });
                        
                        // Calculate dimensions
                        const imgWidth = 8.5; // Letter width in inches
                        const imgHeight = (canvas.height * imgWidth) / canvas.width;
                        
                        // Create PDF with proper dimensions
                        const pdf = new jsPDF({
                          orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
                          unit: 'in',
                          format: [imgWidth, imgHeight]
                        });
                        
                        // Add the image to the PDF
                        const imgData = canvas.toDataURL('image/jpeg', 1.0);
                        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
                        
                        // Save the PDF
                        pdf.save(filename);
                        
                        // Clean up
                        document.body.removeChild(container);
                        setIsGeneratingPDF(false);
                      } catch (error) {
                        console.error('Error generating PDF:', error);
                        alert('There was an error generating your PDF. Please try again.');
                        setIsGeneratingPDF(false);
                      }
                    }}
                    className="bg-[#0d1b2a] hover:bg-[#1e2d3d] text-white px-4 py-2 rounded-md flex items-center gap-2 transition duration-300 font-medium border border-[#1e2d3d]"
                    title="Download as PDF"
                    disabled={isGeneratingPDF}
                  >
                    {isGeneratingPDF ? (
                      <>
                        <FaSpinner className="animate-spin" /> Generating PDF...
                      </>
                    ) : (
                      <>
                        <FaFileDownload /> Download PDF
                      </>
                    )}
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
