'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { normalizeResumeId } from '@/app/middleware/resumeIdNormalizer';

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
      className="border border-[#1e2d3d] rounded-lg bg-[#0d1b2a] px-2 py-1 lg:flex lg:flex-wrap overflow-x-auto whitespace-nowrap mb-4 shadow-md" 
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
                let path;
                if (section === 'Contact') {
                  path = 'contact-info';
                } else if (section === 'Awards & Honors') {
                  path = 'awards-and-honors';
                } else {
                  path = section.toLowerCase();
                }
                // Normalize the resumeId to ensure consistent URL patterns
                const normalizedId = normalizeResumeId(resumeId);
                router.push(`/dashboard/resume/${normalizedId}/${path}`);
              }}
              className={`text-xs font-bold px-4 py-2 rounded-md uppercase tracking-wide transition-colors duration-150 ${(section === 'Awards & Honors' ? 'awards-and-honors' : section.toLowerCase()) === currentSection ? "border border-[#2563eb] text-gray-300 bg-transparent hover:bg-[#2563eb] hover:bg-opacity-10" : "border border-[#1e2d3d] text-gray-300 bg-transparent hover:bg-[#0d1b2a] hover:border-[#2563eb] hover:text-white"}`}
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
