'use client';

import React, { useState } from 'react';
import { ArrowLeftIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SalaryPreference() {
  const router = useRouter();
  const [salary, setSalary] = useState(50); // Starting at $50k

  const formatSalary = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}M annually`;
    }
    return `$${value}k annually`;
  };

  return (
    <div className="min-h-screen bg-[#fefcf9] p-6 md:p-8 pb-28 mt-2">
      {/* Main Content */}
      <div className="mx-auto max-w-2xl">
        {/* Headers */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              How much would you like to earn?
            </h1>
            <button
              className="ml-2 text-gray-400 hover:text-gray-600"
              onClick={() => alert('This helps us find jobs matching your compensation requirements.')}
            >
              <InformationCircleIcon className="h-5 w-5" />
            </button>
          </div>
          <p className="text-base text-gray-600">
            This helps us find jobs matching your compensation requirements.
          </p>
        </div>

        {/* Salary Slider */}
        <div className="mb-16">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label
                htmlFor="salary-range"
                className="block text-lg font-medium text-gray-700"
              >
                Minimum desired compensation
              </label>
              <span className="w-[120px] text-right text-lg font-medium text-gray-900">
                {formatSalary(salary)}
              </span>
            </div>
            <div className="mt-4">
              <input
                type="range"
                id="salary-range"
                min="30"
                max="500"
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value))}
                className="h-1 w-full appearance-none rounded-lg bg-gray-200 accent-[#0e3a68]"
                style={{
                  background: `linear-gradient(to right, #0e3a68 0%, #0e3a68 ${
                    ((salary - 30) / (500 - 30)) * 100
                  }%, #E5E7EB ${((salary - 30) / (500 - 30)) * 100}%, #E5E7EB 100%)`
                }}
              />
            </div>
          </div>
        </div>

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
               onClick={() => router.push('/onboarding/skills')}
               className="flex items-center w-[80px] sm:w-[100px] rounded-lg border-2 border-[#0e3a68] px-4 sm:px-6 py-2 sm:py-2.5 bg-[#0e3a68] text-white text-sm sm:text-base font-medium transition-colors hover:bg-[#0c3156]"
             >
               Next
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}

// Add custom styles for the range input
const styles = `
  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: #0e3a68;
    border-radius: 50%;
    cursor: pointer;
    margin-top: 0px; /* to vertically center the thumb */
  }

  input[type='range']::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #0e3a68;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }

  input[type='range']:focus {
    outline: none;
  }
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
