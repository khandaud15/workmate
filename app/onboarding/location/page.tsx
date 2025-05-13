'use client';

import React, { useState } from 'react';
import { ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// Sample location data - in a real app, this would come from an API
const sampleLocations = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'Phoenix, AZ',
  'Philadelphia, PA',
  'San Antonio, TX',
  'San Diego, CA',
  'Dallas, TX',
  'San Jose, CA',
  'London, UK',
  'Berlin, Germany',
  'Toronto, Canada',
  'Sydney, Australia',
  'Paris, France'
];

export default function LocationSelection() {
  const router = useRouter();
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [includeRemote, setIncludeRemote] = useState(false);

  const filteredLocations = sampleLocations.filter(
    (location) =>
      location.toLowerCase().includes(searchInput.toLowerCase()) &&
      !selectedLocations.includes(location)
  );

  const handleLocationSelect = (location: string) => {
    setSelectedLocations([...selectedLocations, location]);
    setSearchInput('');
    setShowDropdown(false);
  };

  const handleRemoveLocation = (location: string) => {
    setSelectedLocations(selectedLocations.filter((loc) => loc !== location));
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-8 pb-28">
      {/* Main Content */}
      <div className="mx-auto max-w-2xl">
        {/* Headers */}
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-4xl font-bold text-gray-900">
            Where do you want to work?
          </h1>
          <p className="text-lg text-gray-600">
            Add multiple locations to cast a wider net.
          </p>
        </div>

        {/* Location Selection */}
        <div className="mb-8">
          <label
            htmlFor="location-input"
            className="mb-2 block text-lg font-medium text-gray-900"
          >
            City or state
          </label>
          <div className="relative">
            <div className="relative rounded-lg border-2 border-gray-200 bg-white p-3 focus-within:border-black">
              <div className="flex flex-wrap gap-2">
                {selectedLocations.map((location) => (
                  <span
                    key={location}
                    className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm"
                  >
                    {location}
                    <button
                      type="button"
                      onClick={() => handleRemoveLocation(location)}
                      className="ml-1.5 text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  id="location-input"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder={
                    selectedLocations.length === 0
                      ? 'Search for a city or state...'
                      : 'Add another location...'
                  }
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={showDropdown && searchInput.length > 0}
                  aria-controls="location-suggestions"
                  aria-autocomplete="list"
                  className="flex-1 border-none bg-transparent p-1 text-base placeholder-gray-400 focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            {/* Dropdown */}
            {showDropdown && searchInput && (
              <ul
                id="location-suggestions"
                role="listbox"
                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
              >
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((location) => (
                    <li
                      key={location}
                      role="option"
                      aria-selected={selectedLocations.includes(location)}
                      className="block"
                    >
                      <button
                        onClick={() => handleLocationSelect(location)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                      >
                        {location}
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="block" role="option" aria-selected="false">
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No matching locations found
                    </div>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        {/* Remote Toggle */}
        <div className="mb-8">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={includeRemote}
              onChange={(e) => setIncludeRemote(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-black peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-gray-100"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              Include Remote Jobs
            </span>
          </label>
        </div>

        {/* Success Message */}
        {selectedLocations.length > 0 && (
          <div className="mb-8 rounded-lg bg-purple-50 p-4 text-center text-sm text-purple-700">
            Great! We&apos;ve found jobs available near you.
          </div>
        )}

      </div>

      {/* Sticky Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center rounded-lg border-2 border-black px-6 py-2.5 text-black transition-colors hover:bg-gray-50"
            >
              <ArrowLeftIcon className="mr-2 h-5 w-5" />
              Back
            </button>
            <button
              onClick={() => router.push('/onboarding/start-date')}
              disabled={selectedLocations.length === 0}
              className="rounded-lg bg-black px-8 py-2.5 font-medium text-white transition-colors hover:bg-black/80 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
