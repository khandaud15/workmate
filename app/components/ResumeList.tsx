import React, { useEffect, useState } from 'react';
import { FaFileAlt, FaLock, FaEllipsisV, FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import CreateResumeModal from './CreateResumeModal';

interface Resume {
  id: string;
  name: string;
  storageName: string;
  createdAt: string;
  updatedAt: string;
  url: string;
  isTargeted?: boolean;
  isLocked?: boolean;
}

const fetchResumes = async (): Promise<Resume[]> => {
  try {
    // Add a cache-busting parameter to ensure we get fresh data
    const res = await fetch(`/api/resume/list?t=${Date.now()}`);
    const data = await res.json();
    console.log('Fetched resumes:', data.resumes);
    
    // Map API response to Resume[]
    return (data.resumes || []).map((r: any, i: number) => ({
      id: r.storageName || r.url, // fallback to url if storageName missing
      name: r.name, // display name (custom or cleaned)
      storageName: r.storageName, // actual storage file name
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      isTargeted: r.isTargeted === true, // Only show badge if backend says so
      isLocked: false, // Update if you have this info
      url: r.url,
    }));
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return [];
  }
};

function timeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

const ResumeList: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [newResumeName, setNewResumeName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [menuOpenIdx, setMenuOpenIdx] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchResumes().then(setResumes);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = () => setMenuOpenIdx(null);
    if (menuOpenIdx !== null) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [menuOpenIdx]);

  return (
    <div className="w-full mx-auto mt-8 px-2 sm:px-4 md:px-8 font-helvetica">
      {/* Header Row for Creating New Resume */}


      {/* Table Header with sort and view toggles */}
      <div className="flex items-center text-gray-400 text-xs uppercase px-3 pb-3 font-bold tracking-wider font-helvetica">
        <div className="flex-1 flex items-center gap-2">
          Name
        </div>
        <div className="w-36 text-center flex items-center justify-center gap-1">
          Created
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="inline-block"><path d="M7 10l3 3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div className="w-36 text-center text-gray-400 text-sm font-helvetica hidden md:block">Edited</div>
        <div className="w-10 flex items-center justify-end gap-2">
          {/* View toggles */}
          <button className="hover:text-white font-helvetica"><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="5" height="5" rx="1" fill="currentColor"/><rect x="12" y="3" width="5" height="5" rx="1" fill="currentColor"/><rect x="3" y="12" width="5" height="5" rx="1" fill="currentColor"/><rect x="12" y="12" width="5" height="5" rx="1" fill="currentColor"/></svg></button>
          <button className="hover:text-white font-helvetica"><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="2" rx="1" fill="currentColor"/><rect x="3" y="9" width="14" height="2" rx="1" fill="currentColor"/><rect x="3" y="14" width="14" height="2" rx="1" fill="currentColor"/></svg></button>
        </div>
      </div>

      {/* Create new resume button row */}
      <button
        className="w-full border-2 border-dotted border-[#4b5563] rounded-md px-7 py-3 mb-2 flex items-center justify-center gap-2 bg-transparent text-white font-helvetica text-base hover:bg-[#23263a] transition min-h-[48px]"
        style={{ minHeight: '48px' }}
        onClick={() => setShowCreateModal(true)}
      >
        <span className="">Create new resume</span>
        <FaPlus className="text-purple-400 text-lg" />
      </button>
      <CreateResumeModal
        isOpen={showCreateModal}
        onClose={() => {
          console.log('Modal close triggered');
          setShowCreateModal(false);
        }}
        onResumeUploaded={async () => {
          console.log('Resume uploaded, refreshing list');
          const updated = await fetchResumes();
          setResumes(updated);
          console.log('Setting showCreateModal to false');
          setShowCreateModal(false);
          // Always fetch fresh data after modal closes (create, rename, or target)
          fetchResumes().then(setResumes);
        }}
      />
      {/* Resume List */}
      <div className="space-y-4 font-helvetica">
        {resumes.length === 0 ? (
          <div className="text-center text-gray-500 py-12 text-lg font-helvetica">No resumes found. Upload or create a new resume to get started.</div>
        ) : resumes.map((resume, idx) => {
          const menuId = `resume-menu-${idx}`;
          return (
            <div
              key={resume.id}
              className="relative flex items-center border border-[#23263a] rounded-md px-7 py-3 transition group min-h-[48px] shadow-xl font-helvetica bg-transparent hover:bg-[#23263a] cursor-pointer"
              onClick={() => {
                // Extract numeric ID from storageName or id (e.g., 1748752352469_Resume.pdf -> 1748752352469)
                let rawId = resume.storageName || resume.id;
                let numericId = rawId.split('_')[0];
                router.push(`/dashboard/resume/${numericId}/contact-info`);
              }}
            >
              <FaFileAlt className="text-gray-300 mr-5 flex-shrink-0" size={22} />
              <div className="flex-1 truncate text-white font-semibold text-base font-helvetica">
                {resume.name.replace(/\.[^/.]+$/, "")}

                {/* Simple debug log for targeted status */}
                {(() => {
                  console.log(`Resume ${resume.name} targeted status:`, resume.isTargeted);
                  return null;
                })()}
                {resume.isTargeted && (
                  <span className="ml-4 px-4 py-1 text-xs bg-blue-700 text-white rounded-full align-middle font-bold tracking-wide">TARGETED</span>
                )}
              </div>
              <div className="w-36 text-center text-gray-400 text-sm font-helvetica">{timeAgo(resume.createdAt)}</div>
              <div className="w-36 text-center text-gray-400 text-sm font-helvetica hidden md:block">{timeAgo(resume.updatedAt)}</div>
              <div className="w-12 flex justify-end items-center gap-3">
                <a
                  href={resume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-200 font-helvetica"
                  title="Download Resume"
                  onClick={e => e.stopPropagation()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="inline-block" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>
                </a>
                {resume.isLocked ? (
                  <FaLock className="text-gray-500 text-xl" />
                ) : (
                  <div className="relative">
                    <button
                      className="text-gray-400 cursor-pointer text-xl font-helvetica"
                      aria-haspopup="true"
                      aria-controls={menuId}
                      onClick={e => {
                        e.stopPropagation();
                        setMenuOpenIdx(menuOpenIdx === idx ? null : idx);
                      }}
                    >
                      <FaEllipsisV />
                    </button>
                    {menuOpenIdx === idx && (
                      <div
                        id={menuId}
                        className="absolute right-0 mt-2 w-32 z-20 bg-[#23263a] border border-[#363b4d] rounded-lg shadow-lg py-1 animate-fade-in font-helvetica"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          className="w-full text-left px-4 py-2 text-red-400 hover:bg-[#363b4d] hover:text-red-500 text-sm rounded font-helvetica"
                          onClick={async () => {
                            setMenuOpenIdx(null);
                            try {
                              // Extract file name from URL if storageName is not available
                              // URL format is typically like: https://storage.googleapis.com/talexus-4339c.appspot.com/raw_resume/user@email.com/1748727806656_Daud_CV.pdf
                              let fileIdentifier = resume.storageName;
                              
                              if (!fileIdentifier && resume.url) {
                                // Try to extract the file path from the URL
                                const urlParts = resume.url.split('raw_resume/');
                                if (urlParts.length > 1) {
                                  fileIdentifier = 'raw_resume/' + urlParts[1];
                                }
                              }
                              
                              console.log('Deleting resume with identifier:', fileIdentifier);
                              
                              const res = await fetch('/api/resume/delete', {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ name: fileIdentifier }),
                              });
                              
                              const responseData = await res.json();
                              
                              if (!res.ok) {
                                console.error('Delete failed:', responseData);
                                alert('Failed to delete resume: ' + (responseData.error || res.status));
                                return;
                              }
                              
                              console.log('Delete successful:', responseData);
                              // Re-fetch resumes from server to ensure UI is in sync
                              const updated = await fetchResumes();
                              setResumes(updated);
                            } catch (e) {
                              console.error('Delete error:', e);
                              alert('Failed to delete resume: ' + (e instanceof Error ? e.message : String(e)));
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Section Button */}
      <div className="flex justify-center mt-8 font-helvetica">
        <button className="flex items-center bg-[#181b23] border border-dotted border-2 border-[#23263a] rounded-md px-4 py-2 text-sm text-gray-400 hover:text-purple-400 gap-2 font-semibold shadow-lg font-helvetica">
          <FaPlus size={14} /> ADD SECTION
        </button>
      </div>
    </div>
  );
};

export default ResumeList;
