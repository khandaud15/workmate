'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ResumeNavigationProps {
  resumeId: string;
  currentSection: string;
}

export default function ResumeNavigation({ resumeId, currentSection }: ResumeNavigationProps) {
  const router = useRouter();
  const sections = [
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
  ];

  return (
    <div 
      className="border border-[#23263a] rounded-lg bg-[#0e0c12] px-2 py-1 lg:flex lg:flex-wrap overflow-x-auto whitespace-nowrap mb-4 shadow-md" 
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <div 
        className="flex flex-nowrap lg:flex-wrap gap-x-2 gap-y-1 pb-1 lg:pb-0" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {sections.map((section) => 
          section === "FINISH UP & PREVIEW" ? (
            <button
              key={section}
              className="text-xs font-bold px-4 py-2 rounded-md uppercase tracking-wide transition-colors duration-150 text-gray-500 cursor-not-allowed"
              disabled
            >
              {section}
            </button>
          ) : (
            <button
              key={section}
              onClick={() => {
                const path = section === 'Contact' ? 'contact-info' : section.toLowerCase();
                router.push(`/dashboard/resume/${resumeId}/${path}`);
              }}
              className={`text-xs font-bold px-4 py-2 rounded-md uppercase tracking-wide transition-colors duration-150 ${section.toLowerCase() === currentSection ? "border border-[#2563eb] text-gray-300 bg-transparent hover:bg-[#2563eb] hover:bg-opacity-10" : "border border-[#363b4d] text-gray-300 bg-transparent hover:bg-[#23263a] hover:text-white"}`}
              style={{ userSelect: "none", minWidth: 'fit-content' }}
            >
              {section}
            </button>
          )
        )}
      </div>
    </div>
  );
}
