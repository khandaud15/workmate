'use client';

import { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaPlus } from 'react-icons/fa';
import CreateResumeModal from './CreateResumeModal';

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

interface ResumeSelectorProps {
  resumes: Resume[];
  isLoadingResumes: boolean;
  selectedResumeId: string;
  onSelectResume: (resumeId: string, resume: Resume) => void;
  onResumeUploaded: () => Promise<void>;
}

export default function FixedResumeSelector({
  resumes,
  isLoadingResumes,
  selectedResumeId,
  onSelectResume,
  onResumeUploaded
}: ResumeSelectorProps) {
  // State to track screen width for responsive styling
  const [isMobile, setIsMobile] = useState(false);
  
  // Update isMobile state based on window width
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);
  
  // Find the currently selected resume
  const selectedResume = resumes.find(r => r.id === selectedResumeId);

  // Calculate styles based on mobile/desktop view
  const containerStyle = {
    marginBottom: '20px'
  };
  
  const rowStyle = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    width: isMobile ? '100%' : 'auto'
  };
  
  const dropdownStyle = {
    position: 'relative' as const,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid #1e2d3d',
    borderRadius: '8px',
    backgroundColor: '#0d1b2a',
    padding: '0 12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    width: isMobile ? '50%' : '180px',
    height: '40px',
    cursor: 'pointer',
    flex: isMobile ? '1' : 'none'
  };
  
  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '40px',
    width: isMobile ? '50%' : '180px',
    padding: '0 12px',
    backgroundColor: '#0d1b2a',
    border: '1px solid #1e2d3d',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    flex: isMobile ? '1' : 'none'
  };

  return (
    <div style={containerStyle}>
      <div style={rowStyle}>
        {/* Resume Dropdown */}
        <div 
          ref={dropdownRef}
          style={dropdownStyle}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span style={{
            color: 'white',
            fontSize: '14px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '120px'
          }}>
            {isLoadingResumes ? (
              <span style={{ 
                display: 'inline-block', 
                background: '#4b5563', 
                borderRadius: '4px', 
                width: '80px', 
                height: '16px'
              }} />
            ) : (
              selectedResume?.name || 'Select a resume'
            )}
          </span>
          <span style={{ color: 'white', marginLeft: '8px' }}>
            <FaChevronDown size={16} />
          </span>
          
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              width: '260px',
              marginTop: '4px',
              backgroundColor: '#0d1b2a',
              border: '1px solid #1e2d3d',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              zIndex: 50,
              overflow: 'hidden'
            }}>
              {resumes.length === 0 ? (
                <div style={{ padding: '8px 16px', color: '#9ca3af', fontSize: '14px' }}>
                  No resumes found
                </div>
              ) : (
                resumes.map((resume) => {
                  const resumeId = resume.parsedResumeId || resume.storageName || resume.id;
                  const isSelected = resumeId === selectedResumeId;
                  
                  return (
                    <button
                      key={resume.id}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 16px',
                        fontSize: '14px',
                        color: isSelected ? 'white' : '#e5e5e5',
                        backgroundColor: isSelected ? '#1e2d3d' : 'transparent',
                        border: 'none',
                        fontWeight: isSelected ? 600 : 400,
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectResume(resumeId, resume);
                        setDropdownOpen(false);
                      }}
                    >
                      <span style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '100%',
                        display: 'block'
                      }}>
                        {resume.name}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
        
        {/* Upload Resume Button */}
        <button
          style={buttonStyle}
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus style={{ marginRight: '6px' }} size={12} />
          <span>Upload Resume</span>
        </button>
      </div>
      
      <CreateResumeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onResumeUploaded={onResumeUploaded}
      />
    </div>
  );
}
