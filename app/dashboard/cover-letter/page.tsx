'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/DashboardLayout';
import { FaSpinner, FaDownload, FaCopy, FaRedo } from 'react-icons/fa';
import './cover-letter-styles.css';
import { initializeVercelEnvironment } from './vercel-fix';

export default function CoverLetterPage() {
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

  // Show loading state during authentication check or before client-side hydration
  if (!isClient || status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen bg-[#0a192f]">Loading...</div>;
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (status === 'unauthenticated') {
    return null;
  }

  const handleGenerateCoverLetter = async () => {
    if (!jobDescription || !companyName || !position) {
      setError('Please fill in all fields');
      return;
    }

    setIsGenerating(true);
    setError('');
    setShowOutput(true); // Show the output box when generating
    
    try {
      // Get user name for personalization
      const userName = session?.user?.name || 'Applicant';
      
      try {
        // Try the AI API first
        // Create a prompt for the AI
        const prompt = [
          {
            role: 'system',
            content: `You are an expert cover letter writer. Create a professional, compelling cover letter for ${userName} who is applying for the position of ${position} at ${companyName}. \n\nThe cover letter should:\n- Be professionally formatted with date and proper salutation\n- Highlight relevant skills and experiences that match the job description\n- Show enthusiasm for the specific company and role\n- Be concise (around 300-400 words)\n- Have a professional closing\n- NOT include placeholder text like [Insert Experience Here]\n- NOT mention specific previous employers (keep it generic)\n- Focus on transferable skills and relevant qualifications`
          },
          {
            role: 'user',
            content: `Here is the job description for the ${position} role at ${companyName}:\n\n${jobDescription}\n\nPlease write me a customized cover letter that highlights my relevant skills and experiences for this position.`
          }
        ];
        
        // Call the AI API
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: prompt,
            model: 'deepseek/deepseek-chat:free', // Use the free model that's working
            temperature: 0.7, // Some creativity but still professional
            max_tokens: 1000 // Enough for a full cover letter
          }),
        });
        
        if (!response.ok) {
          throw new Error('API call failed');
        }
        
        const data = await response.json();
        const generatedLetter = data.choices[0].message.content;
        
        setCoverLetter(generatedLetter);
      } catch (apiError) {
        console.log('API generation failed, falling back to template:', apiError);
        
        // Fallback to template-based generation
        // Extract key skills from job description
        const skills = extractSkillsFromJobDescription(jobDescription);
        
        // Generate a cover letter using a template
        const generatedLetter = generateCoverLetterFromTemplate(
          companyName,
          position,
          skills,
          userName
        );
        
        setCoverLetter(generatedLetter);
      }
      
      setIsGenerating(false);
    } catch (err) {
      console.error('Error generating cover letter:', err);
      setError('Failed to generate cover letter. Please try again.');
      setIsGenerating(false);
    }
  };
  
  // Helper function to extract skills from job description (fallback method)
  const extractSkillsFromJobDescription = (jobDesc: string): string[] => {
    const commonSkills = [
      'communication', 'teamwork', 'leadership', 'problem-solving',
      'time management', 'adaptability', 'creativity', 'critical thinking',
      'project management', 'attention to detail', 'customer service',
      'technical skills', 'programming', 'data analysis', 'research',
      'writing', 'presentation', 'negotiation', 'organization'
    ];
    
    // Find skills mentioned in the job description
    const mentionedSkills = commonSkills.filter(skill => 
      jobDesc.toLowerCase().includes(skill.toLowerCase())
    );
    
    // If no skills found, return some generic ones
    return mentionedSkills.length > 0 ? 
      mentionedSkills : ['communication', 'problem-solving', 'adaptability'];
  };
  
  // Helper function to generate cover letter from template (fallback method)
  const generateCoverLetterFromTemplate = (company: string, position: string, skills: string[], applicantName: string): string => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const skillsText = skills.length > 2 ?
      `${skills.slice(0, -1).join(', ')}, and ${skills[skills.length - 1]}` :
      skills.join(' and ');
    
    return `${currentDate}

Dear Hiring Manager at ${company},

I am writing to express my interest in the ${position} position at ${company}. With my background and passion for delivering exceptional results, I believe I would be a valuable addition to your team.

Throughout my career, I have developed strong ${skillsText} skills that align perfectly with the requirements outlined in your job description. I am particularly drawn to ${company} because of your innovative approach and industry reputation.

In my previous roles, I have consistently demonstrated the ability to ${skills[0] || 'solve complex problems'} and ${skills[1] || 'communicate effectively'} with stakeholders at all levels. I am confident that these experiences have prepared me well for the challenges of the ${position} role at ${company}.

I am excited about the opportunity to bring my unique perspective and skills to your team. I would welcome the chance to discuss how my background and experiences would benefit ${company}.

Thank you for considering my application. I look forward to the possibility of working with you.

Sincerely,
${applicantName}`;
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

  return (
    <DashboardLayout>
      <div className="w-full px-4 py-8 md:max-w-7xl md:mx-auto cover-letter-page" id="cover-letter-page">
        <h1 className="text-xl font-bold text-white mb-8 cover-letter-title">Talexus Cover Letter Generator</h1>
        
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
              onClick={handleGenerateCoverLetter}
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
              <h2 className="text-xl font-semibold text-white">Your Cover Letter</h2>
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
                    onClick={handleGenerateCoverLetter}
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
              <div className="bg-[#1e293b] border border-gray-700 rounded-md p-4 h-[500px] overflow-y-auto whitespace-pre-wrap text-gray-200">
                {coverLetter}
              </div>
            ) : (
              <div className="bg-[#1e293b] border border-gray-700 rounded-md p-4 h-[500px] flex items-center justify-center text-gray-400">
                Your generated cover letter will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
