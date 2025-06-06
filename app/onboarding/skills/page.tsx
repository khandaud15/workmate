'use client';

import React, { useState } from 'react';
import { 
  ArrowLeftIcon, 
  CheckIcon,
  ExclamationCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

const suggestedSkills = [
  'Teamwork and collaboration',
  'Analytical thinking',
  'Remote office availability',
  'PPE compliance',
  'Problem resolution',
  'Communication skills',
  'Project management',
  'Time management',
  'Leadership',
  'Adaptability'
];

export default function SkillsSelection() {
  const router = useRouter();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      const newSelectedSkills = [...selectedSkills, skill];
      setSelectedSkills(newSelectedSkills);
      // Close dropdown when 3 skills are selected
      if (newSelectedSkills.length >= 3) {
        setIsDropdownOpen(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fefcf9] p-6 md:p-8 pb-28">
      {/* Main Content */}
      <div className="mx-auto max-w-2xl">
        {/* Headers */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            What skills would you like to highlight to employers?
          </h1>
          <p className="text-base text-gray-600">
            Select at least 3 skills that best represent your expertise.
          </p>
        </div>

        {/* Skills Selection */}
        <div className="mb-16">
          <label className="mb-2 block text-lg font-bold text-gray-900">
            Enter 3 or more skills or tools
          </label>
          
          {/* Selected Skills Box */}
          <div className="relative mb-2">
            <div className={`min-h-[100px] rounded-lg border-2 ${selectedSkills.length < 3 ? 'border-red-300' : 'border-gray-200'} bg-white p-3`}>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-sm"
                  >
                    <CheckIcon className="mr-1.5 h-4 w-4 text-green-600" />
                    {skill}
                  </span>
                ))}
                <span className="inline-flex items-center py-1.5 text-sm text-gray-400">
                  What else?
                </span>
              </div>
            </div>
            
            {selectedSkills.length < 3 && (
              <div className="absolute right-3 top-3">
                <ExclamationCircleIcon className="h-5 w-5 text-amber-500" />
              </div>
            )}
          </div>

          {/* Suggestions Dropdown */}
          <div className="rounded-lg border border-gray-200 bg-white">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex w-full items-center justify-between p-3 hover:bg-gray-50"
            >
              <span className="font-medium text-gray-700">Suggested skills</span>
              {isDropdownOpen ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            {isDropdownOpen && (
              <div className="max-h-[200px] overflow-y-auto border-t border-gray-100 p-2">
                {suggestedSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className="flex w-full items-center px-2 py-2 hover:bg-gray-50"
                  >
                    <div className={`mr-3 flex h-5 w-5 items-center justify-center rounded border ${selectedSkills.includes(skill) ? 'border-[#0e3a68] bg-[#0e3a68]' : 'border-gray-300'}`}>
                      {selectedSkills.includes(skill) && (
                        <CheckIcon className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm text-gray-700">{skill}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedSkills.length < 3 && (
            <p className="mt-2 text-sm text-amber-600">
              Please select at least {3 - selectedSkills.length} more skill
              {3 - selectedSkills.length !== 1 ? 's' : ''}.
            </p>
          )}
        </div>

      </div>

      {/* Sticky Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-3 sm:py-4 max-w-2xl mt-2">
           <div className="flex justify-between items-center w-full px-2">
             <button
               onClick={() => router.back()}
               className="flex items-center w-[80px] sm:w-[100px] rounded-lg border-2 border-[#0e3a68] px-4 sm:px-6 py-2 sm:py-2.5 text-[#0e3a68] text-sm sm:text-base transition-colors hover:bg-[#0e3a68]/5"
             >
               <ArrowLeftIcon className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
               Back
             </button>
             <button
               onClick={() => router.push('/onboarding/location')}
               disabled={selectedSkills.length < 3}
               className="flex items-center w-[80px] sm:w-[100px] rounded-lg border-2 border-[#0e3a68] px-4 sm:px-6 py-2 sm:py-2.5 bg-[#0e3a68] text-white text-sm sm:text-base font-medium transition-colors hover:bg-[#0c3156] disabled:bg-gray-300 disabled:cursor-not-allowed"
             >
               Next
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
