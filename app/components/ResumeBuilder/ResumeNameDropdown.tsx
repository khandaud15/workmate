'use client';

import { useState, useEffect, useRef } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { normalizeResumeId } from '@/app/middleware/resumeIdNormalizer';
import { useResumeName } from '../../hooks/useResumeName';

interface ResumeNameDropdownProps {
  resumeId: string;
  currentSection: string;
}

export default function ResumeNameDropdown({ resumeId, currentSection }: ResumeNameDropdownProps) {
  const { resumeName, isLoading: isLoadingName } = useResumeName(resumeId);
  interface Resume {
    name: string;
    storageName: string;
    id: string;
  }
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/resume/list?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => setResumes(data.resumes || []));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (boxRef.current && !boxRef.current.contains(target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  // Normalize resumeId for comparison (extract numeric part if present)
  const normalizedResumeId = resumeId ? (resumeId.match(/^\d+/)?.[0] || resumeId) : '';
  
  // Find current resume by comparing normalized IDs
  const currentResume = resumes.find((r: { id?: string; storageName?: string; name?: string }) => {
    // Normalize storageName (extract numeric prefix)
    let storageId = r.storageName ? (r.storageName.match(/^\d+/)?.[0] || r.storageName) : undefined;
    return (
      storageId === normalizedResumeId ||
      (r.id && r.id === normalizedResumeId) ||
      (r.name && r.name === resumeId) // fallback, in case name is used as id
    );
  });

  return (
    <div 
      ref={boxRef} 
      className="relative inline-flex items-center justify-between mb-4 border border-[#1e2d3d] rounded-lg bg-[#0d1b2a] px-3 py-1.5 shadow-md w-auto max-w-xs min-w-[120px]"
    >
      <span className="truncate text-white font-medium text-sm max-w-[100px]">
        {isLoadingName ? (
          <span className="inline-block bg-gray-700 rounded w-20 h-4 animate-pulse" />
        ) : (
          (currentResume && (currentResume.name || currentResume.storageName || currentResume.id)) || resumeName || 'Resume'
        )}
      </span>
      <button 
        className="text-white ml-3 flex items-center" 
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-label="Show resume list"
      >
        <FaChevronDown size={16} />
      </button>
      {dropdownOpen && (
        <div className="absolute left-0 top-full mt-1 bg-[#0d1b2a] border border-[#1e2d3d] rounded-lg shadow-lg w-[260px] z-50 overflow-hidden">
          {resumes.length === 0 ? (
            <div className="px-4 py-2 text-gray-400 text-sm">No resumes found</div>
          ) : (
            resumes.map((r: { id?: string; storageName?: string; name?: string }) => (
              <button
                key={r.id || r.storageName}
                className={`block w-full text-left px-4 py-2 text-sm truncate hover:bg-[#1e2d3d] ${((r.storageName === resumeId || r.id === resumeId) ? 'bg-[#1e2d3d] text-white font-semibold' : 'text-gray-200')}`}
                onClick={() => {
                  setDropdownOpen(false);
                  // Use the ID or storageName, whichever is available
                  let targetId = r.id || r.storageName || '';
                  
                  // Normalize the resumeId to ensure consistent URL format
                  targetId = normalizeResumeId(targetId);
                  
                  router.push(`/dashboard/resume/${targetId}/${currentSection}`);
                }}
              >
                <span className="truncate block w-full">{r.name || 'Resume'}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
