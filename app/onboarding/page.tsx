'use client';

import Link from 'next/link';
import Image from 'next/image';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { FaBars, FaTimes, FaChevronRight, FaFileAlt, FaBriefcase, FaDollarSign, FaMapMarkerAlt, FaCheckCircle, FaArrowLeft, FaUpload, FaCheck, FaSearch, FaCreditCard } from 'react-icons/fa';

export default function Onboarding() {
  // State variables for UI components
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [showJobTitles, setShowJobTitles] = useState(false);
  const [showSalary, setShowSalary] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [salary, setSalary] = useState(50); // Starting at $50k
  const [searchTerm, setSearchTerm] = useState('');
  const [locationSearchTerm, setLocationSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [includeRemote, setIncludeRemote] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  
  // Sample locations data
  const sampleLocations = [
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Phoenix, AZ',
    'Philadelphia, PA',
    'San Antonio, TX',
    'San Diego, CA',
    'Dallas, TX',
    'San Jose, CA',
    'London, UK',
    'Berlin, Germany',
    'Toronto, Canada',
    'Sydney, Australia',
    'Paris, France',
    'Austin, TX',
    'Seattle, WA',
    'Denver, CO',
    'Boston, MA',
    'Atlanta, GA'
  ];

  // Comprehensive list of job titles across various industries (no duplicates)
  const mockJobTitles = [
    // Technology & Engineering
    'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'DevOps Engineer', 'Site Reliability Engineer', 'Cloud Architect', 'Systems Administrator',
    'Network Engineer', 'Security Engineer', 'QA Engineer', 'Test Automation Engineer',
    'Mobile Developer', 'iOS Developer', 'Android Developer', 'Game Developer', 'Unity Developer',
    'Embedded Systems Engineer', 'Firmware Engineer', 'Hardware Engineer', 'Robotics Engineer',
    'Blockchain Developer', 'Solidity Developer', 'Web3 Developer', 'AR/VR Developer',
    'Computer Vision Engineer', 'NLP Engineer', 'Data Engineer', 'ETL Developer', 'Database Administrator',
    'Data Architect', 'Business Intelligence Developer', 'Analytics Engineer',
    
    // Data Science & AI
    'Data Scientist', 'Machine Learning Engineer', 'AI Researcher', 'MLOps Engineer',
    'Data Analyst', 'Business Analyst', 'Quantitative Analyst', 'Statistician',
    'Bioinformatician', 'Computational Biologist', 'Research Engineer',
    
    // Design & Creative
    'UX Designer', 'UI Designer', 'Product Designer', 'Interaction Designer',
    'Visual Designer', 'Graphic Designer', 'Motion Designer', '3D Artist',
    'Game Designer', 'Level Designer', 'Creative Director', 'Art Director',
    'Multimedia Artist', 'Animator', 'Illustrator', 'Photographer', 'Videographer',
    'Video Editor', 'Sound Designer', 'Music Producer', 'Content Creator', 'Copywriter',
    'Technical Writer', 'Content Strategist', 'Content Marketer',
    
    // Product & Project Management
    'Product Manager', 'Technical Product Manager', 'Product Owner', 'Product Marketing Manager',
    'Project Manager', 'Technical Program Manager', 'Scrum Master', 'Agile Coach',
    'Program Manager', 'Delivery Manager', 'Engineering Manager',
    
    // Business & Management
    'CEO', 'CTO', 'CIO', 'CFO', 'COO', 'CMO', 'CPO', 'CDO',
    'Vice President', 'Director', 'Senior Manager', 'Manager', 'Team Lead',
    'Business Development Manager', 'Partnerships Manager', 'Account Executive',
    'Sales Director', 'Sales Manager', 'Account Manager', 'Business Analyst',
    'Management Consultant', 'Strategy Consultant', 'Operations Manager',
    
    // Marketing & Communications
    'Digital Marketing Manager', 'SEO Specialist', 'SEM Specialist', 'PPC Specialist',
    'Social Media Manager', 'Community Manager', 'Brand Manager', 'Marketing Director',
    'Growth Marketing Manager', 'Performance Marketing Manager', 'Email Marketing Specialist',
    'Content Marketing Manager', 'Public Relations Manager', 'Media Planner',
    'Influencer Marketing Manager', 'Affiliate Marketing Manager',
    
    // Finance & Accounting
    'Financial Analyst', 'Investment Banker', 'Portfolio Manager', 'Hedge Fund Manager',
    'Private Equity Associate', 'Venture Capitalist', 'Financial Advisor', 'Accountant',
    'CPA', 'Auditor', 'Tax Consultant', 'Financial Controller', 'Treasury Analyst',
    'Risk Manager', 'Compliance Officer', 'Actuary', 'Underwriter',
    
    // Healthcare & Life Sciences
    'Physician', 'Surgeon', 'Dentist', 'Psychiatrist', 'Psychologist', 'Therapist',
    'Registered Nurse', 'Nurse Practitioner', 'Physician Assistant', 'Pharmacist',
    'Clinical Research Associate', 'Epidemiologist', 'Biomedical Engineer', 
    'Biotechnologist', 'Genetic Counselor', 'Healthcare Administrator', 'Medical Director',
    
    // Bioinformatics & Computational Biology
    'Genomic Data Scientist', 'Bioinformatics Scientist', 'Bioinformatics Analyst', 
    'Bioinformatics Engineer', 'Computational Genomics Scientist', 'Systems Biologist', 
    'Cheminformatician', 'Proteomics Data Analyst', 'Metabolomics Specialist', 
    'Phylogeneticist', 'Biostatistician', 'Computational Chemist', 'Structural Biologist',
    'NGS Data Analyst', 'Genome Analyst', 'Transcriptomics Specialist',
    'Single-Cell Genomics Scientist', 'Clinical Bioinformatician',
    'Microbiome Data Scientist', 'Vaccine Bioinformatics Specialist',
    'Cancer Genomics Researcher', 'Population Geneticist',
    'Evolutionary Biologist', 'Protein Engineer',
    
    // Molecular & Cellular Biology
    'Molecular Biologist', 'Cell Biologist', 'Molecular Geneticist',
    'Molecular Diagnostics Specialist', 'CRISPR Specialist', 'Gene Therapy Researcher',
    'Stem Cell Biologist', 'Immunologist', 'Virologist', 'Bacteriologist',
    'Microbiologist', 'Cell Culture Specialist', 'Protein Biochemist',
    'Enzymologist', 'Molecular Pathologist', 'Toxicologist',
    'Pharmacogenomics Scientist', 'Synthetic Biologist',
    'Molecular Imaging Specialist', 'Flow Cytometry Specialist',
    
    // Research Science & Biotech/Pharma
    'Research Scientist', 'Principal Investigator', 'Postdoctoral Researcher',
    'Research Associate', 'Lab Manager', 'Research Technician',
    'Clinical Research Coordinator', 'Research Fellow', 'Scientific Officer',
    'Field Application Scientist', 'Scientific Program Manager',
    'Translational Scientist', 'Preclinical Researcher', 'Formulation Scientist',
    'Assay Development Scientist', 'Biomarker Scientist', 'Toxicology Scientist',
    'Regulatory Affairs Specialist', 'Quality Control Scientist',
    'Process Development Scientist', 'Manufacturing Science and Technology (MSAT) Specialist',
    'Automation Scientist', 'High-Throughput Screening Specialist',
    'Biobank Manager', 'Research Compliance Officer',
    'Scientific Writer', 'Medical Science Liaison',
    'Biotechnology Research Scientist', 'Biopharmaceutical Scientist',
    'Drug Discovery Scientist', 'Therapeutic Antibody Engineer',
    'Vaccine Development Scientist', 'Cell Therapy Specialist',
    'Gene Therapy Scientist', 'Biomanufacturing Specialist',
    'Process Development Engineer', 'Fermentation Scientist',
    'Downstream Processing Specialist', 'Analytical Development Scientist',
    'Formulation Development Scientist', 'CMC Specialist',
    'Regulatory Affairs Manager', 'Clinical Trial Manager',
    'Medical Affairs Specialist', 'Pharmacovigilance Scientist',
    
    // Education & Research
    'Professor', 'Teacher', 'Lecturer', 'Education Consultant', 'Curriculum Developer', 
    'Instructional Designer', 'Librarian', 'Archivist', 'Museum Curator',
    
    // Legal
    'Lawyer', 'Attorney', 'Corporate Counsel', 'Legal Counsel', 'Paralegal',
    'Legal Assistant', 'Intellectual Property Attorney',
    'Immigration Lawyer', 'Family Lawyer', 'Criminal Defense Attorney',
    
    // Skilled Trades & Manufacturing
    'Electrician', 'Plumber', 'Carpenter', 'Welder', 'Machinist', 'Mechanic',
    'HVAC Technician', 'Construction Manager', 'Civil Engineer', 'Architect',
    'Industrial Designer', 'Manufacturing Engineer', 'Quality Assurance Inspector',
    'Production Supervisor',
    
    // Hospitality & Food Service
    'Executive Chef', 'Sous Chef', 'Pastry Chef', 'Restaurant Manager', 'Hotel Manager',
    'Event Planner', 'Catering Manager', 'Food and Beverage Director', 'Sommelier',
    'Bar Manager', 'Mixologist',
    
    // Retail & Customer Service
    'Retail Manager', 'Store Manager', 'Visual Merchandiser', 'Buyer', 'Merchandiser',
    'Customer Success Manager', 'Customer Support Specialist', 'Call Center Manager',
    
    // Transportation & Logistics
    'Logistics Manager', 'Supply Chain Manager', 'Procurement Manager', 'Warehouse Manager',
    'Fleet Manager', 'Transportation Manager', 'Operations Analyst',
    
    // Media & Entertainment
    'Journalist', 'Editor', 'Publisher', 'Producer', 'Director', 'Screenwriter',
    'Actor', 'Musician', 'Composer', 'Set Designer', 'Costume Designer',
    'Casting Director', 'Talent Agent',
    
    // Non-Profit & Social Services
    'Social Worker', 'Case Manager', 'Nonprofit Director', 'Grant Writer',
    'Fundraising Manager', 'Program Coordinator', 'Community Outreach Coordinator',
    
    // Government & Policy
    'Policy Analyst', 'Legislative Assistant', 'Public Administrator', 'Urban Planner',
    'Diplomat', 'Foreign Service Officer', 'Intelligence Analyst',
    
    // Science & Research
    'Laboratory Technician', 'Chemist', 'Biologist', 'Physicist',
    'Astronomer', 'Geologist', 'Meteorologist', 'Oceanographer', 'Environmental Scientist',
    'Wildlife Biologist', 'Zoologist', 'Botanist',
    
    // Real Estate
    'Real Estate Agent', 'Real Estate Broker', 'Property Manager', 'Real Estate Developer',
    'Appraiser', 'Real Estate Analyst',
    
    // Human Resources
    'HR Manager', 'Recruiter', 'Talent Acquisition Specialist', 'HR Business Partner',
    'Compensation Analyst', 'Learning and Development Manager', 'Diversity and Inclusion Manager',
    
    // Agriculture & Environment
    'Agricultural Scientist', 'Conservation Scientist', 'Forester', 'Horticulturist',
    'Environmental Engineer', 'Sustainability Consultant',
    
    // Aviation & Aerospace
    'Aerospace Engineer', 'Aircraft Mechanic', 'Airline Pilot', 'Flight Attendant',
    'Air Traffic Controller', 'Aerospace Technician',
    
    // Sports & Fitness
    'Personal Trainer', 'Athletic Trainer', 'Sports Coach', 'Fitness Instructor',
    'Sports Medicine Physician', 'Sports Agent', 'Athletic Director'
  ];
  
  // Update job title suggestions based on search term
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = mockJobTitles.filter(title =>
        title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);
  
  // Update location suggestions based on search term
  useEffect(() => {
    if (locationSearchTerm.trim()) {
      const filtered = sampleLocations.filter(location =>
        location.toLowerCase().includes(locationSearchTerm.toLowerCase()) &&
        !selectedLocations.includes(location)
      );
      setLocationSuggestions(filtered);
    } else {
      setLocationSuggestions([]);
    }
  }, [locationSearchTerm, selectedLocations]);
  

  
  // Handle job title search
  useEffect(() => {
    // Simulate job title suggestions based on search term
    if (searchTerm.trim() !== '') {
      const filtered = mockJobTitles.filter(title => 
        title.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);
  
  const handleSelectTitle = (title: string) => {
    if (selectedTitles.length < 5 && !selectedTitles.includes(title)) {
      setSelectedTitles([...selectedTitles, title]);
      setSearchTerm('');
      setSuggestions([]);
    }
  };
  
  const handleRemoveTitle = (title: string) => {
    setSelectedTitles(selectedTitles.filter(t => t !== title));
  };
  
  const handleSelectLocation = (location: string) => {
    if (selectedLocations.length < 5 && !selectedLocations.includes(location)) {
      setSelectedLocations([...selectedLocations, location]);
      setLocationSearchTerm('');
      setLocationSuggestions([]);
    }
  };
  
  const handleRemoveLocation = (location: string) => {
    setSelectedLocations(selectedLocations.filter(loc => loc !== location));
  };
  
  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isSidebarOpen && !target.closest('.sidebar') && !target.closest('.sidebar-toggle')) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);
  
  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (showJobTitles) {
        setShowJobTitles(false);
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    // Add to history when job titles are shown
    if (showJobTitles) {
      window.history.pushState({ jobTitles: true }, '');
    }

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [showJobTitles]);
  
  // Handle back button click
  const handleBackClick = () => {
    if (showLocation) {
      setShowSalary(true);
      setShowLocation(false);
    } else if (showSalary) {
      setShowJobTitles(true);
      setShowSalary(false);
    } else if (showJobTitles) {
      setShowResumeUpload(true);
      setShowJobTitles(false);
    } else if (showResumeUpload) {
      setShowResumeUpload(false);
    }
  };
  
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('uploading');
      // Simulate upload process
      setTimeout(() => {
        setUploadStatus('success');
      }, 1500);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-[#0f0f11]">

      
      {/* Sidebar */}
      {/* Mobile Toggle Button */}
      {!isSidebarOpen && (
        <button
          className="fixed left-0 top-1/2 transform -translate-y-1/2 z-50 bg-[#7a64c2] text-white p-2 rounded-r-lg shadow-lg lg:hidden sidebar-toggle"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <FaChevronRight size={16} />
        </button>
      )}
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <div
        className={`sidebar ${isSidebarOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Onboarding navigation"
      >
        {/* Close Button for mobile */}
        {isSidebarOpen && (
          <button
            className="absolute right-4 top-4 z-50 text-white hover:text-gray-200 transition-colors lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <FaTimes size={20} />
          </button>
        )}
        <div className="top-section">
          <div className="flex items-center gap-2.5 pl-2">
            <div className="w-5 h-5 bg-gradient-to-br from-[#d8f1eb] to-[#9bd6c4] rounded transform rotate-45"
              style={{ boxShadow: '2px 2px 5px rgba(0,0,0,0.2), -1px -1px 3px rgba(255,255,255,0.4)' }}
            />
            <div className="text-lg font-semibold text-white">Talexus AI</div>
          </div>
          {/* User avatar/info section (matches dashboard) */}
          <div 
            className="user hover:bg-white/5 rounded-lg transition-colors duration-200 p-2 -mx-2 cursor-pointer"
            onClick={() => {
              setShowAccountSettings(true);
              setShowLocation(false);
              setShowSalary(false);
              setShowJobTitles(false);
              setShowResumeUpload(false);
            }}
          >
            <div className="flex items-center gap-3">
              <img
                src={session?.user?.image || 'https://randomuser.me/api/portraits/men/75.jpg'}
                alt="User Avatar"
                className="w-11 h-11 rounded-full object-cover flex-shrink-0"
              />
              <div className="user-info min-w-0">
                <div className="text-sm font-medium text-white truncate">{session?.user?.name || 'User'}</div>
                <div className="text-xs text-gray-300 truncate">Manage Account (Free Plan)</div>
              </div>
            </div>
          </div>
          <div className="menu-group">
            <div 
              className="menu-label cursor-pointer hover:text-purple-300 transition-colors flex items-center"
              onClick={() => {
                setShowResumeUpload(false);
                setShowJobTitles(false);
                setShowSalary(false);
                setShowLocation(false);
                setShowAccountSettings(false);
                setIsSidebarOpen(false); // Close sidebar on mobile
              }}
            >
              <span>Getting Started</span>
            </div>
            <button 
              onClick={() => {
                setShowResumeUpload(true);
                setShowJobTitles(false);
                setShowSalary(false);
                setShowLocation(false);
                setShowAccountSettings(false);
                setIsSidebarOpen(false); // Close sidebar on mobile
              }} 
              className="menu-item"
            >
              <FaFileAlt className="icon" /><span>Upload Resume</span>
            </button>
            <button 
              onClick={() => {
                setShowJobTitles(true);
                setShowResumeUpload(false);
                setShowSalary(false);
                setShowLocation(false);
                setShowAccountSettings(false);
                setIsSidebarOpen(false); // Close sidebar on mobile
              }} 
              className="menu-item text-left w-full"
            >
              <FaBriefcase className="icon" /><span>Job Title</span>
            </button>
            <button 
              onClick={() => {
                setShowSalary(true);
                setShowJobTitles(false);
                setShowResumeUpload(false);
                setShowLocation(false);
                setShowAccountSettings(false);
                setIsSidebarOpen(false); // Close sidebar on mobile
              }} 
              className="menu-item text-left w-full"
            >
              <FaDollarSign className="icon" /><span>Salary</span>
            </button>
            <button 
              onClick={() => {
                setShowLocation(true);
                setShowSalary(false);
                setShowJobTitles(false);
                setShowResumeUpload(false);
                setShowAccountSettings(false);
                setIsSidebarOpen(false); // Close sidebar on mobile
              }} 
              className="menu-item text-left w-full"
            >
              <FaMapMarkerAlt className="icon" /><span>Location</span>
            </button>
            <a href="#finish" className="menu-item"><FaCheckCircle className="icon" /><span>Finish</span></a>
          </div>
          
          {/* Sidebar menu items end */}
        </div>
        <div className="bottom-card">
          <strong>Need help?</strong>
          <p>Contact support for onboarding assistance</p>
          <button>Contact Us</button>
        </div>
      </div>
      {/* Main onboarding content */}
      <main className="flex-1 flex items-center justify-center min-h-screen overflow-auto pt-4 lg:pt-0 transition-all duration-300 lg:ml-0 bg-[#0e0c12] text-white">
        {showAccountSettings ? (
          <div className="w-[calc(100%-1rem)] max-w-4xl text-center border border-gray-700 rounded-xl pt-8 pb-10 px-6 bg-[#12101a]/50 mx-auto mt-[2px]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Account</h1>
                <p className="text-gray-400 text-sm">Manage billing and account settings</p>
              </div>
              {/* Cross button removed as requested */}
            </div>

            <div className="bg-[#1f1e22] rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img 
                    src={session?.user?.image || 'https://randomuser.me/api/portraits/men/75.jpg'} 
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-white font-medium text-sm">{session?.user?.name || 'User'}</h3>
                    <p className="text-gray-400 text-xs">{session?.user?.email || 'No email provided'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="bg-white text-black px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>

            <div className="bg-[#1f1e22] rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#2a2830] rounded-lg">
                    <FaCreditCard className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">Manage Billing Information</h3>
                    <p className="text-gray-400 text-xs">Manage, upgrade or cancel your plan</p>
                  </div>
                </div>
                <button className="bg-white text-black px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                  Manage
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Current Plan</h2>
              <p className="text-gray-400 mb-6">Free Plan</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Trial Access Card */}
                <div className="bg-[#1f1e22] rounded-[14px] p-6 border-2 border-transparent transition duration-300 hover:border-[#6f60e2] hover:shadow-[0_0_16px_2px_rgba(111,96,226,0.3)] mt-2">
                  <div className="text-lg font-semibold mb-1">Trial Access</div>
                  <div className="text-2xl font-bold mb-2">$2.95</div>
                  <div className="text-sm text-gray-300 mt-3 mb-2 space-y-1">
                    <div><span className="text-[#2ecc71] mr-2">&#10003;</span>AI-powered job search</div>
                    <div><span className="text-[#2ecc71] mr-2">&#10003;</span>Auto-fill your applications</div>
                    <div><span className="text-[#2ecc71] mr-2">&#10003;</span>Full access with unlimited applications</div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">Try it risk-free • Money-back guarantee • Cancel anytime</div>
                </div>

                {/* 3 Month Full Access Card */}
                <div className="bg-[#1f1e22] rounded-[14px] p-6 border-2 border-transparent transition duration-300 hover:border-[#6f60e2] hover:shadow-[0_0_16px_2px_rgba(111,96,226,0.3)] focus-within:shadow-[0_0_16px_2px_rgba(111,96,226,0.3)] mt-2">
                  <div className="text-lg font-semibold mb-1 flex items-center">3 Month Full Access <span className="ml-2 bg-[#2ecc71] text-black text-[11px] px-2 py-0.5 rounded-full">RECOMMENDED</span></div>
                  <div className="text-2xl font-bold mb-2">$13.95<span className="text-base font-normal">/mo</span></div>
                  <div className="text-sm text-gray-300 mt-3 mb-2 space-y-1">
                    <div><span className="text-[#2ecc71] mr-2">&#10003;</span>AI-powered job search</div>
                    <div><span className="text-[#2ecc71] mr-2">&#10003;</span>Auto-fill your applications</div>
                    <div><span className="text-[#2ecc71] mr-2">&#10003;</span>Full access with unlimited applications</div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">$41.85 up front • Cancel anytime</div>
                </div>

                {/* 6 Month Full Access Card */}
                <div className="bg-[#1f1e22] rounded-[14px] p-6 border-2 border-transparent transition duration-300 hover:border-[#6f60e2] hover:shadow-[0_0_16px_2px_rgba(111,96,226,0.3)] mt-2">
                  <div className="text-lg font-semibold mb-1">6 Month Full Access</div>
                  <div className="text-2xl font-bold mb-2">$10.95<span className="text-base font-normal">/mo</span></div>
                  <div className="text-sm text-gray-300 mt-3 mb-2 space-y-1">
                    <div><span className="text-[#2ecc71] mr-2">&#10003;</span>AI-powered job search</div>
                    <div><span className="text-[#2ecc71] mr-2">&#10003;</span>Auto-fill your applications</div>
                    <div><span className="text-[#2ecc71] mr-2">&#10003;</span>Full access with unlimited applications</div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">$65.70 up front • Save 63% • Cancel anytime</div>
                </div>
              </div>
            </div>
          </div>
        ) : !showResumeUpload && !showJobTitles && !showSalary && !showLocation && (
          <div className="w-[calc(100%-1rem)] max-w-5xl text-center mt-24 border border-gray-700 rounded-xl pt-8 pb-10 px-6 bg-[#12101a]/50 mx-auto mt-2">
            <h2 className="text-[28px] font-semibold mb-2">Let's set you up for success!</h2>
            <p className="text-[#a0a0a0] text-[15px] mb-8">Automate your job search in 3 simple steps.</p>

            <div className="card-container flex flex-col md:flex-row gap-6 justify-center w-full items-center md:items-stretch mt-2">
              {/* Card 1 - Resume Upload */}
              <div 
                className="card w-[95%] md:w-[300px] h-[300px] bg-gradient-to-br from-[#1e1b2d] to-[#0f0e15] border border-[#282630] rounded-[20px] p-5 shadow-[0_10px_40px_rgba(168,85,247,0.15)] transition-all duration-300 hover:border-[#a855f7] hover:scale-[1.04] hover:shadow-[0_0_18px_rgba(168,85,247,0.35)] flex flex-col justify-between md:max-w-none"
              >
                <div className="text-left pt-0">
                  <h2 className="text-[1.2rem] mb-2 font-semibold text-white text-left">Upload your resume.</h2>
                  <p className="text-[#a3a3a3] text-[0.95rem] mb-3 text-left">Help us understand your experience.</p>
                  <div className="badge bg-[#6d28d9] text-white text-[14px] rounded-[8px] py-[6px] px-[14px] inline-block mb-3">
                    Resume.pdf
                  </div>
                  <ul className="features list-none p-0 m-0 text-[0.95rem] text-left leading-tight">
                    <li className="mb-[4px] text-[#d4d4d4] before:content-['✔'] before:text-[#a855f7] before:mr-2">Personal Information</li>
                    <li className="mb-[4px] text-[#d4d4d4] before:content-['✔'] before:text-[#a855f7] before:mr-2">Experience</li>
                    <li className="mb-[4px] text-[#d4d4d4] before:content-['✔'] before:text-[#a855f7] before:mr-2">Skills</li>
                    <li className="mb-[4px] text-[#d4d4d4] before:content-['✔'] before:text-[#a855f7] before:mr-2">Education</li>
                    <li className="mb-[4px] text-[#d4d4d4] before:content-['✔'] before:text-[#a855f7] before:mr-2">Summary...</li>
                  </ul>
                </div>
              </div>

              {/* Card 2 - Job Titles */}
              <div
                className="card w-[95%] md:w-[300px] h-[300px] bg-gradient-to-br from-[#1e1b2d] to-[#0f0e15] border border-[#282630] rounded-[20px] p-5 shadow-[0_10px_40px_rgba(168,85,247,0.15)] transition-all duration-300 hover:border-[#a855f7] hover:scale-[1.04] hover:shadow-[0_0_18px_rgba(168,85,247,0.35)] flex flex-col justify-between md:max-w-none"
              >
                <div className="text-left pt-0">
                  <h2 className="text-[1.2rem] mb-2 font-semibold text-white text-left">Complete a quick profile.</h2>
                  <p className="text-[#a3a3a3] text-[0.95rem] mb-3 text-left">Share your preferences and career goals.</p>
                  <p className="text-[0.95rem] mb-2 text-left"><span className="bold text-white font-semibold">Desired job?</span><br/>Project Manager</p>
                  <p className="text-[0.95rem] mb-2 text-left"><span className="bold text-white font-semibold">Your desired salary:</span><br/>$110,000</p>
                  <p className="text-[0.95rem] text-left"><span className="bold text-white font-semibold">Where do you want to work?</span><br/>New York, NY</p>
                </div>
              </div>

              {/* Card 3 - Job Applications */}
              <div 
                className="card w-[95%] md:w-[300px] h-[300px] bg-gradient-to-br from-[#1e1b2d] to-[#0f0e15] border border-[#282630] rounded-[20px] p-5 shadow-[0_10px_40px_rgba(168,85,247,0.15)] transition-all duration-300 hover:border-[#a855f7] hover:scale-[1.04] hover:shadow-[0_0_18px_rgba(168,85,247,0.35)] flex flex-col justify-between md:max-w-none"
              >
                <div className="text-left pt-0">
                  <h2 className="text-[1.2rem] mb-2 font-semibold text-white text-left">We find jobs and fill out applications.</h2>
                  <p className="text-[#a3a3a3] text-[0.95rem] mb-3 text-left">Sit back while we do the heavy lifting.</p>
                  <div className="badge bg-[#6d28d9] text-white text-[14px] rounded-[8px] py-[6px] px-[14px] inline-block mb-2">
                    Resume.pdf
                  </div>
                  <a className="match-link text-[#60a5fa] no-underline font-medium block my-[10px] text-left" href="#">15 job matches</a>
                  <div className="job-item text-[0.95rem] mb-1 text-left">A Software Developer <span className="applied text-[#22c55e] font-bold ml-[10px]">Applied</span></div>
                  <div className="job-item text-[0.95rem] text-left">G Business Analyst <span className="applied text-[#22c55e] font-bold ml-[10px]">Applied</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {showResumeUpload && !showJobTitles && !showSalary && (
          <div className="w-[calc(100%-1rem)] max-w-2xl text-center mt-24 border border-gray-700 rounded-xl pt-8 pb-10 px-6 bg-[#12101a]/50 mx-auto mt-2">
            <div className="mb-6">
              {/* Back button removed as requested */}
            </div>
            
            <div 
              onClick={triggerFileInput}
              className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-all ${uploadStatus === 'success' ? 'border-green-500 bg-green-500/10' : 'border-gray-600 hover:border-purple-500 hover:bg-purple-500/5'}`}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleUpload}
              />
              
              {uploadStatus === 'success' ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCheck className="text-green-500" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Resume uploaded successfully!</h3>
                  <p className="text-gray-400">{selectedFile?.name}</p>
                </div>
              ) : uploadStatus === 'uploading' ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full border-4 border-t-purple-500 border-r-purple-300 border-b-purple-200 border-l-purple-400 animate-spin mb-4"></div>
                  <h3 className="text-xl font-semibold text-white mb-2">Uploading...</h3>
                  <p className="text-gray-400">{selectedFile?.name}</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUpload className="text-purple-400" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Select your resume file</h3>
                  <p className="text-gray-400">Drag and drop or click to browse</p>
                  <p className="text-gray-500 text-sm mt-2">Supported formats: PDF, DOC, DOCX</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 flex justify-between">
              <button 
                onClick={() => {
                  setShowResumeUpload(false);
                  if (uploadStatus !== 'success') {
                    setSelectedFile(null);
                    setUploadStatus('idle');
                  }
                }}
                className="w-24 px-3 py-2 text-sm border border-gray-600 rounded-lg text-white hover:bg-gray-800 transition-colors flex items-center justify-center"
              >
                Cancel
              </button>
              
              <button 
                onClick={() => {
                  if (uploadStatus === 'success') {
                    setShowResumeUpload(false);
                    setShowJobTitles(true);
                  } else {
                    triggerFileInput();
                  }
                }}
                className={`w-24 px-3 py-2 text-sm rounded-lg ${uploadStatus === 'success' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'} text-white transition-colors`}
              >
                {uploadStatus === 'success' ? 'Next' : 'Next'}
              </button>
            </div>
          </div>
        )}
        
        {showJobTitles && !showSalary && (
          <div className="w-[calc(100%-1rem)] max-w-2xl text-center mt-24 border border-gray-700 rounded-xl pt-8 pb-10 px-6 bg-[#12101a]/50 mx-auto mt-2">
            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 mt-2">
              {/* Headers */}
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">
                  What kind of jobs are you looking for?
                </h1>
                <p className="text-base text-gray-400">
                  We recommend up to 5 titles to get a great list of jobs.
                </p>
              </div>
              
              {/* Selected Titles */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedTitles.map((title) => (
                    <div
                      key={title}
                      className="flex items-center bg-purple-900/30 border border-purple-500 text-purple-100 px-3 py-1.5 rounded-full text-sm"
                    >
                      {title}
                      <button
                        onClick={() => handleRemoveTitle(title)}
                        className="ml-2 text-purple-300 hover:text-white"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for job titles..."
                    className="w-full bg-[#1a1625] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-[#1a1625] border border-gray-700 rounded-lg shadow-lg">
                      {suggestions.map((title) => (
                        <div
                          key={title}
                          onClick={() => handleSelectTitle(title)}
                          className="px-4 py-2 text-white hover:bg-purple-900/50 cursor-pointer"
                        >
                          {title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="mt-8">
              <div className="flex justify-between items-center w-full">
                <button
                  onClick={handleBackClick}
                  className="w-24 px-3 py-2 text-sm border border-gray-600 rounded-lg text-white hover:bg-gray-800 transition-colors flex items-center justify-center"
                >
                  <FaArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={() => {
                    if (selectedTitles.length > 0) {
                      setShowJobTitles(false);
                      setShowSalary(true);
                    }
                  }}
                  disabled={selectedTitles.length === 0}
                  className={`w-24 px-3 py-2 text-sm rounded-lg text-white transition-colors ${selectedTitles.length > 0 ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 opacity-50 cursor-not-allowed'}`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Salary Section */}
        {showSalary && (
          <div className="w-[calc(100%-1rem)] max-w-2xl text-center mt-24 border border-gray-700 rounded-xl pt-8 pb-10 px-6 bg-[#12101a]/50 mx-auto mt-2">
            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 mt-2">
              {/* Headers */}
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">
                  How much would you like to earn?
                </h1>
                <p className="text-base text-gray-400">
                  This helps us find jobs matching your compensation requirements.
                </p>
              </div>
              
              {/* Salary Slider */}
              <div className="mb-16">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="salary-range"
                      className="block text-lg font-medium text-gray-300"
                    >
                      Minimum desired compensation
                    </label>
                    <span className="w-[120px] text-right text-lg font-medium text-white">
                      {salary >= 1000 ? `$${(salary / 1000).toFixed(0)}M annually` : `$${salary}k annually`}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="relative w-full">
                      <input
                        type="range"
                        id="salary-range"
                        min="30"
                        max="500"
                        value={salary}
                        onChange={(e) => setSalary(Number(e.target.value))}
                        className="w-full"
                        style={{
                          '--progress': `${((salary - 30) / (500 - 30)) * 100}%`
                        } as React.CSSProperties}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="mt-8">
              <div className="flex justify-between items-center w-full">
                <button
                  onClick={handleBackClick}
                  className="w-24 px-3 py-2 text-sm border border-gray-600 rounded-lg text-white hover:bg-gray-800 transition-colors flex items-center justify-center"
                >
                  <FaArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={() => {
                    setShowSalary(false);
                    setShowLocation(true);
                    setShowAccountSettings(false);
                  }}
                  className="w-24 px-3 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Location Section */}
        {showLocation && (
          <div className="w-[calc(100%-1rem)] max-w-2xl text-center mt-24 border border-gray-700 rounded-xl pt-8 pb-10 px-6 bg-[#12101a]/50 mx-auto mt-2">
            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 mt-2">
              {/* Headers */}
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">
                  Where do you want to work?
                </h1>
                <p className="text-base text-gray-400">
                  Add multiple locations to cast a wider net.
                </p>
              </div>
              
              {/* Location Selection */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedLocations.map((location) => (
                    <div
                      key={location}
                      className="flex items-center bg-purple-900/30 border border-purple-500 text-purple-100 px-3 py-1.5 rounded-full text-sm"
                    >
                      {location}
                      <button
                        onClick={() => handleRemoveLocation(location)}
                        className="ml-2 text-purple-300 hover:text-white"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Search Input */}
                <div className="relative">
                  <div className="relative flex items-center">
                    <FaSearch className="absolute left-4 text-gray-500" size={16} />
                    <input
                      type="text"
                      value={locationSearchTerm}
                      onChange={(e) => setLocationSearchTerm(e.target.value)}
                      placeholder="Search for a city or state..."
                      className="w-full bg-[#1a1625] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  {locationSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-[#1a1625] border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {locationSuggestions.map((location) => (
                        <div
                          key={location}
                          onClick={() => handleSelectLocation(location)}
                          className="px-4 py-2 text-white hover:bg-purple-900/50 cursor-pointer"
                        >
                          {location}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Remote Toggle */}
              <div className="mt-8 mb-8">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={includeRemote}
                    onChange={(e) => setIncludeRemote(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-600 after:bg-gray-500 after:transition-all after:content-[''] peer-checked:bg-purple-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-purple-600/10"></div>
                  <span className="ml-3 text-sm font-medium text-gray-300">
                    Include Remote Jobs
                  </span>
                </label>
              </div>
              
              {/* Success Message */}
              {selectedLocations.length > 0 && (
                <div className="mb-8 rounded-lg bg-purple-900/20 border border-purple-500/30 p-4 text-center text-sm text-purple-300">
                  Great! We've found jobs available in your selected locations.
                </div>
              )}
            </div>
            
            {/* Navigation Buttons */}
            <div className="mt-8">
              <div className="flex justify-between items-center w-full">
                <button
                  onClick={handleBackClick}
                  className="w-24 px-3 py-2 text-sm border border-gray-600 rounded-lg text-white hover:bg-gray-800 transition-colors flex items-center justify-center"
                >
                  <FaArrowLeft className="mr-1 h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={() => {
                    // Handle next step - would go to finish
                    console.log('Selected locations:', selectedLocations);
                    console.log('Include remote:', includeRemote);
                  }}
                  disabled={selectedLocations.length === 0 && !includeRemote}
                  className={`w-24 px-3 py-2 text-sm rounded-lg text-white transition-colors ${selectedLocations.length > 0 || includeRemote ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 opacity-50 cursor-not-allowed'}`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <style jsx global>{`
        .sidebar {
          width: 280px;
          height: 100vh;
          background: linear-gradient(to bottom, #141019, #7a64c2);
          color: white;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 2px 0 15px rgba(0, 0, 0, 0.2);
          position: fixed;
          top: 0;
          left: 0;
          z-index: 50;
          transform: translateX(-100%);
          transition: transform 0.3s ease-in-out;
        }
        .sidebar.open {
          transform: translateX(0);
        }
        @media (min-width: 1024px) {
          .sidebar {
            position: static;
            transform: none;
            box-shadow: none;
          }
          main {
            margin-left: 0;
          }
        }
        .top-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
          overflow-y: auto;
          max-height: calc(100vh - 180px);
          padding-right: 4px;
        }
        .top-section::-webkit-scrollbar {
          display: none;
        }
        .top-section {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .menu-group {
          margin-top: 10px;
        }
        .menu-label {
          font-size: 13px;
          text-transform: uppercase;
          margin: 18px 0 8px;
          color: #cfcfcf;
        }
        .menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          color: white;
          text-decoration: none;
          transition: all 0.15s ease;
          margin: 2px 0;
        }
        .menu-item:hover,
        .menu-item.active {
          background: rgba(255, 255, 255, 0.08);
          transform: translateX(2px);
        }
        .menu-item .icon {
          min-width: 20px;
          text-align: center;
          font-size: 16px;
        }
        .bottom-card {
          background: black;
          border-radius: 20px;
          padding: 20px;
          text-align: center;
          color: white;
        }
        .bottom-card p {
          font-size: 14px;
          margin: 8px 0;
          color: #cfcfcf;
        }
        .bottom-card button {
          margin-top: 12px;
          padding: 10px 18px;
          background: #4b32d4;
          border: none;
          color: white;
          font-size: 14px;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          width: 100%;
        }
        .bottom-card button:hover {
          background: #3a27ad;
        }
      `}</style>
      
      {/* Custom styles for range input */}
      <style jsx global>{`
        input[type='range'] {
          -webkit-appearance: none;
          height: 8px;
          width: 100%;
          border-radius: 4px;
          background: #4B5563;
          outline: none;
          padding: 0;
          margin: 10px 0;
        }

        /* Webkit (Chrome, Safari, etc) */
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: #8b5cf6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(139, 92, 246, 0.5);
          margin-top: -8px;
          position: relative;
          z-index: 2;
        }

        /* Firefox */
        input[type='range']::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #8b5cf6;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(139, 92, 246, 0.5);
          position: relative;
          z-index: 2;
        }

        input[type='range']:focus {
          outline: none;
        }

        /* For the filled portion of the track */
        input[type='range']::-webkit-slider-runnable-track {
          width: 100%;
          height: 8px;
          cursor: pointer;
          background: linear-gradient(to right, #8b5cf6 0%, #8b5cf6 var(--progress, 0%), #4B5563 var(--progress, 0%), #4B5563 100%);
          border-radius: 4px;
        }

        input[type='range']::-moz-range-track {
          width: 100%;
          height: 8px;
          cursor: pointer;
          background: #4B5563;
          border-radius: 4px;
        }

        input[type='range']::-moz-range-progress {
          background: #8b5cf6;
          border-radius: 4px;
          height: 8px;
          width: var(--progress, 0%);
        }
      `}</style>
    </div>
  );
}
