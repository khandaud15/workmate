'use client';

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  ArrowLeftIcon,
  InformationCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

type StartOption = 'asap' | 'two_weeks' | 'custom';

const addTwoWeeks = (date: Date) => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + 14);
  return newDate;
};

const today = new Date();
const twoWeeksFromNow = addTwoWeeks(today);

export default function StartDateSelection() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<StartOption | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const options = [
    {
      id: 'asap',
      title: 'As soon as possible',
      description: 'Ready to start immediately'
    },
    {
      id: 'two_weeks',
      title: '2 weeks notice',
      description: 'Standard notice period'
    },
    {
      id: 'custom',
      title: 'Choose a preferred start date',
      description: 'Select a specific date',
      icon: CalendarIcon
    }
  ];

  return (
    <div className="min-h-screen bg-[#fefcf9] p-6 md:p-8 pb-28">
      {/* Main Content */}
      <div className="mx-auto max-w-2xl">
        {/* Headers */}
        <div className="mb-10 text-center">
          <div className="mb-3 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-gray-900">
              When are you looking to start your new job?
            </h1>
            <button
              type="button"
              className="ml-2 text-gray-400 hover:text-gray-600"
              title="Choose when you'd like to start your new position"
            >
              <InformationCircleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="mb-16 space-y-4">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setSelectedOption(option.id as StartOption);
                if (option.id === 'custom') {
                  setShowCalendar(true);
                } else {
                  setShowCalendar(false);
                  setSelectedDate(option.id === 'two_weeks' ? twoWeeksFromNow : today);
                }
              }}
              className={`relative flex w-full items-center justify-between rounded-lg border-2 p-4 text-left transition-all hover:border-[#0e3a68] hover:bg-gray-50 ${
                selectedOption === option.id
                  ? 'border-[#0e3a68] bg-gray-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center">
                {option.icon && (
                  <option.icon className="mr-3 h-5 w-5 text-gray-400" />
                )}
                <div>
                  <h3 className="font-medium text-gray-900">{option.title}</h3>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
              </div>
              {selectedOption === option.id && (
                <CheckCircleIcon className="h-5 w-5 text-[#0e3a68]" />
              )}
            </button>
          ))}
        </div>

        {/* Calendar Popup */}
        {showCalendar && (
          <div className="mb-8 rounded-lg border-2 border-gray-200 bg-white p-4">
            <h4 className="mb-4 font-medium text-gray-900">
              Select your preferred start date
            </h4>
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => date && setSelectedDate(date)}
              minDate={today}
              inline
              calendarClassName="!font-sans"
            />
          </div>
        )}

      </div>

      {/* Sticky Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center rounded-lg border-2 border-[#0e3a68] w-24 px-6 py-2.5 text-[#0e3a68] transition-colors hover:bg-[#0e3a68]/5"
            >
              <ArrowLeftIcon className="mr-2 h-5 w-5" />
              Back
            </button>
            <button
              onClick={() => router.push('/onboarding/pricing')}
              disabled={!selectedOption || (selectedOption === 'custom' && !selectedDate)}
              className="flex items-center rounded-lg border-2 border-[#0e3a68] bg-[#0e3a68] w-24 px-6 py-2.5 font-medium text-white transition-colors hover:bg-[#0c3156] disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
