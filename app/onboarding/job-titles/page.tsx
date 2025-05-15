'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// Mock job titles for demonstration
const mockJobTitles = [
  // Biotechnology & Life Sciences
  'Bioinformatics Scientist',
  'Bioinformatics Engineer',
  'Biotechnology Research Scientist',
  'Biomedical Engineer',
  'Biotechnology Project Manager',
  'Research Scientist',
  'Laboratory Manager',
  'Molecular Biologist',
  'Biochemist',
  'Clinical Research Associate',
  'Bioprocess Engineer',
  'Computational Biologist',
  'Drug Discovery Scientist',
  'Genomics Researcher',
  'Protein Engineer',
  
  // Technology & Engineering
  'Software Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Engineer',
  'DevOps Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'AI Researcher',
  
  // Project & Product Management
  'Project Manager',
  'Senior Project Manager',
  'Technical Project Manager',
  'IT Project Manager',
  'Digital Project Manager',
  'Product Manager',
  'Product Owner',
  
  // Marketing & Business
  'Marketing Manager',
  'Digital Marketing Manager',
  'Content Marketing Manager',
  'Product Marketing Manager',
  'Business Analyst',
  'Business Development Manager'
];

export default function JobTitles() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = mockJobTitles.filter(title =>
        title.toLowerCase().startsWith(searchTerm.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const handleSelectTitle = (title: string) => {
    if (selectedTitles.length < 5 && !selectedTitles.includes(title)) {
      setSelectedTitles([...selectedTitles, title]);
      setSearchTerm('');
      setSuggestions([]);
    }
  };

  const handleRemoveTitle = (title: string) => {
    setSelectedTitles(selectedTitles.filter(t => t !== title));
  };

  return (
    <div className="min-h-screen bg-[#fefcf9] p-6 md:p-8 pb-28">
      {/* Main Content */}
      <div className="mx-auto max-w-2xl">
        {/* Headers */}
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-bold text-gray-900">
            What kind of jobs are you looking for?
          </h1>
          <p className="text-lg text-gray-600">
            We recommend up to 5 titles to get a great list of jobs.
          </p>
        </div>

        {/* Job Title Input */}
        <div className="mb-8">
          <label
            htmlFor="job-title"
            className="mb-2 block text-lg font-bold text-gray-900"
          >
            Job title, keyword or category
          </label>
          <div className="relative">
            <input
              type="text"
              id="job-title"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Start typing to see suggestions..."
              autoComplete="off"
              className="w-full rounded-lg border-2 border-gray-200 p-4 text-lg transition-colors focus:border-black focus:outline-none"
              role="combobox"
              aria-expanded={suggestions.length > 0}
              aria-controls="job-suggestions"
              aria-autocomplete="list"
            />
            
            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <ul
                id="job-suggestions"
                role="listbox"
                className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-gray-100 bg-white py-2 shadow-lg"
              >
                {suggestions.map((title, index) => (
                  <li
                    key={title}
                    role="option"
                    aria-selected={selectedTitles.includes(title)}
                    className="block"
                  >
                    <button
                      onClick={() => handleSelectTitle(title)}
                      className="w-full px-4 py-3 text-left text-gray-800 transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none disabled:opacity-50"
                      disabled={selectedTitles.length >= 5}
                    >
                      {title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Selected Titles */}
        {selectedTitles.length > 0 && (
          <div className="mb-12 space-y-2">
            {selectedTitles.map((title) => (
              <div
                key={title}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
              >
                <span className="text-gray-800">{title}</span>
                <button
                  onClick={() => handleRemoveTitle(title)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Sticky Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-3 sm:py-4 max-w-2xl">
           <div className="flex justify-between items-center w-full px-2">
             <button
               onClick={() => router.back()}
               className="flex items-center w-[80px] sm:w-[100px] rounded-lg border-2 border-[#0e3a68] px-4 sm:px-6 py-2 sm:py-2.5 text-[#0e3a68] text-sm sm:text-base transition-colors hover:bg-[#0e3a68]/5"
             >
               <ArrowLeftIcon className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
               Back
             </button>
             <button
               onClick={() => router.push('/onboarding/salary')}
               className="flex items-center w-[80px] sm:w-[100px] rounded-lg border-2 border-[#0e3a68] px-4 sm:px-6 py-2 sm:py-2.5 bg-[#0e3a68] text-white text-sm sm:text-base font-medium transition-colors hover:bg-[#0c3156] disabled:bg-gray-300 disabled:cursor-not-allowed"
               disabled={selectedTitles.length === 0}
             >
               Next
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
