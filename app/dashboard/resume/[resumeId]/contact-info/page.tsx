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
        <div className="w-full px-2 sm:px-6 md:px-8 py-4">
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

            // Find current resume
            const currentResume = resumes.find((r: { id?: string; storageName?: string; name?: string }) => r.storageName === resumeId || r.id === resumeId);

            return (
              <div ref={boxRef} className="relative inline-flex items-center justify-between mb-4 border border-[#23263a] rounded-lg bg-[#0e0c12] px-3 py-1.5 shadow-md w-auto max-w-xs min-w-[120px]">
                <span className="truncate text-white font-medium text-sm max-w-[100px]">
                  {isLoading ? (
                    <span className="inline-block bg-gray-700 rounded w-20 h-4 animate-pulse" />
                  ) : (
                    (currentResume && currentResume.name) || resumeName || 'Resume'
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
                            if (r.storageName !== resumeId && r.id !== resumeId) {
                              router.push(`/dashboard/resume/${r.storageName || r.id}/contact-info`);
                            }
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
                    `border border-[#363b4d] text-xs font-bold px-4 py-2 rounded-md uppercase tracking-wide transition-colors duration-150 ` +
                    "bg-transparent text-gray-300 hover:bg-[#23263a] hover:text-white"
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
          <div className="border border-[#23263a] rounded-lg bg-[#0e0c12] px-6 py-6 mt-2 w-full max-w-full shadow-lg">
             {/* Autofill Contact Info Form */}
            {(() => {
              const React = require('react');
              const { useEffect, useState } = React;
              const [contactInfo, setContactInfo] = useState({
                fullName: '',
                emailAddress: '',
                phoneNumber: '',
                linkedinUrl: '',
                personalWebsite: '',
                country: 'USA',
                state: '',
                city: '',
              });

              useEffect(() => {
                fetch(`/api/resume/contact-info?id=${resumeId}`)
                  .then(res => res.json())
                  .then(data => {
                    if (data && data.contactInfo) setContactInfo({
                      fullName: data.contactInfo.fullName || '',
                      emailAddress: data.contactInfo.emailAddress || '',
                      phoneNumber: data.contactInfo.phoneNumber || '',
                      linkedinUrl: data.contactInfo.linkedinUrl || '',
                      personalWebsite: data.contactInfo.personalWebsite || '',
                      country: data.contactInfo.country || 'USA',
                      state: data.contactInfo.state || '',
                      city: data.contactInfo.city || '',
                    });
                  });
              }, [resumeId]);

              function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
                const { name, value } = e.target;
                setContactInfo((prev: typeof contactInfo) => ({ ...prev, [name]: value }));
              }

              return (
                <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Full Name */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-300 mb-1 uppercase">Full Name</label>
                    <input type="text" name="fullName" value={contactInfo.fullName} onChange={handleChange} className="bg-[#191a23] border border-[#23243a] rounded-md px-4 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500 transition shadow-inner" placeholder="Full Name" />
                  </div>
                  {/* Email Address */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-300 mb-1 uppercase">Email Address</label>
                    <input type="email" name="emailAddress" value={contactInfo.emailAddress} onChange={handleChange} className="bg-[#191a23] border border-[#23243a] rounded-md px-4 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500 transition shadow-inner" placeholder="Email Address" />
                  </div>
                  {/* Phone Number */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-300 mb-1 uppercase">Phone Number</label>
                    <input type="tel" name="phoneNumber" value={contactInfo.phoneNumber} onChange={handleChange} className="bg-[#191a23] border border-[#23243a] rounded-md px-4 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500 transition shadow-inner" placeholder="Phone Number" />
                  </div>
                  {/* LinkedIn URL */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-300 mb-1 uppercase">LinkedIn URL</label>
                    <input type="url" name="linkedinUrl" value={contactInfo.linkedinUrl} onChange={handleChange} className="bg-[#191a23] border border-[#23243a] rounded-md px-4 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500 transition shadow-inner" placeholder="LinkedIn URL" />
                  </div>
                  {/* Personal Website */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-300 mb-1 uppercase">Personal Website <span className="font-normal lowercase">or relevant link</span></label>
                    <input type="url" name="personalWebsite" value={contactInfo.personalWebsite} onChange={handleChange} className="bg-[#191a23] border border-[#23243a] rounded-md px-4 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500 transition shadow-inner" placeholder="https://yourwebsite.com" />
                  </div>
                  {/* Country */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-300 mb-1 uppercase">Country</label>
                    <select name="country" value={contactInfo.country} onChange={handleChange} className="bg-[#191a23] border border-[#23243a] rounded-md px-4 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500 transition shadow-inner">
                      <option>USA</option>
                      <option>Canada</option>
                      <option>Other</option>
                    </select>
                  </div>
                  {/* State */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-300 mb-1 uppercase">State</label>
                    <select name="state" value={contactInfo.state} onChange={handleChange} className="bg-[#191a23] border border-[#23243a] rounded-md px-4 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500 transition shadow-inner">
                      <option>IL</option>
                      <option>NY</option>
                      <option>CA</option>
                      <option>Other</option>
                    </select>
                  </div>
                  {/* City */}
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-300 mb-1 uppercase">City</label>
                    <select name="city" value={contactInfo.city} onChange={handleChange} className="bg-[#191a23] border border-[#23243a] rounded-md px-4 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500 transition shadow-inner">
                      <option>Chicago</option>
                      <option>New York</option>
                      <option>San Francisco</option>
                      <option>Other</option>
                    </select>
                  </div>

                </form>
              );
            })()}

          </div>
        {/* Action Buttons Row - moved inside the padded container */}
        <div className="flex justify-between items-center gap-4 mt-8">
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
        </div>
      </div>
    </DashboardLayout>
  );
}
