'use client';

import { useParams, useRouter, usePathname } from 'next/navigation';
// Import custom hook for resume name
// (dynamic import is used in the component for SSR safety)
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  FaChevronRight, 
  FaTimes, 
  FaBars,
  FaChevronDown
} from 'react-icons/fa';
import DashboardSidebar from '../../../../components/DashboardSidebar';
import DashboardLayout from '../../../../components/DashboardLayout';

export default function ContactInfoPage() {
  const params = useParams();
  const resumeId = params.resumeId as string;
  // ...any other hooks you need

  return (
    <DashboardLayout>
      {/* Main Content */}
      <div className="overflow-y-auto pt-4 lg:pt-0">
        <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-8 lg:p-10">
          {/* Resume Name Box */}
          {/* Resume Name Box with Dropdown */}
          {(() => {
            // Dynamic imports for SSR safety
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { useResumeName } = require('../../../../hooks/useResumeName');
            const { resumeName, isLoading } = useResumeName(resumeId);
            const React = require('react');
            const { useEffect, useRef, useState } = React;
            const { useRouter } = require('next/navigation');
            const router = useRouter();

            // Fetch all resumes (replicate fetchResumes logic)
            const [resumes, setResumes] = useState([]);
            const [dropdownOpen, setDropdownOpen] = useState(false);
            const boxRef = useRef(null);

            useEffect(() => {
              fetch(`/api/resume/list?t=${Date.now()}`)
                .then(res => res.json())
                .then(data => setResumes(data.resumes || []));
            }, []);

            // Close dropdown on outside click
            useEffect(() => {
              function handleClick(e: MouseEvent): void {
                if (boxRef.current && !boxRef.current.contains(e.target)) {
                  setDropdownOpen(false);
                }
              }
              if (dropdownOpen) document.addEventListener('mousedown', handleClick);
              return () => document.removeEventListener('mousedown', handleClick);
            }, [dropdownOpen]);

            // Normalize resumeId for comparison (extract numeric part if present)
            const normalizedResumeId = resumeId.match(/^\d+/)?.[0] || resumeId;
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
              <div ref={boxRef} className="relative inline-flex items-center justify-between mb-4 border border-[#23263a] rounded-lg bg-[#0e0c12] px-3 py-1.5 shadow-md w-auto max-w-xs min-w-[120px]">
                <span className="truncate text-white font-medium text-sm max-w-[100px]">
                  {isLoading ? (
                    <span className="inline-block bg-gray-700 rounded w-20 h-4 animate-pulse" />
                  ) : (
                    (currentResume && (currentResume.name || currentResume.storageName || currentResume.id)) || resumeName || 'Resume'
                  )}
                </span>
                <button className="text-white ml-3 flex items-center" onClick={() => setDropdownOpen((v: boolean) => !v)} aria-label="Show resume list">
                  <FaChevronDown size={16} />
                </button>
                {/* Dropdown menu (right-aligned) */}
                {dropdownOpen && (
                  <div className="absolute left-0 top-full mt-1 bg-[#171923] border border-[#23263a] rounded-lg shadow-lg w-[260px] z-50 overflow-hidden">
                    {resumes.length === 0 ? (
                      <div className="px-4 py-2 text-gray-400 text-sm">No resumes found</div>
                    ) : (
                      resumes.map((r: { id?: string; storageName?: string; name?: string }) => (
                        <button
                          key={r.id || r.storageName}
                          className={`block w-full text-left px-4 py-2 text-sm truncate hover:bg-[#23263a] ${((r.storageName === resumeId || r.id === resumeId) ? 'bg-[#23263a] text-white font-semibold' : 'text-gray-200')}`}
                          onClick={() => {
                            setDropdownOpen(false);
                            // Extract just the numeric ID part (before any underscore)
                            let targetId = r.id || '';
                            if (r.storageName) {
                              // If it's a filename with timestamp (like 1749488145139_Daud2.pdf)
                              // Extract just the numeric part before the underscore
                              const match = r.storageName.match(/^(\d+)/);
                              if (match && match[1]) {
                                targetId = match[1];
                              } else {
                                targetId = r.storageName;
                              }
                            }
                            console.log('DEBUG: Switching to resume:', { name: r.name, rawId: r.id, storageName: r.storageName, targetId });
                            // Force a full page navigation to the same route pattern
                            router.push(`/dashboard/resume/${targetId}/contact-info`);
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
          })()}

          
          {/* Single-row section nav, all sections in one container */}
          <div className="flex flex-col gap-2 mb-4">
            {/* Button-style nav: each section is a button, matching the action buttons below */}
            {/* All nav buttons inside a single container, always two lines, matching screenshot */}
            <div className="border border-[#23263a] rounded-lg bg-[#0e0c12] px-2 py-1 lg:flex lg:flex-wrap overflow-x-auto whitespace-nowrap mb-4 shadow-md" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="flex flex-nowrap lg:flex-wrap gap-x-2 gap-y-1 pb-1 lg:pb-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {[
                "Contact",
                "Experience",
                "Project",
                "Education",
                "Certifications",
                "Coursework",
                "Involvement",
                "Awards & Honors",
                "Skills",
                "Publications",
                "References",
                "Summary",
                "FINISH UP & PREVIEW"
              ].map((section) => (
                <button
                  key={section}
                  className={
                    `text-xs font-bold px-4 py-2 rounded-md uppercase tracking-wide transition-colors duration-150 ` +
                    (section === "Contact" ? 
                    "border border-[#2563eb] text-gray-300 bg-transparent hover:bg-[#2563eb] hover:bg-opacity-10" :
                    "border border-[#363b4d] text-gray-300 bg-transparent hover:bg-[#23263a] hover:text-white")
                  }
                  style={{ userSelect: "none", minWidth: 'fit-content' }}
                >
                  {section}
                </button>
              ))}
              </div>
            </div>
          </div>

          {/* Contact Info Box */}
          <div className="border border-[#23263a] rounded-lg bg-[#0e0c12] px-3 sm:px-4 md:px-6 py-4 sm:py-6 mt-1 sm:mt-2 w-full max-w-full shadow-lg min-h-[400px]">
             {/* Autofill Contact Info Form */}
            {(() => {
              const React = require('react');
              const { useEffect, useState } = React;
              interface ContactInfo {
                fullName: string;
                emailAddress: string;
                phoneNumber: string;
                linkedinUrl: string;
                state: string;
                city: string;
                address: string;
                zipCode: string;
              }

              const initialContactInfo: ContactInfo = {
                fullName: '',
                emailAddress: '',
                phoneNumber: '',
                linkedinUrl: '',

                state: '',
                city: '',
                address: '',
                zipCode: ''
              };

              const [contactInfo, setContactInfo] = useState(initialContactInfo);
              const [parsedData, setParsedData] = useState(null);
              const [isLoading, setIsLoading] = useState(true);

              useEffect(() => {
                console.log('DEBUG: Fetching contact info for resumeId:', resumeId);
                // Reset state when resumeId changes
                setContactInfo(initialContactInfo);
                setParsedData(null);
                setIsLoading(true);
                
                // Add cache-busting parameter to prevent stale data
                fetch(`/api/resume/contact-info?id=${resumeId}&t=${Date.now()}`)
                  .then(res => res.json())
                  .then(data => {
                    console.log('DEBUG: Received contact info response:', data);
                    // API returns data under contactInfo property
                    setParsedData(data.contactInfo);
                    console.log('DEBUG: Parsed data set to:', data.contactInfo);
                    
                    // Always autofill from contactInfo if present
                    if (data && data.contactInfo) {
                      const pd = data.contactInfo;
                      console.log('DEBUG: Parsing contact info from:', pd);
                      const autofillInfo = {
                        fullName: pd['Full Name'] || pd.fullName || pd.name || '',
                        emailAddress: pd['Email'] || pd.emailAddress || pd.email || '',
                        phoneNumber: pd['Phone'] || pd.phoneNumber || pd.phone || '',
                        linkedinUrl: pd['LinkedIn'] || pd.linkedinUrl || pd.linkedin || '',

                        state: pd['State'] || pd.state || '',
                        city: pd['City'] || pd.city || '',
                        // Try multiple possible field names for address and zip code
                        address: pd['Address'] || pd.address || '',
                        zipCode: pd['Postal Code'] || pd.zipCode || pd['ZIP'] || ''
                      };
                      console.log('DEBUG: Created autofill info:', autofillInfo);
                      setContactInfo(autofillInfo);
                    }
                    // If parsedData is missing but contactInfo exists, fallback
                    else if (data && data.contactInfo) {
                      setContactInfo(data.contactInfo);
                    } 
                    setIsLoading(false);
                  })
                  .catch(error => {
                    console.error('Error fetching contact info:', error);
                    setIsLoading(false);
                  });
              }, [resumeId]);

              function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
                const { name, value } = e.target;
                setContactInfo((prev: ContactInfo) => ({ ...prev, [name]: value }));
              }

              async function handleSubmit(e: React.FormEvent) {
                e.preventDefault();
                try {
                  // Create a copy of contactInfo to modify
                  const updatedContactInfo = { ...contactInfo };

                  // Clean up LinkedIn URL
                  if (updatedContactInfo.linkedinUrl) {
                    let linkedinUrl = updatedContactInfo.linkedinUrl.trim();
                    if (!linkedinUrl.startsWith('http://') && !linkedinUrl.startsWith('https://')) {
                      linkedinUrl = 'https://' + linkedinUrl;
                    }
                    updatedContactInfo.linkedinUrl = linkedinUrl;
                  }

                  // Clean up Personal Website URL
                  if (updatedContactInfo.personalWebsite) {
                    let websiteUrl = updatedContactInfo.personalWebsite.trim();
                    if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
                      websiteUrl = 'https://' + websiteUrl;
                    }
                    updatedContactInfo.personalWebsite = websiteUrl;
                  }

                  console.log('Saving contact info:', updatedContactInfo);
                  
                  const response = await fetch(`/api/resume/update-contact-info`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resumeId, contactInfo: updatedContactInfo })
                  });
                  
                  const data = await response.json();
                  
                  if (data.success) {
                    console.log('Contact info saved successfully to Firestore');
                    // Update the form state with the cleaned URLs
                    setContactInfo(updatedContactInfo);
                  } else {
                    console.error('Server returned error while saving:', data.error);
                    alert('Failed to save contact information. Please try again.');
                  }
                } catch (error) {
                  console.error('Error saving contact info:', error);
                  alert('Failed to save contact information. Please try again.');
                }
              }

              if (isLoading) {
                return (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                );
              }

              return (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Full Name */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-300 mb-1 uppercase">Full Name</label>
                    <input type="text" name="fullName" value={contactInfo.fullName} onChange={handleChange} className="bg-[#191a23] border border-[#23243a] rounded-md px-3 sm:px-4 py-3 text-gray-100 text-base focus:outline-none focus:border-blue-500 transition shadow-inner w-full" placeholder="Full Name" />
                  </div>
                  {/* Email Address */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-300 mb-1 uppercase">Email Address</label>
                    <input type="email" name="emailAddress" value={contactInfo.emailAddress} onChange={handleChange} className="bg-[#191a23] border border-[#23243a] rounded-md px-3 sm:px-4 py-3 text-gray-100 text-base focus:outline-none focus:border-blue-500 transition shadow-inner w-full" placeholder="Email Address" />
                  </div>
                  {/* Phone Number */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-300 mb-1 uppercase">Phone Number</label>
                    <input type="tel" name="phoneNumber" value={contactInfo.phoneNumber} onChange={handleChange} className="bg-[#191a23] border border-[#23243a] rounded-md px-3 sm:px-4 py-3 text-gray-100 text-base focus:outline-none focus:border-blue-500 transition shadow-inner w-full" placeholder="Phone Number" />
                  </div>
                  {/* LinkedIn URL */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-300 mb-1 uppercase">LinkedIn URL</label>
                    <input type="text" name="linkedinUrl" value={contactInfo.linkedinUrl} onChange={handleChange} className="bg-[#191a23] border border-[#23243a] rounded-md px-3 sm:px-4 py-3 text-gray-100 text-base focus:outline-none focus:border-blue-500 transition shadow-inner w-full" placeholder="LinkedIn URL" />
                  </div>

                  {/* State */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-300 mb-1 uppercase">State</label>
                    <input type="text" name="state" value={contactInfo.state} onChange={handleChange} className="bg-[#191a23] border border-[#23243a] rounded-md px-3 sm:px-4 py-3 text-gray-100 text-base focus:outline-none focus:border-blue-500 transition shadow-inner w-full" placeholder="State" />
                  </div>
                  {/* City */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-300 mb-1 uppercase">City</label>
                    <input type="text" name="city" value={contactInfo.city} onChange={handleChange} className="bg-[#191a23] border border-[#23243a] rounded-md px-3 sm:px-4 py-3 text-gray-100 text-base focus:outline-none focus:border-blue-500 transition shadow-inner w-full" placeholder="City" />
                  </div>
                  {/* Address */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-300 mb-1 uppercase">Address</label>
                    <input type="text" name="address" value={contactInfo.address} onChange={handleChange} className="bg-[#191a23] border border-[#23243a] rounded-md px-3 sm:px-4 py-3 text-gray-100 text-base focus:outline-none focus:border-blue-500 transition shadow-inner w-full" placeholder="Street Address" />
                  </div>
                  {/* ZIP Code */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-300 mb-1 uppercase">ZIP Code</label>
                    <input type="text" name="zipCode" value={contactInfo.zipCode} onChange={handleChange} className="bg-[#191a23] border border-[#23243a] rounded-md px-3 sm:px-4 py-3 text-gray-100 text-base focus:outline-none focus:border-blue-500 transition shadow-inner w-full" placeholder="ZIP Code" />
                  </div>

                  {/* Action Buttons Row */}
                  <div className="col-span-full flex justify-between items-center gap-4 mt-4">
                    <button
                      type="button"
                      className="border border-[#434354] text-white text-base font-medium rounded-lg px-7 py-2 transition-colors duration-150 hover:bg-[#18181c] hover:border-[#63636f]"
                      onClick={() => window.history.back()}
                    >
                      BACK
                    </button>
                    <button
                      type="submit"
                      className="bg-black text-white text-base font-bold rounded-lg border border-[#434354] px-7 py-2 transition-colors duration-150 hover:bg-[#18181c]"
                    >
                      SAVE
                    </button>
                  </div>
                </form>
              );
            })()}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
