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

export default function ContactInfoPage() {
  const params = useParams();
  const resumeId = params.resumeId as string;
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  
  const pathname = usePathname();
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  // Handle click outside to close sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar && !sidebar.contains(event.target as Node) && window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);
  
  return (
    <div className="flex min-h-screen bg-[#0e0c12] relative overflow-x-hidden">
      {/* Mobile Toggle Button - Only visible when sidebar is closed */}
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
      <DashboardSidebar 
        defaultCollapsed={true}
      />

      {/* Main Content */}
      <main 
        className={`flex-1 overflow-y-auto pt-4 lg:pt-0 transition-all duration-300 bg-[#0e0c12] text-white ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'}`}
        onClick={() => {
          // Collapse sidebar when clicking on main content area
          if (!isSidebarCollapsed && window.innerWidth >= 1024) {
            setIsSidebarCollapsed(true);
          }
        }}
      >
        <div className="w-full px-4 sm:px-6 md:px-8 py-4">
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
              function handleClick(e) {
                if (boxRef.current && !boxRef.current.contains(e.target)) {
                  setDropdownOpen(false);
                }
              }
              if (dropdownOpen) document.addEventListener('mousedown', handleClick);
              return () => document.removeEventListener('mousedown', handleClick);
            }, [dropdownOpen]);

            // Find current resume
            const currentResume = resumes.find(r => r.storageName === resumeId || r.id === resumeId);

            return (
              <div ref={boxRef} className="relative inline-flex items-center justify-between mb-4 border border-[#2d3250] rounded-lg bg-[#171923] px-3 py-1.5 shadow-md w-auto max-w-xs min-w-[120px]">
                <span className="truncate text-white font-medium text-sm max-w-[100px]">
                  {isLoading ? (
                    <span className="inline-block bg-gray-700 rounded w-20 h-4 animate-pulse" />
                  ) : (
                    (currentResume && currentResume.name) || resumeName || 'Resume'
                  )}
                </span>
                <button className="text-white ml-3 flex items-center" onClick={() => setDropdownOpen(v => !v)} aria-label="Show resume list">
                  <FaChevronDown size={16} />
                </button>
                {/* Dropdown menu (right-aligned) */}
                {dropdownOpen && (
                  <div className="absolute left-0 top-full mt-1 bg-[#171923] border border-[#2d3250] rounded-lg shadow-lg w-[260px] z-50 overflow-hidden">
                    {resumes.length === 0 ? (
                      <div className="px-4 py-2 text-gray-400 text-sm">No resumes found</div>
                    ) : (
                      resumes.map((r: any) => (
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
            <div className="border border-[#2d3250] rounded-lg bg-[#171923] px-2 py-1 lg:flex lg:flex-wrap overflow-x-auto whitespace-nowrap mb-4 shadow-md" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
          <div className="border border-[#2d3250] rounded-lg bg-[#171923] px-6 py-6 mt-2 w-full max-w-full shadow-lg">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Full Name */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-300 mb-1 uppercase">Full Name</label>
                <input type="text" className="bg-[#1e212d] border border-[#2d3250] rounded-md px-4 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500 transition shadow-inner" placeholder="Full Name" />
              </div>
              {/* Email Address */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-300 mb-1 uppercase">Email Address</label>
                <input type="email" className="bg-[#1e212d] border border-[#2d3250] rounded-md px-4 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500 transition shadow-inner" placeholder="Email Address" />
              </div>
              {/* Phone Number */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-300 mb-1 uppercase">Phone Number</label>
                <input type="tel" className="bg-[#1e212d] border border-[#2d3250] rounded-md px-4 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500 transition shadow-inner" placeholder="Phone Number" />
              </div>
              {/* LinkedIn URL */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-300 mb-1 uppercase">LinkedIn URL</label>
                <input type="url" className="bg-[#1e212d] border border-[#2d3250] rounded-md px-4 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500 transition shadow-inner" placeholder="LinkedIn URL" />
              </div>
              {/* Personal Website */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-300 mb-1 uppercase">Personal Website <span className="font-normal lowercase">or relevant link</span></label>
                <input type="url" className="bg-[#1e212d] border border-[#2d3250] rounded-md px-4 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500 transition shadow-inner" placeholder="https://yourwebsite.com" />
              </div>
              {/* Country */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-300 mb-1 uppercase">Country</label>
                <select className="bg-[#1e212d] border border-[#2d3250] rounded-md px-4 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500 transition shadow-inner">
                  <option>USA</option>
                  <option>Canada</option>
                  <option>Other</option>
                </select>
              </div>
              {/* State */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-300 mb-1 uppercase">State</label>
                <select className="bg-[#1e212d] border border-[#2d3250] rounded-md px-4 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500 transition shadow-inner">
                  <option>IL</option>
                  <option>NY</option>
                  <option>CA</option>
                  <option>Other</option>
                </select>
              </div>
              {/* City */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-300 mb-1 uppercase">City</label>
                <select className="bg-[#1e212d] border border-[#2d3250] rounded-md px-4 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500 transition shadow-inner">
                  <option>Chicago</option>
                  <option>New York</option>
                  <option>San Francisco</option>
                  <option>Other</option>
                </select>
              </div>
              {/* Save Button */}
              <div className="col-span-1 md:col-span-2 flex justify-end mt-2">
                <button type="submit" className="bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold text-xs uppercase px-6 py-2 rounded-md transition">Save Basic Info</button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Global Styles */}
      <style jsx global>{`
        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
          background: #0e0c12;
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
      `}</style>
    </div>
  );
}
