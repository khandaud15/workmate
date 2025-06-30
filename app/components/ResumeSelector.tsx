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

export default function ResumeSelector({
  resumes,
  isLoadingResumes,
  selectedResumeId,
  onSelectResume,
  onResumeUploaded
}: ResumeSelectorProps) {
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

  // Handle modal close
  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  // Handle resume upload completion
  const handleResumeUploaded = async () => {
    setShowCreateModal(false);
    await onResumeUploaded();
  };

  return (
    <div className="resume-selector-container">
      <style jsx>{`
        .resume-selector-container {
          margin-bottom: 16px;
        }
        .selector-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .dropdown-container {
          position: relative;
          width: 180px;
          height: 40px;
        }
        .dropdown-button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          height: 100%;
          padding: 0 12px;
          background-color: #0d1b2a;
          border: 1px solid #1e2d3d;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .dropdown-text {
          color: white;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }
        .dropdown-icon {
          color: white;
          margin-left: 8px;
        }
        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          width: 260px;
          margin-top: 4px;
          background-color: #0d1b2a;
          border: 1px solid #1e2d3d;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          z-index: 50;
          overflow: hidden;
        }
        .dropdown-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 8px 16px;
          font-size: 14px;
          color: #e5e5e5;
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .dropdown-item:hover {
          background-color: #1e2d3d;
        }
        .dropdown-item.selected {
          background-color: #1e2d3d;
          color: white;
          font-weight: 600;
        }
        .dropdown-item-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
          display: block;
        }
        .upload-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 40px;
          width: 180px;
          padding: 0 12px;
          background-color: #0d1b2a;
          border: 1px solid #1e2d3d;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: background-color 0.2s;
        }
        .upload-button:hover {
          background-color: #1e2d3d;
        }
        .upload-icon {
          margin-right: 6px;
        }
        .empty-message {
          padding: 8px 16px;
          color: #9ca3af;
          font-size: 14px;
        }
      `}</style>

      <div className="selector-row">
        <div className="dropdown-container" ref={dropdownRef}>
          <div className="dropdown-button" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <span className="dropdown-text">
              {isLoadingResumes ? (
                <span style={{ display: 'inline-block', background: '#4b5563', borderRadius: '4px', width: '80px', height: '16px', animation: 'pulse 1.5s infinite ease-in-out' }} />
              ) : (
                selectedResume?.name || 'Select a resume'
              )}
            </span>
            <span className="dropdown-icon">
              <FaChevronDown size={16} />
            </span>
          </div>
          
          {dropdownOpen && (
            <div className="dropdown-menu">
              {resumes.length === 0 ? (
                <div className="empty-message">No resumes found</div>
              ) : (
                resumes.map((resume) => {
                  const resumeId = resume.parsedResumeId || resume.storageName || resume.id;
                  const isSelected = resumeId === selectedResumeId;
                  
                  return (
                    <button
                      key={resume.id}
                      className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectResume(resumeId, resume);
                        setDropdownOpen(false);
                      }}
                    >
                      <span className="dropdown-item-text">{resume.name}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
        
        <button className="upload-button" onClick={() => setShowCreateModal(true)}>
          <FaPlus className="upload-icon" size={12} />
          <span>Upload Resume</span>
        </button>
      </div>
      
      <CreateResumeModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onResumeUploaded={handleResumeUploaded}
      />
    </div>
  );
}
