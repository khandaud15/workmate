'use client';

import './dashboard.css';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useOnboardingData } from '../hooks/useOnboardingData';
import Link from 'next/link';
import { 
  FaBars, 
  FaTimes, 
  FaChevronRight, 
  FaHome, 
  FaFileAlt, 
  FaEnvelopeOpenText, 
  FaBriefcase, 
  FaRobot, 
  FaFlask,
  FaArrowLeft
} from 'react-icons/fa';
import AccountSettings from '../components/AccountSettings';
import ResumeViewer from '../components/ResumeViewer';


import SideDrawer from '../components/SideDrawer';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Start with expanded sidebar on dashboard landing
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  
  // State for tooltip position and content
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({ top: 0, left: 0, display: 'none', position: 'fixed' });
  const [tooltipContent, setTooltipContent] = useState('');
  // DRY helper for sidebar tooltips
  const handleSidebarTooltip = (e: React.MouseEvent, label: string) => {
    if (isSidebarCollapsed) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setTooltipStyle({
        top: rect.top + (rect.height / 2) - 10,
        left: rect.right + 12,
        display: 'flex',
        position: 'fixed'
      });
      setTooltipContent(label);
    }
  };
  const handleSidebarTooltipLeave = () => {
    setTooltipStyle({ ...tooltipStyle, display: 'none' });
  };
  
  // Section visibility states
  const [showDashboard, setShowDashboard] = useState(true);
  const [showResume, setShowResume] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [showJobTracker, setShowJobTracker] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);
  const [showPlayground, setShowPlayground] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Use the onboarding data hook to fetch real data
  const { 
    isLoading: isLoadingOnboardingData, 
    error: onboardingDataError, 
    data: onboardingData,
    extractContactInfo,
    extractWorkExperience,
    extractEducation,
    extractSkills,
    fetchData: refetchOnboardingData
  } = useOnboardingData();
  
  // Contact info state
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    linkedin: ''
  });
  
  // Contact info editing state
  const [isEditingContactInfo, setIsEditingContactInfo] = useState(false);
  const [editedContactInfo, setEditedContactInfo] = useState<ContactInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    linkedin: ''
  });
  
  // Define types for our data structures
  type WorkExperience = {
    id: string;
    jobTitle: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    responsibilities: string[];
    isEditing: boolean;
    isExpanded: boolean;
  };

  type Education = {
    id: string;
    school: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    description: string;
    isEditing: boolean;
    isExpanded: boolean;
  };

  type ContactInfo = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    linkedin: string;
  };

  // Define profile type
  type Profile = {
    contactInfo?: ContactInfo;
    workExperience?: WorkExperience[];
    education?: Education[];
    skills?: string[];
  };

  // Work experience state
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  
  // Skills state
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [isSkillsExpanded, setIsSkillsExpanded] = useState(true);
  
  // Education state
  const [education, setEducation] = useState<Education[]>([]);
  
  // Load data from parsed resume when available
  useEffect(() => {
    if (onboardingData?.parsedResume) {
      // Extract and set contact info
      const extractedContactInfo = extractContactInfo(onboardingData.parsedResume);
      if (extractedContactInfo) {
        setContactInfo(extractedContactInfo);
      }
      
      // Extract and set work experience
      const extractedWorkExperience = extractWorkExperience(onboardingData.parsedResume);
      if (extractedWorkExperience && extractedWorkExperience.length > 0) {
        // Add isEditing and isExpanded properties to each work experience
        const formattedWorkExperience = extractedWorkExperience.map((exp, index) => ({
          ...exp,
          id: `exp-${index + 1}`,
          isEditing: false,
          isExpanded: false
        }));
        setWorkExperience(formattedWorkExperience);
      }
      
      // Extract and set education
      const extractedEducation = extractEducation(onboardingData.parsedResume);
      if (extractedEducation && extractedEducation.length > 0) {
        // Add isEditing and isExpanded properties to each education entry
        const formattedEducation = extractedEducation.map((edu, index) => ({
          ...edu,
          id: `edu-${index + 1}`,
          isEditing: false,
          isExpanded: false
        }));
        setEducation(formattedEducation);
      }
      
      // Extract and set skills
      const extractedSkills = extractSkills(onboardingData.parsedResume);
      if (extractedSkills && extractedSkills.length > 0) {
        setSkills(extractedSkills);
      }
    } else if (onboardingData?.profile) {
      // Cast profile to the correct type
      const profile = onboardingData.profile as Profile;
      
      // Fallback to profile data if available
      if (profile.contactInfo) {
        setContactInfo(profile.contactInfo);
      }
      
      if (profile.workExperience && profile.workExperience.length > 0) {
        // Ensure work experience entries have required properties
        const formattedWorkExperience = profile.workExperience.map((exp, index) => ({
          ...exp,
          id: exp.id || `exp-${index + 1}`,
          isEditing: exp.isEditing || false,
          isExpanded: exp.isExpanded || false
        }));
        setWorkExperience(formattedWorkExperience);
      }
      
      if (profile.education && profile.education.length > 0) {
        // Ensure education entries have required properties
        const formattedEducation = profile.education.map((edu, index) => ({
          ...edu,
          id: edu.id || `edu-${index + 1}`,
          isEditing: edu.isEditing || false,
          isExpanded: edu.isExpanded || false
        }));
        setEducation(formattedEducation);
      }
      
      if (profile.skills && profile.skills.length > 0) {
        setSkills(profile.skills);
      }
    }
  }, [onboardingData, extractContactInfo, extractWorkExperience, extractEducation, extractSkills]);
  
  // Force refresh data when profile section is shown
  useEffect(() => {
    if (showProfile) {
      refetchOnboardingData(true);
    }
  }, [showProfile, refetchOnboardingData]);
  
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
  
  const pathname = usePathname();
  
  // Close sidebar when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }


  return (
    <>
      <div className="flex h-screen bg-[#0a192f] relative overflow-x-hidden">
        {/* Mobile Toggle Button - Vertical Tab */}
        {!isSidebarOpen && (
          <button 
            className="fixed left-0 top-1/2 transform -translate-y-1/2 z-50 bg-[#7a64c2] text-white p-2 rounded-r-lg shadow-lg lg:hidden sidebar-toggle"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <FaChevronRight size={16} />
          </button>
        )}
        
        {/* Overlay - Only on mobile when sidebar is open */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div 
          className={`sidebar bg-gradient-to-b from-[#0a192f] to-[#0d1b2a] ${isSidebarOpen ? 'open' : ''} ${isSidebarCollapsed ? 'collapsed' : 'expanded'}`}
          role="navigation"
          aria-label="Main navigation"
        >
          {/* Close Button - Simple X at top right of sidebar */}
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
            {/* Logo at the top */}
            <div className={`sidebar-logo flex ${isSidebarCollapsed ? 'flex-col items-center justify-center mb-2.5' : 'items-center gap-3 mb-2 ml-3'} mt-2 sidebar-logo`}>
              <div 
                className={`bg-gradient-to-br from-[#d8f1eb] to-[#9bd6c4] rounded transform rotate-45 relative logo-icon ${isSidebarCollapsed ? 'w-5 h-5' : 'w-7 h-7'}`}
                style={{
                  boxShadow: '2px 2px 5px rgba(0,0,0,0.2), -1px -1px 3px rgba(255,255,255,0.4)'
                }}
                onMouseEnter={e => handleSidebarTooltip(e, 'Talexus AI')}
                onMouseLeave={handleSidebarTooltipLeave}
              >
                
              </div>
              {!isSidebarCollapsed && <div className="text-lg font-bold text-white ml-2">Talexus AI</div>}
            </div>
            
            <div 
              className={`user hover:bg-white/5 rounded-lg transition-colors duration-200 p-2 cursor-pointer ${isSidebarCollapsed ? 'mb-2.5 relative flex flex-col items-center justify-center' : '-mx-2'} `}
              onClick={() => setShowAccountSettings(true)}
              style={{ marginTop: '-10px' }}
            >
              <div className="flex items-center gap-3">
                <img 
                  src={session.user?.image || 'https://randomuser.me/api/portraits/men/75.jpg'} 
                  alt="User Avatar" 
                  className={`rounded-full object-cover flex-shrink-0 avatar-img ${isSidebarCollapsed ? 'w-8 h-8' : 'w-11 h-11'}`}
                  title={isSidebarCollapsed ? session.user?.name || 'User' : ''}
                  onMouseEnter={e => handleSidebarTooltip(e, session.user?.name || 'User')}
                  onMouseLeave={handleSidebarTooltipLeave}
                />
                
                {!isSidebarCollapsed && (
                  <div className="user-info min-w-0">
                    <div className="text-sm font-medium text-white truncate">{session.user?.name || 'User'}</div>
                    <div className="text-xs text-gray-300 truncate">Manage Account (Free Plan)</div>
                  </div>
                )}
              </div>
            </div>

            <div className="menu-group">
              {!isSidebarCollapsed && <div className="menu-label">Workspace</div>}
              <button 
                type="button" 
                className={`menu-item w-full text-left relative ${showDashboard ? 'active' : ''}`}
                onClick={() => {
                  setShowDashboard(true);
                  setShowResume(false);
                  setShowCoverLetter(false);
                  setShowJobTracker(false);
                  setShowCopilot(false);
                  setShowPlayground(false);
                  setShowAccountSettings(false);
                  setIsSidebarOpen(false);
                  // Expand sidebar when Home is clicked
                  setIsSidebarCollapsed(false);
                }}
                title="Home"
                onMouseEnter={e => handleSidebarTooltip(e, 'Home')}
                onMouseLeave={handleSidebarTooltipLeave}
              >
                <FaHome className="icon" />
                {!isSidebarCollapsed && <span>Home</span>}
                
              </button>
              <button 
                type="button" 
                className={`menu-item w-full text-left relative ${showResume ? 'active' : ''}`}
                onClick={() => {
                  // Navigate to the resume page instead of just toggling state
                  router.push('/dashboard/resume');
                  setShowDashboard(false);
                  setShowResume(true);
                  setShowCoverLetter(false);
                  setShowJobTracker(false);
                  setShowCopilot(false);
                  setShowPlayground(false);
                  setShowAccountSettings(false);
                  setIsSidebarOpen(false);
                  // Auto-collapse sidebar when section is clicked
                  setIsSidebarCollapsed(true);
                }}
                title="Resume"
                onMouseEnter={e => handleSidebarTooltip(e, 'Resume')}
                onMouseLeave={handleSidebarTooltipLeave}
              >
                <FaFileAlt className="icon" />
                {!isSidebarCollapsed && <span>Resume</span>}
                
              </button>
              <button 
                type="button" 
                className={`menu-item w-full text-left relative ${showCoverLetter ? 'active' : ''}`}
                onClick={() => {
                  setShowDashboard(false);
                  setShowResume(false);
                  setShowCoverLetter(true);
                  setShowJobTracker(false);
                  setShowCopilot(false);
                  setShowPlayground(false);
                  setShowAccountSettings(false);
                  setIsSidebarOpen(false);
                  // Auto-collapse sidebar when section is clicked
                  setIsSidebarCollapsed(true);
                }}
                title="Cover Letter"
                onMouseEnter={e => handleSidebarTooltip(e, 'Cover Letter')}
                onMouseLeave={handleSidebarTooltipLeave}
              >
                <FaEnvelopeOpenText className="icon" />
                {!isSidebarCollapsed && <span>Cover Letter</span>}
                
              </button>
              <button 
                type="button" 
                className={`menu-item w-full text-left relative ${showJobTracker ? 'active' : ''}`}
                onClick={() => {
                  setShowDashboard(false);
                  setShowResume(false);
                  setShowCoverLetter(false);
                  setShowJobTracker(true);
                  setShowCopilot(false);
                  setShowPlayground(false);
                  setShowAccountSettings(false);
                  setIsSidebarOpen(false);
                  // Auto-collapse sidebar when section is clicked
                  setIsSidebarCollapsed(true);
                }}
                title="Job Tracker"
                onMouseEnter={e => handleSidebarTooltip(e, 'Job Tracker')}
                onMouseLeave={handleSidebarTooltipLeave}
              >
                <FaBriefcase className="icon" />
                {!isSidebarCollapsed && <span>Job Tracker</span>}
                
              </button>
              <button 
                type="button" 
                className={`menu-item w-full text-left relative ${showCopilot ? 'active' : ''}`}
                onClick={() => {
                  setShowDashboard(false);
                  setShowResume(false);
                  setShowCoverLetter(false);
                  setShowJobTracker(false);
                  setShowCopilot(true);
                  setShowPlayground(false);
                  setShowAccountSettings(false);
                  setIsSidebarOpen(false);
                  // Auto-collapse sidebar when section is clicked
                  setIsSidebarCollapsed(true);
                }}
                title="Copilot"
                onMouseEnter={e => handleSidebarTooltip(e, 'Copilot')}
                onMouseLeave={handleSidebarTooltipLeave}
              >
                <FaRobot className="icon" />
                {!isSidebarCollapsed && <span>Copilot</span>}
                
              </button>
              <button 
                type="button" 
                className={`menu-item w-full text-left ${showPlayground ? 'active' : ''}`}
                onClick={() => {
                  setShowDashboard(false);
                  setShowResume(false);
                  setShowCoverLetter(false);
                  setShowJobTracker(false);
                  setShowCopilot(false);
                  setShowPlayground(true);
                  setShowAccountSettings(false);
                  setIsSidebarOpen(false);
                  // Auto-collapse sidebar when section is clicked
                  setIsSidebarCollapsed(true);
                }}
                title="Playground"
                onMouseEnter={e => handleSidebarTooltip(e, 'Playground')}
                onMouseLeave={handleSidebarTooltipLeave}
              >
                <FaFlask className="icon" /> {!isSidebarCollapsed && <span>Playground</span>}
              </button>
            </div>
          </div>

          {!isSidebarCollapsed && (
            <div className="bottom-card">
              <strong>Upgrade to Pro</strong>
              <p>Get unlimited sessions<br />and unlock all the job tools</p>
              <button>Upgrade</button>
            </div>
          )}


        </div>

        <main 
          className={`flex-1 overflow-auto pt-4 lg:pt-0 transition-all duration-300 bg-[#0a192f] text-white ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'}`}
          onClick={() => {
            // Collapse sidebar when clicking on main content area
            if (!isSidebarCollapsed && window.innerWidth >= 1024) {
              setIsSidebarCollapsed(true);
            }
          }}
        >
          {showAccountSettings ? (
            <div className="relative">
              <AccountSettings onClose={() => setShowAccountSettings(false)} />
            </div>
          ) : showCoverLetter ? (
            <div className="max-w-6xl mx-auto p-4 lg:p-8">
              <h1 className="text-2xl font-bold text-white mb-6">Cover Letter</h1>
              <div className="bg-[#1f1e22] rounded-xl shadow-sm p-6">
                <p className="text-gray-300">Cover letter content will be displayed here.</p>
              </div>
            </div>
          ) : showJobTracker ? (
            <div className="max-w-6xl mx-auto p-4 lg:p-8">
              <h1 className="text-2xl font-bold text-white mb-6">Job Tracker</h1>
              <div className="bg-[#1f1e22] rounded-xl shadow-sm p-6">
                <p className="text-gray-300">Job tracker content will be displayed here.</p>
              </div>
            </div>
          ) : showCopilot ? (
            <div className="max-w-6xl mx-auto p-4 lg:p-8">
              <h1 className="text-2xl font-bold text-white mb-6">Copilot</h1>
              <div className="bg-[#1f1e22] rounded-xl shadow-sm p-6">
                <p className="text-gray-300">Copilot content will be displayed here.</p>
              </div>
            </div>
          ) : showPlayground ? (
            <div className="max-w-6xl mx-auto p-4 lg:p-8">
              <h1 className="text-2xl font-bold text-white mb-6">Playground</h1>
              <div className="bg-[#1f1e22] rounded-xl shadow-sm p-6">
                <p className="text-gray-300">Playground content will be displayed here.</p>
              </div>
            </div>
          ) : showProfile ? (
            <div className="w-full max-w-full md:max-w-4xl mx-auto mt-6">
              {/* Back button */}
              <button 
                onClick={() => setShowProfile(false)} 
                className="flex items-center text-blue-400 hover:text-blue-300 mb-4 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              
              {/* Header - Outside container */}
              <div className="w-full max-w-full md:max-w-4xl mx-auto mb-6">
                <div className="w-full bg-[#1f1b2e] p-6 rounded-t-xl border border-[#2e2a3d] text-center">
                  <h2 className="text-xl font-semibold text-white">My Profile</h2>
                  <p className="text-gray-400 text-sm">Manage your personal information and career details</p>
                </div>
              </div>
              
              {/* Profile container */}
              <div className="w-full max-w-full md:max-w-4xl text-center border border-gray-700 rounded-t-xl rounded-b-none pt-6 pb-10 px-2 md:px-6 bg-[#12101a]/50 mx-auto mt-2">
                
                {/* Contact Information Section */}
                <div className="w-full bg-[#1a1625] p-6 border border-[#2e2a3d] mb-6 text-left">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-white">Contact Information</h3>
                    {isEditingContactInfo ? (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setContactInfo(editedContactInfo);
                            setIsEditingContactInfo(false);
                          }}
                          className="text-green-400 hover:text-green-300 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => {
                            setIsEditingContactInfo(false);
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          setEditedContactInfo({...contactInfo});
                          setIsEditingContactInfo(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {isEditingContactInfo ? (
                    /* Edit Form */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                      <div>
                        <label className="block text-gray-300 mb-1 text-sm">First Name</label>
                        <input 
                          type="text" 
                          value={editedContactInfo.firstName} 
                          onChange={(e) => setEditedContactInfo({...editedContactInfo, firstName: e.target.value})}
                          className="w-full bg-[#12101a] border border-gray-700 rounded p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-1 text-sm">Last Name</label>
                        <input 
                          type="text" 
                          value={editedContactInfo.lastName} 
                          onChange={(e) => setEditedContactInfo({...editedContactInfo, lastName: e.target.value})}
                          className="w-full bg-[#12101a] border border-gray-700 rounded p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-1 text-sm">Email</label>
                        <input 
                          type="email" 
                          value={editedContactInfo.email} 
                          onChange={(e) => setEditedContactInfo({...editedContactInfo, email: e.target.value})}
                          className="w-full bg-[#12101a] border border-gray-700 rounded p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-1 text-sm">Phone</label>
                        <input 
                          type="text" 
                          value={editedContactInfo.phone} 
                          onChange={(e) => setEditedContactInfo({...editedContactInfo, phone: e.target.value})}
                          className="w-full bg-[#12101a] border border-gray-700 rounded p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-1 text-sm">Address</label>
                        <input 
                          type="text" 
                          value={editedContactInfo.address} 
                          onChange={(e) => setEditedContactInfo({...editedContactInfo, address: e.target.value})}
                          className="w-full bg-[#12101a] border border-gray-700 rounded p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-1 text-sm">City</label>
                        <input 
                          type="text" 
                          value={editedContactInfo.city} 
                          onChange={(e) => setEditedContactInfo({...editedContactInfo, city: e.target.value})}
                          className="w-full bg-[#12101a] border border-gray-700 rounded p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-1 text-sm">State</label>
                        <input 
                          type="text" 
                          value={editedContactInfo.state} 
                          onChange={(e) => setEditedContactInfo({...editedContactInfo, state: e.target.value})}
                          className="w-full bg-[#12101a] border border-gray-700 rounded p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-1 text-sm">Postal Code</label>
                        <input 
                          type="text" 
                          value={editedContactInfo.postalCode} 
                          onChange={(e) => setEditedContactInfo({...editedContactInfo, postalCode: e.target.value})}
                          className="w-full bg-[#12101a] border border-gray-700 rounded p-2 text-white"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-gray-300 mb-1 text-sm">LinkedIn</label>
                        <input 
                          type="text" 
                          value={editedContactInfo.linkedin} 
                          onChange={(e) => setEditedContactInfo({...editedContactInfo, linkedin: e.target.value})}
                          className="w-full bg-[#12101a] border border-gray-700 rounded p-2 text-white"
                        />
                      </div>
                    </div>
                  ) : (
                    /* Display View */
                    <div className="space-y-0.5 text-left">
                      <h4 className="text-xl font-semibold text-white">
                        {contactInfo.firstName} {contactInfo.lastName}
                      </h4>
                      {(contactInfo.address || contactInfo.city || contactInfo.state || contactInfo.postalCode) && (
                        <p className="text-gray-300 text-sm leading-tight">
                          {[contactInfo.address, contactInfo.city, contactInfo.postalCode, contactInfo.state]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      )}
                      {contactInfo.linkedin && (
                        <p className="text-blue-400 hover:text-blue-300 cursor-pointer text-sm leading-tight">
                          {contactInfo.linkedin}
                        </p>
                      )}
                      {contactInfo.phone && (
                        <p className="text-gray-300 text-sm leading-tight">{contactInfo.phone}</p>
                      )}
                      {contactInfo.email && (
                        <p className="text-gray-300 text-sm leading-tight">{contactInfo.email}</p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Experience Section */}
                <div className="w-full bg-[#1a1625] p-6 border border-[#2e2a3d] mb-6 text-left">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Experience</h3>
                    <button className="text-blue-400 hover:text-blue-300 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Experience Items Container */}
                  <div className="space-y-4">
                    {workExperience.map((exp: WorkExperience, index: number) => (
                      <div key={exp.id} className="bg-[#12101a]/50 border border-gray-700 p-4 text-left">
                        {exp.isEditing ? (
                          /* Edit Form */
                          <div className="text-left">
                            <h3 className="text-xl font-semibold text-white mb-4">Edit Work Experience</h3>
                            
                            <div className="space-y-4">
                              <div>
                                <label className="block text-gray-300 mb-1 text-sm">Position Title</label>
                                <input 
                                  type="text" 
                                  className="w-full bg-[#2a292e] border border-gray-700 px-3 py-2 text-white"
                                  value={exp.jobTitle || ''}
                                  onChange={(e) => {
                                    setWorkExperience(prev => 
                                      prev.map((item, i) => 
                                        i === index ? { ...item, jobTitle: e.target.value } : item
                                      )
                                    );
                                  }}
                                />
                              </div>
                              
                              <div>
                                <label className="block text-gray-300 mb-1 text-sm">Company</label>
                                <input 
                                  type="text" 
                                  className="w-full bg-[#2a292e] border border-gray-700 px-3 py-2 text-white"
                                  value={exp.company || ''}
                                  onChange={(e) => {
                                    setWorkExperience(prev => 
                                      prev.map((item, i) => 
                                        i === index ? { ...item, company: e.target.value } : item
                                      )
                                    );
                                  }}
                                />
                              </div>
                              
                              <div>
                                <label className="block text-gray-300 mb-1 text-sm">Location</label>
                                <input 
                                  type="text" 
                                  className="w-full bg-[#2a292e] border border-gray-700 px-3 py-2 text-white"
                                  value={exp.location || ''}
                                  onChange={(e) => {
                                    setWorkExperience(prev => 
                                      prev.map((item, i) => 
                                        i === index ? { ...item, location: e.target.value } : item
                                      )
                                    );
                                  }}
                                />
                              </div>
                              
                              <div className="flex gap-4">
                                <div className="flex-1">
                                  <label className="block text-gray-300 mb-1 text-sm">Start Date</label>
                                  <input 
                                    type="text" 
                                    className="w-full bg-[#2a292e] border border-gray-700 px-3 py-2 text-white"
                                    value={exp.startDate || ''}
                                    onChange={(e) => {
                                      setWorkExperience(prev => 
                                        prev.map((item, i) => 
                                          i === index ? { ...item, startDate: e.target.value } : item
                                        )
                                      );
                                    }}
                                  />
                                </div>
                                
                                <div className="flex-1">
                                  <label className="block text-gray-300 mb-1 text-sm">End Date</label>
                                  <input 
                                    type="text" 
                                    className="w-full bg-[#2a292e] border border-gray-700 px-3 py-2 text-white"
                                    placeholder="Leave empty for 'Present'"
                                    value={exp.endDate || ''}
                                    onChange={(e) => {
                                      setWorkExperience(prev => 
                                        prev.map((item, i) => 
                                          i === index ? { ...item, endDate: e.target.value } : item
                                        )
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-gray-300 mb-1 text-sm">Responsibilities</label>
                                {exp.responsibilities.map((resp: string, respIndex: number) => (
                                  <div key={respIndex} className="mb-2">
                                    <input 
                                      type="text" 
                                      className="w-full bg-[#2a292e] border border-gray-700 px-3 py-2 text-white"
                                      value={resp}
                                      onChange={(e) => {
                                        const newResponsibilities = [...exp.responsibilities];
                                        newResponsibilities[respIndex] = e.target.value;
                                        setWorkExperience(prev => 
                                          prev.map((item, i) => 
                                            i === index ? { ...item, responsibilities: newResponsibilities } : item
                                          )
                                        );
                                      }}
                                    />
                                  </div>
                                ))}
                                
                                <button 
                                  className="mt-2 px-3 py-1 text-sm bg-[#2a292e] text-purple-400 hover:bg-purple-900/20 transition-colors flex items-center gap-1"
                                  onClick={() => {
                                    const newResponsibilities = [...exp.responsibilities, ''];
                                    setWorkExperience(prev => 
                                      prev.map((item, i) => 
                                        i === index ? { ...item, responsibilities: newResponsibilities } : item
                                      )
                                    );
                                  }}
                                >
                                  + Add Responsibility
                                </button>
                              </div>
                            </div>
                            
                            <div className="mt-6 flex justify-between">
                              <button 
                                className="px-4 py-2 bg-[#12101a] border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm"
                                onClick={() => {
                                  // Cancel editing - revert to previous state
                                  setWorkExperience(prev => 
                                    prev.map((e, i) => 
                                      i === index ? { ...e, isEditing: false } : e
                                    )
                                  );
                                }}
                              >
                                Cancel
                              </button>
                              <button 
                                className="px-4 py-2 bg-purple-900/30 border border-purple-500 text-purple-100 hover:bg-purple-800/40 transition-colors text-sm"
                                onClick={() => {
                                  // Save changes, exit editing mode, and collapse the card
                                  setWorkExperience(prev => {
                                    return prev.map((e, i) => 
                                      i === index ? { ...e, isEditing: false, isExpanded: false } : e
                                    );
                                  });
                                }}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Display Mode */
                          <>
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-semibold text-white">{exp.jobTitle || 'Position Title'}</h3>
                                <p className="text-gray-300 text-sm">{exp.company || 'Company Name'}</p>
                                <p className="text-gray-400 text-sm">{exp.startDate}{exp.endDate ? ` - ${exp.endDate}` : ''}</p>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  className="p-2 text-gray-400 hover:text-white transition-colors"
                                  onClick={() => {
                                    // Toggle expanded state
                                    setWorkExperience(prev => 
                                      prev.map((e, i) => 
                                        i === index ? { ...e, isExpanded: !e.isExpanded } : e
                                      )
                                    );
                                  }}
                                  aria-label={exp.isExpanded ? 'Collapse' : 'Expand'}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                <button 
                                  className="p-2 text-gray-400 hover:text-white transition-colors"
                                  onClick={() => {
                                    // Set editing state
                                    setWorkExperience(prev => 
                                      prev.map((e, i) => 
                                        i === index ? { ...e, isEditing: true, isExpanded: true } : e
                                      )
                                    );
                                  }}
                                  aria-label="Edit"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                                <button 
                                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                  onClick={() => {
                                    // Remove this experience
                                    setWorkExperience(prev => prev.filter((_, i) => i !== index));
                                  }}
                                  aria-label="Delete"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            
                            {exp.isExpanded && (
                              <div className="mt-4">
                                <h4 className="text-white font-medium mb-2">Responsibilities</h4>
                                <ul className="text-gray-300 space-y-2 pl-5 list-disc">
                                  {exp.responsibilities.filter(Boolean).map((resp, respIndex) => (
                                    <li key={respIndex}>{resp}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                    
                    {/* Add Another Position Button */}
                    <button 
                      className="w-full p-4 border border-dashed border-purple-500 text-purple-400 hover:bg-purple-900/20 transition-colors flex items-center justify-center gap-2"
                      onClick={() => {
                        const newExperience = {
                          id: `exp-${Date.now()}`,
                          jobTitle: '',
                          company: '',
                          location: '',
                          startDate: '',
                          endDate: '',
                          responsibilities: ['', '', ''],
                          isEditing: true,
                          isExpanded: true
                        };
                        setWorkExperience(prev => [newExperience, ...prev]);
                      }}
                    >
                      + Add Another Position
                    </button>
                  </div>
                </div>
                
                {/* Education Section */}
                <div className="w-full bg-[#1a1625] p-6 border border-[#2e2a3d] mb-6 text-left">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Education</h3>
                    <button className="text-purple-400 hover:text-purple-300 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Education Items Container */}
                  <div className="space-y-4">
                    {education.map((edu: Education, index: number) => (
                      <div key={edu.id} className="bg-[#12101a]/50 border border-gray-700 p-4 text-left">
                        {edu.isEditing ? (
                          /* Edit Form */
                          <div className="text-left">
                            <h3 className="text-xl font-semibold text-white mb-4">Edit Education</h3>
                            
                            <div className="space-y-4">
                              <div>
                                <label className="block text-gray-300 mb-1 text-sm">School/Institution</label>
                                <input 
                                  type="text" 
                                  className="w-full bg-[#2a292e] border border-gray-700 px-3 py-2 text-white"
                                  value={edu.school || ''}
                                  onChange={(e) => {
                                    setEducation(prev => 
                                      prev.map((item, i) => 
                                        i === index ? { ...item, school: e.target.value } : item
                                      )
                                    );
                                  }}
                                />
                              </div>
                              
                              <div>
                                <label className="block text-gray-300 mb-1 text-sm">Degree</label>
                                <input 
                                  type="text" 
                                  className="w-full bg-[#2a292e] border border-gray-700 px-3 py-2 text-white"
                                  value={edu.degree || ''}
                                  onChange={(e) => {
                                    setEducation(prev => 
                                      prev.map((item, i) => 
                                        i === index ? { ...item, degree: e.target.value } : item
                                      )
                                    );
                                  }}
                                />
                              </div>
                              
                              <div>
                                <label className="block text-gray-300 mb-1 text-sm">Field of Study</label>
                                <input 
                                  type="text" 
                                  className="w-full bg-[#2a292e] border border-gray-700 px-3 py-2 text-white"
                                  value={edu.fieldOfStudy || ''}
                                  onChange={(e) => {
                                    setEducation(prev => 
                                      prev.map((item, i) => 
                                        i === index ? { ...item, fieldOfStudy: e.target.value } : item
                                      )
                                    );
                                  }}
                                />
                              </div>
                              
                              <div className="flex gap-4">
                                <div className="flex-1">
                                  <label className="block text-gray-300 mb-1 text-sm">Start Date</label>
                                  <input 
                                    type="text" 
                                    className="w-full bg-[#2a292e] border border-gray-700 px-3 py-2 text-white"
                                    value={edu.startDate || ''}
                                    onChange={(e) => {
                                      setEducation(prev => 
                                        prev.map((item, i) => 
                                          i === index ? { ...item, startDate: e.target.value } : item
                                        )
                                      );
                                    }}
                                  />
                                </div>
                                
                                <div className="flex-1">
                                  <label className="block text-gray-300 mb-1 text-sm">End Date</label>
                                  <input 
                                    type="text" 
                                    className="w-full bg-[#2a292e] border border-gray-700 px-3 py-2 text-white"
                                    placeholder="Leave empty for 'Present'"
                                    value={edu.endDate || ''}
                                    onChange={(e) => {
                                      setEducation(prev => 
                                        prev.map((item, i) => 
                                          i === index ? { ...item, endDate: e.target.value } : item
                                        )
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-gray-300 mb-1 text-sm">Description</label>
                                <textarea 
                                  className="w-full bg-[#2a292e] border border-gray-700 px-3 py-2 text-white min-h-[100px]"
                                  value={edu.description || ''}
                                  onChange={(e) => {
                                    setEducation(prev => 
                                      prev.map((item, i) => 
                                        i === index ? { ...item, description: e.target.value } : item
                                      )
                                    );
                                  }}
                                />
                              </div>
                            </div>
                            
                            <div className="mt-6 flex justify-between">
                              <button 
                                className="px-4 py-2 bg-[#12101a] border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm"
                                onClick={() => {
                                  // Cancel editing - revert to previous state
                                  setEducation(prev => 
                                    prev.map((e, i) => 
                                      i === index ? { ...e, isEditing: false } : e
                                    )
                                  );
                                }}
                              >
                                Cancel
                              </button>
                              <button 
                                className="px-4 py-2 bg-purple-900/30 border border-purple-500 text-purple-100 hover:bg-purple-800/40 transition-colors text-sm"
                                onClick={() => {
                                  // Save changes, exit editing mode, and collapse the card
                                  setEducation(prev => {
                                    return prev.map((e, i) => 
                                      i === index ? { ...e, isEditing: false, isExpanded: false } : e
                                    );
                                  });
                                }}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Display Mode */
                          <>
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-semibold text-white">{edu.school || 'School/Institution'}</h3>
                                <p className="text-gray-300 text-sm">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</p>
                                <p className="text-gray-400 text-sm">{edu.startDate}{edu.endDate ? ` - ${edu.endDate}` : ''}</p>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  className="p-2 text-gray-400 hover:text-white transition-colors"
                                  onClick={() => {
                                    // Toggle expanded state
                                    setEducation(prev => 
                                      prev.map((e, i) => 
                                        i === index ? { ...e, isExpanded: !e.isExpanded } : e
                                      )
                                    );
                                  }}
                                  aria-label={edu.isExpanded ? 'Collapse' : 'Expand'}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                <button 
                                  className="p-2 text-gray-400 hover:text-white transition-colors"
                                  onClick={() => {
                                    // Set editing state
                                    setEducation(prev => 
                                      prev.map((e, i) => 
                                        i === index ? { ...e, isEditing: true, isExpanded: true } : e
                                      )
                                    );
                                  }}
                                  aria-label="Edit"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                                <button 
                                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                  onClick={() => {
                                    // Remove this education
                                    setEducation(prev => prev.filter((_, i) => i !== index));
                                  }}
                                  aria-label="Delete"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            
                            {edu.isExpanded && (
                              <div className="mt-4">
                                <h4 className="text-white font-medium mb-2">Description</h4>
                                <p className="text-gray-300">{edu.description}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                    
                    {/* Add Another Education Button */}
                    <button 
                      className="w-full p-4 border border-dashed border-purple-500 text-purple-400 hover:bg-purple-900/20 transition-colors flex items-center justify-center gap-2"
                      onClick={() => {
                        const newEducation = {
                          id: `edu-${Date.now()}`,
                          school: '',
                          degree: '',
                          fieldOfStudy: '',
                          startDate: '',
                          endDate: '',
                          description: '',
                          isEditing: true,
                          isExpanded: true
                        };
                        setEducation(prev => [newEducation, ...prev]);
                      }}
                    >
                      + Add Another Education
                    </button>
                  </div>
                </div>
                
                {/* Skills Section */}
                <div className="w-full bg-[#1a1625] p-6 border border-[#2e2a3d] mb-6 text-left">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Skills</h3>
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        onClick={() => {
                          if (newSkill.trim()) {
                            setSkills(prev => [...prev, newSkill.trim()]);
                            setNewSkill('');
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                      <button 
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        onClick={() => setIsSkillsExpanded(!isSkillsExpanded)}
                        aria-label={isSkillsExpanded ? "Collapse skills" : "Expand skills"}
                      >
                        {isSkillsExpanded ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {isSkillsExpanded && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <div key={index} className="group relative bg-purple-900/30 border border-purple-500 px-3 py-1.5 rounded-full text-purple-100 text-sm flex items-center gap-2">
                            <span>{skill}</span>
                            <button 
                              className="text-gray-500 hover:text-red-400 transition-colors"
                              onClick={() => {
                                setSkills(prev => prev.filter((_, i) => i !== index));
                              }}
                              aria-label="Remove skill"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex items-center gap-2">
                        <input
                          type="text"
                          className="flex-1 bg-[#2a292e] border border-gray-700 px-3 py-2 text-white"
                          placeholder="Add a new skill"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newSkill.trim()) {
                              setSkills(prev => [...prev, newSkill.trim()]);
                              setNewSkill('');
                            }
                          }}
                        />
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 transition-colors"
                          onClick={() => {
                            if (newSkill.trim()) {
                              setSkills(prev => [...prev, newSkill.trim()]);
                              setNewSkill('');
                            }
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-full md:max-w-4xl mx-auto mt-6 overflow-hidden px-4 md:px-0">
              <div className="w-full bg-[#0d1b2a] p-6 rounded-t-xl border border-[#1e2d3d]">
                <h2 className="text-xl font-semibold text-white mb-1 text-center">Welcome back, {session.user?.name?.split(' ')[0] || 'User'}!</h2>
                <p className="text-gray-400 text-sm text-center">Your next opportunity starts here. Create, optimize, apply — all in one intelligent workspace.</p>
              </div>
              
              {/* First row of boxes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {/* Box 1: My Profile */}
                <div 
                  onClick={() => {
                    setShowProfile(true);
                    setShowResume(false);
                    setShowCoverLetter(false);
                    setShowJobTracker(false);
                    setShowCopilot(false);
                    setShowPlayground(false);
                  }}
                  className="group bg-[#0d1b2a] border border-[#1e2d3d] rounded-xl p-5 transition-all shadow-lg cursor-pointer hover:shadow-[0_0_16px_2px_rgba(37,99,235,0.5)] hover:border-[#2563eb] transition-all"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white ml-3">My Profile</h3>
                  </div>
                  <p className="text-gray-400 text-sm">Manage your personal information and career preferences.</p>
                  <div className="mt-4 w-full py-2 bg-[#0a192f] text-white rounded-lg border border-[#1e2d3d] hover:border-[#2563eb] transition-all text-center">
                    Edit Profile
                  </div>
                </div>
                
                {/* Box 2: Resume */}
                <div 
                  onClick={() => {
                    // Navigate to /dashboard/resume and update URL
                    window.location.href = '/dashboard/resume';
                  }}
                  className="group bg-[#0d1b2a] border border-[#1e2d3d] rounded-xl p-5 transition-all shadow-lg cursor-pointer hover:shadow-[0_0_16px_2px_rgba(37,99,235,0.5)] hover:border-[#2563eb] transition-all"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white ml-3">Resume</h3>
                  </div>
                  <p className="text-gray-400 text-sm">View and update your professional resume.</p>
                  <div className="mt-4 w-full py-2 bg-[#0a192f] text-white rounded-lg border border-[#1e2d3d] hover:border-[#2563eb] transition-all text-center">
                    View Resume
                  </div>
                </div>
                
                {/* Box 3: Jobs */}
                <div 
                  onClick={() => {
                    setShowJobTracker(true);
                    setShowProfile(false);
                    setShowResume(false);
                    setShowCoverLetter(false);
                    setShowCopilot(false);
                    setShowPlayground(false);
                  }}
                  className="group bg-[#0d1b2a] border border-[#1e2d3d] rounded-xl p-5 transition-all shadow-lg cursor-pointer hover:shadow-[0_0_16px_2px_rgba(37,99,235,0.5)] hover:border-[#2563eb] transition-all"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white ml-3">Jobs</h3>
                  </div>
                  <p className="text-gray-400 text-sm">Discover job opportunities tailored to your skills and preferences.</p>
                  <button className="mt-4 w-full py-2 bg-[#0a192f] text-white rounded-lg border border-[#1e2d3d] hover:border-[#2563eb] transition-all">
                    Browse Jobs
                  </button>
                </div>
              </div>
              
              {/* Second row of boxes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-8">
                {/* Box 4: Applications */}
                <div 
                  onClick={() => {
                    setShowJobTracker(true);
                    setShowProfile(false);
                    setShowResume(false);
                    setShowCoverLetter(false);
                    setShowCopilot(false);
                    setShowPlayground(false);
                  }}
                  className="group bg-[#0d1b2a] border border-[#1e2d3d] rounded-xl p-5 transition-all shadow-lg cursor-pointer hover:shadow-[0_0_16px_2px_rgba(37,99,235,0.5)] hover:border-[#2563eb] transition-all"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white ml-3">Applications</h3>
                  </div>
                  <p className="text-gray-400 text-sm">Track your job applications and manage your application process.</p>
                  <div className="mt-4 w-full py-2 bg-[#0a192f] text-white rounded-lg border border-[#1e2d3d] hover:border-[#2563eb] transition-all text-center">
                    View Applications
                  </div>
                </div>
                {/* Box 5: Networking Copilot */}
                <div 
                  onClick={() => {
                    setShowCopilot(true);
                    setShowProfile(false);
                    setShowResume(false);
                    setShowCoverLetter(false);
                    setShowJobTracker(false);
                    setShowPlayground(false);
                  }}
                  className="group bg-[#0d1b2a] border border-[#1e2d3d] rounded-xl p-5 transition-all shadow-lg cursor-pointer hover:shadow-[0_0_16px_2px_rgba(37,99,235,0.5)] hover:border-[#2563eb] transition-all"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857l-.548-.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white ml-3">Networking Copilot</h3>
                  </div>
                  <p className="text-gray-400 text-sm">Build and manage your professional network with AI assistance.</p>
                  <div className="mt-4 w-full py-2 bg-[#0a192f] text-white rounded-lg border border-[#1e2d3d] hover:border-[#2563eb] transition-all text-center">
                    Open Copilot
                  </div>
                </div>
                
                {/* Box 6: SmartPrep */}
                <div 
                  onClick={() => {
                    setShowPlayground(true);
                    setShowProfile(false);
                    setShowResume(false);
                    setShowCoverLetter(false);
                    setShowJobTracker(false);
                    setShowCopilot(false);
                  }}
                  className="group bg-[#0d1b2a] border border-[#1e2d3d] rounded-xl p-5 transition-all shadow-lg cursor-pointer hover:shadow-[0_0_16px_2px_rgba(37,99,235,0.5)] hover:border-[#2563eb] transition-all"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-400 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white ml-3">SmartPrep</h3>
                  </div>
                  <p className="text-gray-400 text-sm">AI-powered interview preparation and skill assessment tools.</p>
                  <div className="mt-4 w-full py-2 bg-[#0a192f] text-white rounded-lg border border-[#1e2d3d] hover:border-[#2563eb] transition-all text-center">
                    Start Prep
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <style jsx global>{`
          body {
            margin: 0;
            font-family: 'Inter', sans-serif;
            background: #f0f2f5;
          }

          .sidebar {
            height: 100vh;
            background: linear-gradient(to bottom, #141019, #2563eb);
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
            transition: all 0.3s ease-in-out;
          }
          
          .sidebar.expanded {
            width: 280px;
          }
          
          .sidebar.collapsed {
            width: 60px;
            padding: 20px 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
          .sidebar.open {
            transform: translateX(0);
          }
          
          @media (min-width: 1024px) {
            .sidebar {
              position: fixed;
              transform: translateX(0);
              box-shadow: 2px 0 15px rgba(0, 0, 0, 0.2);
            }
            
            /* Adjust main content based on sidebar state */
            main {
              transition: margin-left 0.3s ease-in-out;
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
          
          /* Hide scrollbar for Chrome, Safari and Opera */
          .top-section::-webkit-scrollbar {
            display: none;
          }
          
          /* Hide scrollbar for IE, Edge and Firefox */
          .top-section {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }

          .menu-group {
            margin-top: 10px;
          }
          
          .sidebar.collapsed .menu-group {
            margin-top: 0;
          }
          
          /* Ensure equal spacing in collapsed mode */
          .sidebar.collapsed .menu-item:last-child {
            margin-bottom: 10px;
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
          .sidebar.collapsed .menu-item {
            margin-bottom: 10px;
            padding: 8px 0;
            border-radius: 12px;
            gap: 16px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          .sidebar.collapsed .menu-item {
            justify-content: center;
            padding: 12px 0;
            position: relative;
          }
          
          .sidebar.collapsed .icon {
            margin: 0;
            font-size: 1.25rem;
          }
          
          /* We're using React-based tooltips instead of CSS pseudo-elements */
          .sidebar.collapsed .menu-item::after {
            content: none;
          }
          
          .sidebar.collapsed .menu-item:hover::after {
            opacity: 0;
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

          .sidebar-tooltip {
            background-color: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 13px;
            z-index: 1000;
            pointer-events: none;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            align-items: center;
            justify-content: center;
            position: fixed;
          }
          
          .sidebar-tooltip::before {
            content: '';
            position: absolute;
            left: -6px;
            top: 50%;
            transform: translateY(-50%);
            width: 0;
            height: 0;
            border-top: 5px solid transparent;
            border-bottom: 5px solid transparent;
            border-right: 6px solid rgba(0, 0, 0, 0.85);
          }
          .menu-item.show-tooltip .sidebar-tooltip {
            opacity: 1;
            pointer-events: auto;
          }
          .sidebar-tooltip::before {
            content: '';
            position: absolute;
            left: -8px;
            top: 50%;
            transform: translateY(-50%);
            border-width: 8px 8px 8px 0;
            border-style: solid;
            border-color: transparent #18192b transparent transparent;
          }
        `}</style>
      </div>
      
      {/* Global tooltip that follows cursor position */}
      {isSidebarCollapsed && tooltipStyle.display !== 'none' && (
        <div 
          className="sidebar-tooltip" 
          style={tooltipStyle}
        >
          {tooltipContent}
        </div>
      )}
    </>
  );
}
