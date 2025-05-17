'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaChevronDown, FaChevronUp } from 'react-icons/fa';

// Progress Indicator Component
const ProgressIndicator = () => {
  return (
    <div className="mb-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="relative">
          {/* Progress Lines */}
          <div className="absolute left-0 right-0 top-4">
            {/* Line between Step 1 and 2 */}
            <div className="absolute left-[calc(16.666%+16px)] right-[calc(50%-16px)] h-1 rounded-full bg-gray-200">
              <div className="h-full w-full rounded-full bg-[#0e3a68]"></div>
            </div>
            {/* Line between Step 2 and 3 */}
            <div className="absolute left-[calc(50%+16px)] right-[calc(16.666%-16px)] h-1 rounded-full bg-gray-200">
              <div className="h-full w-full rounded-full bg-[#0e3a68]"></div>
            </div>
          </div>

          {/* Step Circles and Labels */}
          <div className="relative flex justify-between items-center w-full">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0e3a68] bg-white">
                <span className="text-base font-bold text-[#0e3a68]">1</span>
              </div>
              <div className="mt-3 flex flex-col items-center">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">STEP 1</span>
                <span className="mt-1 text-sm font-bold text-black">Key questions</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0e3a68] bg-[#0e3a68]">
                <span className="text-base font-medium text-white">2</span>
              </div>
              <div className="mt-3 flex flex-col items-center">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">STEP 2</span>
                <span className="mt-1 text-sm font-bold text-black">Resume review</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0e3a68] bg-[#0e3a68]">
                <span className="text-base font-medium text-white">3</span>
              </div>
              <div className="mt-3 flex flex-col items-center">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">STEP 3</span>
                <span className="mt-1 text-sm font-bold text-black">Finalize</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Collapsible Section Component
const CollapsibleSection = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full justify-between items-center text-left focus:outline-none"
      >
        <h2 className="text-xl font-helvetica-neue-bold text-[#0e3a68]">{title}</h2>
        {isOpen ? (
          <FaChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <FaChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default function FinalizePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [keyQuestions, setKeyQuestions] = useState<Record<string, string>>({});
  const [contactInfo, setContactInfo] = useState<Record<string, string>>({});
  const [experience, setExperience] = useState<Array<{
    id?: string;
    title?: string;
    company?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    [key: string]: any;
  }>>([]);
  const [education, setEducation] = useState<Array<{
    id?: string;
    school?: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    description?: string;
    [key: string]: any;
  }>>([]);
  const [skills, setSkills] = useState<string[]>([]);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        // Load Key Questions
        const savedQuestions = localStorage.getItem('keyQuestions');
        if (savedQuestions) {
          setKeyQuestions(JSON.parse(savedQuestions));
        }

        // Load Contact Info from the correct localStorage key
        const savedContactInfo = localStorage.getItem('contactInfo');
        if (savedContactInfo) {
          try {
            setContactInfo(JSON.parse(savedContactInfo));
          } catch (e) {
            console.error('Error parsing contact info:', e);
          }
        } else {
          // Try alternative sources
          const formData = localStorage.getItem('formData');
          if (formData) {
            try {
              setContactInfo(JSON.parse(formData));
            } catch (e) {
              console.error('Error parsing form data:', e);
            }
          } else {
            const resumeData = localStorage.getItem('resumeData');
            if (resumeData) {
              try {
                const parsedData = JSON.parse(resumeData);
                const contactInfoData: Record<string, string> = {};
                
                if (parsedData.name) {
                  contactInfoData.firstName = parsedData.name.first || '';
                  contactInfoData.lastName = parsedData.name.last || '';
                }
                
                contactInfoData.email = parsedData.email || '';
                contactInfoData.phone = parsedData.phone || '';
                
                if (Object.keys(contactInfoData).length > 0) {
                  setContactInfo(contactInfoData);
                }
              } catch (e) {
                console.error('Error parsing resume data:', e);
              }
            }
          }
        }

        // Load Experience - try different possible keys
        const experienceKeys = ['experienceData', 'workExperience', 'experience'];
        for (const key of experienceKeys) {
          const savedExperience = localStorage.getItem(key);
          if (savedExperience) {
            setExperience(JSON.parse(savedExperience));
            break;
          }
        }
        
        // If no experience found, try to extract from resume data
        if (experience.length === 0) {
          const resumeData = localStorage.getItem('resumeData');
          if (resumeData) {
            const parsedData = JSON.parse(resumeData);
            if (parsedData.work && Array.isArray(parsedData.work)) {
              setExperience(parsedData.work);
            } else if (parsedData.experience && Array.isArray(parsedData.experience)) {
              setExperience(parsedData.experience);
            }
          }
        }

        // Load Education
        const savedEducation = localStorage.getItem('educationData');
        if (savedEducation) {
          setEducation(JSON.parse(savedEducation));
        }

        // Load Skills
        const savedSkills = localStorage.getItem('skillsData');
        if (savedSkills) {
          setSkills(JSON.parse(savedSkills));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []);

  const handleBack = () => {
    router.push('/profile/skills');
  };

  const handleSubmit = () => {
    // Here you would typically submit all the data to your API
    alert('Profile completed successfully!');
    // Redirect to dashboard or another page
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fefcf9]">
      <main className="container mx-auto px-0 sm:px-4 py-5 sm:py-8 max-w-5xl">
        <ProgressIndicator />
        
        <div className="mx-auto max-w-4xl px-0 sm:px-6 lg:px-8 mt-8 w-full">
          <div className="bg-white rounded-lg border border-black/40 p-5 sm:p-6 mb-8 transform hover:translate-y-[-2px] transition-transform">
            <h1 className="text-3xl font-helvetica-neue-bold mb-4 text-[#0e3a68] text-center">Finalize</h1>
            <p className="text-lg font-helvetica-neue-bold text-[#0e3a68] mb-8 text-center">
              Check if all information is correct, and you're good to go!
            </p>
            
            {/* Key Questions Section */}
            <CollapsibleSection title="Key Questions">
              <div className="space-y-4">
                {Object.entries(keyQuestions).length > 0 ? (
                  <div className="bg-white rounded-lg border border-black/70 p-5 sm:p-6 relative w-full transform hover:translate-y-[-2px] transition-transform font-helvetica-neue-bold">
                    <div className="space-y-3">
                      {Object.entries(keyQuestions).map(([key, value]) => {
                        // Convert key from camelCase to readable format
                        let readableKey = key
                          .replace(/([A-Z])/g, ' $1') // Insert a space before all capital letters
                          .replace(/^./, str => str.toUpperCase()); // Capitalize the first letter
                        
                        // Map specific keys to full questions
                        const questionMap: Record<string, string> = {
                          'workAuth': 'Are you authorized to work in the United States?',
                          'sponsorship': 'Will you now or in the future require sponsorship to work in the United States?',
                          'felony': 'Have you ever been convicted of a felony?',
                          'startDate': 'When can you start a new job?',
                          'screening': 'Are you willing to conduct any sort of pre-employment screening that is required?',
                          'relocation': 'Are you willing to relocate for a job?',
                          'travel': 'Are you willing to travel for work?',
                          'workType': 'What type of work are you looking for?',
                          'workLocation': 'What is your preferred work location?',
                          'salary': 'What is your expected salary range?',
                          'experience': 'How many years of relevant experience do you have?',
                          'gender': 'What gender do you identify as?',
                          'pronouns': 'What are your desired pronouns?',
                          'ethnicity': 'Which race or ethnicity best describes you?',
                          'disability': 'Do you have a disability?',
                          'veteran': 'Are you a veteran?'
                        };
                        
                        const question = questionMap[key] || readableKey;
                        
                        return (
                          <div key={key} className="flex flex-col">
                            <h3 className="text-base font-helvetica-neue-bold text-[#1e293b]">{question}</h3>
                            <p className="text-sm font-helvetica leading-tight text-[#1e293b]">{value}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="font-helvetica text-gray-500 italic">No key questions data available.</p>
                )}
              </div>
            </CollapsibleSection>
            
            {/* Contact Information Section */}
            <CollapsibleSection title="Contact Information">
              <div className="space-y-4">
                <div className="bg-white rounded-lg border border-black/70 p-5 sm:p-6 relative w-full transform hover:translate-y-[-2px] transition-transform font-helvetica-neue-bold">
                  <div className="mb 6">
                    <h3 className="text-lg font-helvetica-neue-bold text-[#1e293b] mb-3">
                      {contactInfo.firstName || 'Mohammad'} {contactInfo.middleName || 'Daud'} {contactInfo.lastName || 'Khan'}
                    </h3>
                    <div className="space-y-1 text-base">
                      <p className="text-[#1e293b] font-helvetica leading-tight">
                        {contactInfo.address || '555 W Madison St. Apt-3303'}
                      </p>
                      <p className="text-[#1e293b] font-helvetica leading-tight">
                        {contactInfo.city || 'Chicago'}, {contactInfo.state || 'Illinois'}{contactInfo.postalCode ? ', ' + contactInfo.postalCode : ', 60661'}
                      </p>
                      <p className="text-[#1e293b] font-helvetica leading-tight">
                        {contactInfo.phone || '(146) 936-36867'}
                      </p>
                      <p className="text-[#1e293b] font-helvetica leading-tight">
                        {contactInfo.email || 'mohammaddaud.khan@northwestern.edu'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
            
            {/* Experience Section */}
            <CollapsibleSection title="Experience">
              <div className="space-y-4">
                {experience.length > 0 ? (
                  experience.map((exp, index) => (
                    <div key={index} className={`bg-white rounded-lg border border-black/70 p-5 sm:p-6 mb-6 relative w-full transform hover:translate-y-[-2px] transition-transform font-helvetica-neue-bold`}>
                      {/* Card Number */}
                      <div className="absolute top-0 left-0 w-10 h-10 flex items-center justify-center border-r border-b border-black/70 rounded-tl-lg rounded-br-lg">
                        <span className="text-lg font-helvetica-neue-bold text-[#64748b]">{index + 1}</span>
                      </div>

                      {/* Job Title and Company */}
                      <div className="pr-14 mt-4 ml-9">
                        <div className="flex flex-wrap items-baseline mb-1">
                          <h3 className="text-base sm:text-lg text-[#1e293b] font-helvetica-neue-bold">{exp.title || 'Bioinformatics Analyst'}</h3>
                          <span className="mx-2 text-gray-400">|</span>
                          <p className="text-base sm:text-lg text-[#1e293b] font-helvetica-neue-bold">{exp.company || 'Northwestern University'}</p>
                        </div>
                      </div>
                      
                      {/* Location and Date Range */}
                      <div className="mb-3 ml-9">
                        <p className="text-base">
                          <span className="text-[#64748b] font-helvetica-neue-bold">Location:</span> <span className="text-[#1e293b] font-helvetica-neue-bold">{exp.location || 'Dallas, TX'} | {exp.startDate || '9/2023'} - {exp.endDate || 'Present'}</span>
                        </p>
                      </div>

                      {/* Responsibilities */}
                      <ul className="list-disc pl-14 text-[#1e293b] text-base font-helvetica">
                        {exp.description ? (
                          // If there's a description, split it by newlines and display each line as a bullet point
                          exp.description.split('\n').map((item, i) => (
                            item.trim() && <li key={i} className="mb-2 font-helvetica">{item}</li>
                          ))
                        ) : (
                          // If no description, show the default bullet points
                          <>
                            <li className="mb-2 font-helvetica">Performed in-depth computational analysis and interpretation of transcriptomic data to investigate the critical role of TCF21 in Foxd1+ stromal progenitor differentiation during kidney development, culminating in a bioRxiv preprint publication.</li>
                            <li className="mb-2 font-helvetica">Conducted comprehensive transcriptomic analysis of disease-associated microglia (DAM) during NP-SLE progression in a time-course experiment, uncovering infiltration patterns and molecular changes correlating with disease severity.</li>
                            <li className="mb-2 font-helvetica">Analyzing bone chimeric dataset to investigate the infiltration of T-cells and DAM, with a focus on understanding immune cell dynamics and their potential contribution to disease progression, to identify molecular pathways and therapeutic targets.</li>
                            <li className="mb-2 font-helvetica">Collaborated with cross-functional teams to design and implement bioinformatics pipelines for high-throughput data analysis.</li>
                            <li className="mb-2 font-helvetica">Presented research findings at national conferences and contributed to grant applications and scientific publications.</li>
                          </>
                        )}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p className="font-helvetica text-gray-500 italic">No experience data available.</p>
                )}
              </div>
            </CollapsibleSection>
            
            {/* Education Section */}
            <CollapsibleSection title="Education">
              <div className="space-y-4">
                {education.length > 0 ? (
                  education.map((edu, index) => (
                    <div key={index} className="bg-white rounded-lg border border-black/70 p-5 sm:p-6 mb-6 relative w-full transform hover:translate-y-[-2px] transition-transform font-helvetica-neue-bold">
                      {/* Card Number */}
                      <div className="absolute top-0 left-0 w-10 h-10 flex items-center justify-center border-r border-b border-black/70 rounded-tl-lg rounded-br-lg">
                        <span className="text-lg font-helvetica-neue-bold text-[#64748b]">{index + 1}</span>
                      </div>
                      
                      <div className="pr-14 mt-3 ml-9">
                        <div className="flex flex-wrap items-baseline">
                          <h3 className="text-base sm:text-lg text-[#0e3a68] font-helvetica-neue-bold">{edu.degree || 'Masters'}</h3>
                          <span className="mx-2 text-gray-400">|</span>
                          <p className="text-base sm:text-lg text-[#0e3a68] font-helvetica-neue-bold">{edu.fieldOfStudy || 'Molecular & Cell Biology'}</p>
                        </div>
                        <p className="text-[#64748b] font-helvetica text-sm -mt-1">
                          {edu.school || 'University of Texas'} • {edu.startDate || 'Aug 2015'} - {edu.endDate || 'Dec 2017'}
                        </p>
                      </div>
                      
                      {edu.description && (
                        <div className="ml-9 mt-1">
                          <p className="text-sm font-helvetica leading-tight text-[#1e293b] whitespace-pre-line">
                            {edu.description.replace(/Grade:.*?\n/g, '').replace(/Location:.*?\n/g, '').replace(/Location:.*$/gm, '')}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="font-helvetica text-gray-500 italic">No education data available.</p>
                )}
              </div>
            </CollapsibleSection>
            
            {/* Skills Section */}
            <CollapsibleSection title="Skills">
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-lg border border-black/40 bg-[#f0f9ff] px-3 py-1.5 text-sm text-[#0e3a68] font-helvetica-neue-bold"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="font-helvetica text-gray-500 italic w-full">No skills data available.</p>
                )}
              </div>
            </CollapsibleSection>
          </div>
        </div>

        {/* Add custom font styles */}
        <style jsx global>{`
          .font-helvetica-neue-bold {
            font-family: 'Helvetica Neue Bold', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-weight: 700;
          }
          .font-helvetica-medium {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-weight: 500;
          }
          .font-helvetica-light-medium {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-weight: 600;
          }
          .font-helvetica {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          }
        `}</style>
        
        {/* Sticky Navigation - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <div className="mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-4 w-full max-w-4xl">
            <div className="flex justify-between items-center w-full">
              <button
                onClick={handleBack}
                className="flex items-center w-[80px] sm:w-[100px] rounded-lg border-2 border-[#0e3a68] px-4 sm:px-6 py-2 sm:py-2.5 text-[#0e3a68] text-sm sm:text-base transition-colors hover:bg-[#0e3a68]/5"
              >
                <FaArrowLeft className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center w-[80px] sm:w-[100px] rounded-lg border-2 border-[#0e3a68] px-4 sm:px-6 py-2 sm:py-2.5 bg-[#0e3a68] text-white text-sm sm:text-base font-medium transition-colors hover:bg-[#0c3156]"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
