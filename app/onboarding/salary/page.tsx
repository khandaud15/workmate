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
    <div className="min-h-screen bg-white p-6 md:p-8">
      {/* Main Content */}
      <div className="mx-auto max-w-2xl">
        {/* Headers */}
        <div className="mb-10 text-center">
          <div className="mb-2 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-gray-900">
              How much would you like to earn?
            </h1>
            <button
              className="ml-2 text-gray-400 hover:text-gray-600"
              onClick={() => alert('This helps us find jobs matching your compensation requirements.')}
            >
              <InformationCircleIcon className="h-6 w-6" />
            </button>
          </div>
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
                className="h-1 w-full appearance-none rounded-lg bg-gray-200 accent-black"
                style={{
                  background: `linear-gradient(to right, black 0%, black ${
                    ((salary - 30) / (500 - 30)) * 100
                  }%, #E5E7EB ${((salary - 30) / (500 - 30)) * 100}%, #E5E7EB 100%)`
                }}
              />
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center rounded-lg border-2 border-black px-6 py-2.5 text-black transition-colors hover:bg-gray-50"
          >
            <ArrowLeftIcon className="mr-2 h-5 w-5" />
            Back
          </button>
          <Link
            href="/onboarding/next-step"
            className="text-gray-500 hover:text-gray-700"
          >
            Skip for now
          </Link>
          <button
            onClick={() => router.push('/onboarding/skills')}
            className="rounded-lg bg-black px-8 py-2.5 font-medium text-white transition-colors hover:bg-black/80"
          >
            Next
          </button>
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
    background: #000000;
    border-radius: 50%;
    cursor: pointer;
    margin-top: 0px; /* to vertically center the thumb */
  }

  input[type='range']::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #000000;
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
