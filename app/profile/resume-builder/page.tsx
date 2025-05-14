"use client";

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaCheck, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaMapMarkerAlt, 
  FaChevronLeft, 
  FaChevronRight,
  FaExclamationTriangle
} from 'react-icons/fa';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// TypeScript interface for Work Experience
interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate?: string;
  location?: string;
  responsibilities: string[];
  isExpanded?: boolean;
  isEditing?: boolean;
}

export default function ResumeBuilderPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(2); // Set to Resume Review step
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([
    {
      id: '1',
      jobTitle: 'Senior Software Engineer',
      company: 'Tech Innovations Inc.',
      startDate: 'Jan 2020',
      endDate: 'Present',
      location: 'San Francisco, CA',
      responsibilities: [
        'Led development of scalable web applications',
        'Implemented microservices architecture',
        'Mentored junior developers and conducted code reviews'
      ]
    }
  ]);

  // Progress Indicator Component
  const ProgressIndicator = () => (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6 lg:px-8">
      <div className="relative">
        {/* Progress Lines */}
        <div className="absolute left-0 right-0 top-4">
          {/* Line between Step 1 and 2 */}
          <div className="absolute left-[calc(16.666%+16px)] right-[calc(50%-16px)] h-1 rounded-full bg-gray-200">
            <div className="h-full w-full rounded-full bg-[#0e3a68]"></div>
          </div>
          {/* Line between Step 2 and 3 */}
          <div className="absolute left-[calc(50%+16px)] right-[calc(16.666%-16px)] h-1 rounded-full bg-gray-200"></div>
        </div>

        {/* Step Circles and Labels */}
        <div className="relative flex justify-between px-4">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0e3a68] bg-white">
              <span className="text-base font-bold text-[#0e3a68]">1</span>
            </div>
            <div className="mt-3 flex flex-col items-center">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">STEP 1</span>
              <span className="mt-1 text-sm font-bold text-black">Key questions</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
              <span className="text-base font-medium text-gray-500">2</span>
            </div>
            <div className="mt-3 flex flex-col items-center">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">STEP 2</span>
              <span className="mt-1 text-sm font-medium text-gray-500">Resume review</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
              <span className="text-base font-medium text-gray-500">3</span>
            </div>
            <div className="mt-3 flex flex-col items-center">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500">STEP 3</span>
              <span className="mt-1 text-sm font-medium text-gray-500">Finalize</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Work Experience Card Component
  const WorkExperienceCard = ({ experience, index }: { experience: WorkExperience, index: number }) => {
    const toggleExpand = () => {
      setWorkExperience(prev => 
        prev.map((exp, idx) => 
          idx === index ? { ...exp, isExpanded: !exp.isExpanded } : exp
        )
      );
    };

    const handleEdit = () => {
      setWorkExperience(prev => 
        prev.map((exp, idx) => 
          idx === index ? { ...exp, isEditing: true } : exp
        )
      );
    };

    const handleDelete = () => {
      setWorkExperience(prev => prev.filter((_, idx) => idx !== index));
    };

    // If editing, show edit form
    if (experience.isEditing) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" 
              defaultValue={experience.jobTitle}
              placeholder="Job Title"
              className="border rounded p-2"
            />
            <input 
              type="text" 
              defaultValue={experience.company}
              placeholder="Company"
              className="border rounded p-2"
            />
            <input 
              type="text" 
              defaultValue={experience.location}
              placeholder="Location"
              className="border rounded p-2"
            />
            <div className="flex space-x-2">
              <input 
                type="text" 
                defaultValue={experience.startDate}
                placeholder="Start Date"
                className="border rounded p-2 flex-1"
              />
              <input 
                type="text" 
                defaultValue={experience.endDate}
                placeholder="End Date"
                className="border rounded p-2 flex-1"
              />
            </div>
          </div>
          <textarea 
            defaultValue={experience.responsibilities.join('\n')}
            placeholder="Enter responsibilities, one per line"
            className="w-full border rounded p-2 mt-4 h-24"
          />
          <div className="flex justify-end space-x-2 mt-4">
            <button 
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
              onClick={() => setWorkExperience(prev => 
                prev.map((exp, idx) => 
                  idx === index ? { ...exp, isEditing: false } : exp
                )
              )}
            >
              Cancel
            </button>
            <button 
              className="flex items-center justify-center w-full rounded-lg border-2 border-[#0e3a68] px-6 py-2.5 bg-[#0e3a68] text-white font-medium transition-colors hover:bg-[#0c3156]"
            >
              Save
            </button>
          </div>
        </div>
      );
    }

    // Normal view
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-4 relative">
        {/* Edit and Delete Icons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button 
            onClick={handleEdit}
            className="text-blue-500 hover:text-blue-600"
            aria-label="Edit Experience"
          >
            <FaEdit />
          </button>
          <button 
            onClick={handleDelete}
            className="text-red-500 hover:text-red-600"
            aria-label="Delete Experience"
          >
            <FaTrash />
          </button>
        </div>

        {/* Job Details */}
        <h3 className="text-xl font-bold text-gray-800">{experience.jobTitle}</h3>
        <div className="flex justify-between items-center mb-2">
          <p className="text-gray-600">{experience.company}</p>
          <p className="text-sm text-gray-500">
            {experience.startDate} - {experience.endDate || 'Present'}
          </p>
        </div>

        {/* Location */}
        {experience.location ? (
          <div className="flex items-center text-gray-500 text-sm mb-3">
            <FaMapMarkerAlt className="mr-2" />
            {experience.location}
          </div>
        ) : (
          <div className="flex items-center text-yellow-600 text-sm mb-3">
            <FaExclamationTriangle className="mr-2" />
            Location not specified
          </div>
        )}

        {/* Responsibilities */}
        <ul className={`list-disc list-inside text-gray-700 ${experience.isExpanded ? '' : 'line-clamp-3'}`}>
          {experience.responsibilities.map((resp, respIndex) => (
            <li key={respIndex} className="mb-1">{resp}</li>
          ))}
        </ul>

        {/* Expand/Collapse Button */}
        {experience.responsibilities.length > 3 && (
          <button 
            onClick={toggleExpand}
            className="text-blue-500 hover:text-blue-600 text-sm mt-2"
          >
            {experience.isExpanded ? 'Collapse' : 'Expand'}
          </button>
        )}
      </div>
    );
  };

  // Add Experience Button
  const AddExperienceButton = () => {
    return (
      <button 
        onClick={() => {
          const newExperience: WorkExperience = {
            id: `temp-${Date.now()}`,
            jobTitle: '',
            company: '',
            startDate: '',
            endDate: '',
            location: '',
            responsibilities: [],
            isEditing: true
          };
          setWorkExperience(prev => [...prev, newExperience]);
        }}
        className="flex items-center justify-center w-full rounded-lg border-2 border-[#0e3a68] px-6 py-2.5 bg-[#0e3a68] text-white font-medium transition-colors hover:bg-[#0c3156]"
      >
        <FaPlus className="mr-2" /> Add Work Experience
      </button>
    );
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      router.push('/profile/resume-builder/finalize');
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      router.push('/profile');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl font-sans">
      <ProgressIndicator />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Work Experience</h2>
        
        {workExperience.map((experience, index) => (
          <WorkExperienceCard 
            key={experience.id} 
            experience={experience} 
            index={index} 
          />
        ))}
        
        <AddExperienceButton />
      </div>

      {/* Sticky Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <div className="flex justify-between items-center w-full">
            <button
              onClick={() => router.back()}
              className="flex items-center w-[100px] rounded-lg border-2 border-[#0e3a68] px-6 py-2.5 text-[#0e3a68] transition-colors hover:bg-[#0e3a68]/5"
            >
              <ArrowLeftIcon className="mr-2 h-5 w-5" />
              Back
            </button>
            <button
              onClick={handleNextStep}
              className="flex items-center w-[100px] rounded-lg border-2 border-[#0e3a68] px-6 py-2.5 bg-[#0e3a68] text-white font-medium transition-colors hover:bg-[#0c3156]"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
