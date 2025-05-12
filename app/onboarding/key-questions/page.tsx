'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

type Question = {
  id: string;
  text: string;
  options: string[];
  required?: boolean;
};

const questions: Question[] = [
  {
    id: 'workAuth',
    text: 'Are you authorized to work in the United States?',
    options: ['Yes', 'No'],
    required: true,
  },
  {
    id: 'sponsorship',
    text: 'Will you now or in the future require sponsorship to work in the United States?',
    options: ['Yes', 'No'],
    required: true,
  },
  {
    id: 'felony',
    text: 'Have you ever been convicted of a felony?',
    options: ['Yes', 'No'],
    required: true,
  },
  {
    id: 'startDate',
    text: 'When can you start a new job?',
    options: ['Immediately', '2 weeks', '1 month', 'More than 1 month'],
    required: true,
  },
  {
    id: 'screening',
    text: 'Are you willing to conduct any sort of pre-employment screening that is required?',
    options: ['Yes', 'No', 'Prefer not to say'],
  },
  {
    id: 'relocation',
    text: 'Are you willing to relocate for a job?',
    options: ['Yes', 'No', 'Maybe'],
  },
  {
    id: 'travel',
    text: 'Are you willing to travel for work?',
    options: ['Yes', 'No', 'Maybe'],
  },
  {
    id: 'workType',
    text: 'What type of work are you looking for?',
    options: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    required: true,
  },
  {
    id: 'workLocation',
    text: 'What is your preferred work location?',
    options: ['On-site', 'Hybrid', 'Remote'],
    required: true,
  },
  {
    id: 'salary',
    text: 'What is your expected salary range?',
    options: ['$0-50k', '$50-75k', '$75-100k', '$100k+'],
    required: true,
  },
  {
    id: 'experience',
    text: 'How many years of relevant experience do you have?',
    options: ['0-1 years', '1-3 years', '3-5 years', '5+ years'],
    required: true,
  },
  {
    id: 'gender',
    text: 'What gender do you identify as?',
    options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
  },
  {
    id: 'pronouns',
    text: 'What are your desired pronouns?',
    options: ['He/Him', 'She/Her', 'They/Them', 'Prefer not to say'],
  },
  {
    id: 'ethnicity',
    text: 'Which race or ethnicity best describes you?',
    options: [
      'Asian',
      'Black or African American',
      'Hispanic or Latino',
      'Native American',
      'Pacific Islander',
      'White',
      'Two or more races',
      'Prefer not to say',
    ],
  },
  {
    id: 'disability',
    text: 'Do you have a disability?',
    options: ['Yes', 'No', 'Prefer not to say'],
  },
  {
    id: 'veteran',
    text: 'Are you a veteran?',
    options: ['Yes', 'No', 'Prefer not to say'],
  },
];

export default function KeyQuestionsPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load saved answers from localStorage on component mount
    const savedAnswers = localStorage.getItem('onboardingAnswers');
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, []);

  const isRequiredQuestionsAnswered = () => {
    return questions
      .filter((q) => q.required)
      .every((q) => answers[q.id] && answers[q.id].length > 0);
  };

  const handleSubmit = () => {
    const newErrors: Record<string, boolean> = {};
    questions.forEach((question) => {
      if (question.required && !answers[question.id]) {
        newErrors[question.id] = true;
      }
    });
    setErrors(newErrors);
    if (isRequiredQuestionsAnswered()) {
      // Save answers and move to next step
      localStorage.setItem('keyQuestions', JSON.stringify(answers));
      router.push('/onboarding/resume');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar */}
      <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Progress Lines */}
          <div className="absolute left-0 right-0 top-4">
            {/* Line between Step 1 and 2 */}
            <div className="absolute left-[calc(16.666%+16px)] right-[calc(50%-16px)] h-1 rounded-full bg-gray-200">
              <div className="h-full w-full rounded-full bg-[#3BA17C]"></div>
            </div>
            {/* Line between Step 2 and 3 */}
            <div className="absolute left-[calc(50%+16px)] right-[calc(16.666%-16px)] h-1 rounded-full bg-gray-200"></div>
          </div>

          {/* Steps */}
          <div className="relative flex justify-between px-4">
            {/* Step 1: Key Questions */}
            <div className="flex flex-col items-center">
              <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#3BA17C] bg-white">
                <span className="text-base font-bold text-black">1</span>
              </div>
              <div className="mt-3 flex flex-col items-center">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">STEP 1</span>
                <span className="mt-1 text-sm font-bold text-black">Key questions</span>
              </div>
            </div>
            
            {/* Step 2: Resume Review */}
            <div className="flex flex-col items-center">
              <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                <span className="text-base font-medium text-gray-500">2</span>
              </div>
              <div className="mt-3 flex flex-col items-center">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">STEP 2</span>
                <span className="mt-1 text-sm font-medium text-gray-500">Resume review</span>
              </div>
            </div>
            
            {/* Step 3: Finalize */}
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

      {/* Main Content */}
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-3 text-3xl font-bold text-[#1a2b4b]">Key questions</h1>
        <p className="mb-2 text-[#1a2b4b]">
          These are the questions that will help us best auto-fill your applications.
        </p>
        <p className="mb-8 text-sm italic text-red-500">
          * marks required fields.
        </p>

        <form className="space-y-5 mx-auto">
          {questions.map((question) => (
            <div key={question.id}>
              <label
                htmlFor={question.id}
                className="block text-sm font-medium text-[#1a2b4b]"
              >
                {question.text}
                {question.required && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </label>
              <div className="relative">
                <select
                  id={question.id}
                  value={answers[question.id] || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const newAnswers = {
                      ...answers,
                      [question.id]: value,
                    };
                    setAnswers(newAnswers);
                    localStorage.setItem('onboardingAnswers', JSON.stringify(newAnswers));
                    if (errors[question.id]) {
                      setErrors((prev) => ({
                        ...prev,
                        [question.id]: false,
                      }));
                    }
                  }}
                  className={`mt-1 block w-full rounded-lg border ${
                    errors[question.id] ? 'border-red-500' : 'border-gray-600'
                  } bg-white pl-3 pr-8 py-2.5 text-[#1a2b4b] shadow-sm transition-colors hover:border-gray-800 focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm appearance-none`}
                >
                  <option value="">Select</option>
                  {question.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDownIcon className="h-4 w-4 text-[#A0A4AE]" />
                </div>
              </div>
              {errors[question.id] && (
                <p className="mt-1 text-sm text-red-500">
                  This field is required
                </p>
              )}
            </div>
          ))}
        </form>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            className="inline-flex items-center rounded-lg bg-black px-6 py-3 text-base font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Next
            <ChevronRightIcon className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
