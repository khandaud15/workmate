'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, ExternalLink, Bookmark, Clock } from 'lucide-react';

interface Job {
  job_id: string;
  job_title: string;
  company: string;
  location: string;
  description: string;
  salary_text?: string;
  posted_text?: string;
  job_url: string;
  created_at: string;
}

interface SearchStatus {
  running: boolean;
  progress: number;
  message: string;
  total_jobs: number;
  search_query: string;
  location: string;
}

export default function JobSearchInterface() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobSuggestions, setJobSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [autoFillSuggestion, setAutoFillSuggestion] = useState('');
  const [searchStatus, setSearchStatus] = useState<SearchStatus | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL JOBS');

  // Common job titles for autocomplete (like LinkedIn/Indeed)
  const commonJobTitles = [
    'bioinformatics scientist',
    'staff bioinformatics scientist', 
    'bioinformatics scientist ii',
    'senior bioinformatics scientist',
    'senior staff bioinformatics scientist',
    'senior bioinformatics scientist:',
    'senior/lead bioinformatics scientist',
    'sr bioinformatics scientist - computational biology (protein design)',
    'sr. bioinformatics scientist - novel cell free dna applications',
    'sr. bioinformatics scientist - cell free dna technology development',
    'software engineer',
    'senior software engineer',
    'staff software engineer',
    'principal software engineer',
    'software engineer ii',
    'software engineer iii',
    'data scientist',
    'senior data scientist',
    'staff data scientist',
    'principal data scientist',
    'data scientist ii',
    'machine learning engineer',
    'senior machine learning engineer',
    'staff machine learning engineer',
    'product manager',
    'senior product manager',
    'staff product manager',
    'principal product manager',
    'marketing manager',
    'senior marketing manager',
    'digital marketing specialist',
    'content marketing manager',
    'business analyst',
    'senior business analyst',
    'data analyst',
    'senior data analyst',
    'research scientist',
    'senior research scientist',
    'staff research scientist',
    'clinical research coordinator',
    'senior clinical research coordinator'
  ];

  const handleJobTitleChange = (value: string) => {
    setSearchQuery(value);
    
    if (value.length > 1) {
      // Filter jobs that contain the search term (like LinkedIn/Indeed)
      const filtered = commonJobTitles.filter(job => 
        job.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10); // Show more suggestions like other platforms
      
      setJobSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setAutoFillSuggestion(''); // Remove inline autofill, use dropdown only
    } else {
      setShowSuggestions(false);
      setAutoFillSuggestion('');
    }
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' || e.key === 'ArrowRight') {
      if (autoFillSuggestion && searchQuery.length > 0) {
        e.preventDefault();
        setSearchQuery(autoFillSuggestion);
        setAutoFillSuggestion('');
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setAutoFillSuggestion('');
      setShowSuggestions(false);
    } else if (e.key === 'Enter') {
      // Trigger search when Enter is pressed
      if (searchQuery.trim() && location.trim() && !isSearching) {
        setShowSuggestions(false);
        startJobSearch();
      }
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  const startJobSearch = async () => {
    console.log('🔍 startJobSearch called!');
    console.log('searchQuery:', searchQuery);
    console.log('location:', location);
    
    if (!searchQuery.trim() || !location.trim()) {
      console.log('❌ Missing required fields');
      alert('Please enter both job title and location');
      return;
    }

    console.log('✅ Starting job search...');
    setIsSearching(true);
    setJobs([]);

    try {
      const response = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle: searchQuery,
          location: location,
          maxJobs: 100,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start job search');
      }

      // Start polling for status
      pollSearchStatus();
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to start job search');
      setIsSearching(false);
    }
  };

  const pollSearchStatus = async () => {
    const interval = setInterval(async () => {
      try {
        const statusResponse = await fetch('/api/jobs/status');
        const status = await statusResponse.json();
        setSearchStatus(status);

        if (!status.running) {
          clearInterval(interval);
          setIsSearching(false);
          
          if (status.total_jobs > 0) {
            loadJobResults();
          }
        }
      } catch (error) {
        console.error('Status polling error:', error);
        clearInterval(interval);
        setIsSearching(false);
      }
    }, 1000);
  };

  const loadJobResults = async () => {
    try {
      const response = await fetch('/api/jobs/results?per_page=50');
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Failed to load job results:', error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getJobCount = (tab: string) => {
    switch (tab) {
      case 'ALL JOBS':
        return jobs.length;
      case 'SAVED':
        return 0;
      case 'APPLIED':
        return 0;
      case 'INTERVIEWING':
        return 0;
      case 'REJECTED':
        return 0;
      default:
        return 0;
    }
  };

  return (
    <div className="w-full space-y-4 px-0.5 sm:px-0 mt-16 sm:mt-6 min-h-screen">
      {/* Tabs - Responsive Design */}
      <div className="bg-[#1e2d3d] rounded-lg border border-[#2a3441] p-3">
        <div className="flex sm:flex-wrap gap-2 overflow-x-auto scrollbar-hide">
          {['ALL JOBS', 'SAVED', 'APPLIED', 'INTERVIEWING', 'REJECTED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-2 rounded text-xs font-semibold uppercase tracking-wide transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#2a3441] text-gray-300 hover:text-white hover:bg-[#3a4651]'
              }`}
            >
              {tab} {getJobCount(tab)}
            </button>
          ))}
        </div>
      </div>

      {/* Search Form - Reference Style */}
      <div className="bg-[#1a2332] rounded-lg border border-[#2a3441] p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
          {/* Job Title Input */}
          <div className="w-full sm:flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase className="h-4 w-4 text-gray-400" />
            </div>
            
            <input
              type="text"
              placeholder="Bioinformatics scientist"
              value={searchQuery}
              onChange={(e) => handleJobTitleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => searchQuery.length > 0 && setShowSuggestions(jobSuggestions.length > 0)}
              onBlur={() => setTimeout(() => { setShowSuggestions(false); setAutoFillSuggestion(''); }, 200)}
              className="w-full pl-10 pr-4 py-2.5 h-10 bg-[#2a3441] text-white text-sm placeholder-gray-400 border border-[#3a4651] rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && jobSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#2a3441] border border-[#3a4651] rounded shadow-xl z-50 max-h-64 overflow-y-auto">
                {jobSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-3 text-white hover:bg-[#3a4651] transition-colors flex items-center gap-3 text-sm"
                  >
                    <Briefcase className="h-3 w-3 text-gray-400" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Location Input */}
          <div className="w-full sm:w-64 sm:flex-none relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="United States"
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-2.5 h-10 bg-[#2a3441] text-white text-sm placeholder-gray-400 border border-[#3a4651] rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
            />
          </div>
          
          {/* Search Button */}
          <button 
            onClick={startJobSearch}
            disabled={isSearching || !searchQuery.trim() || !location.trim()}
            className={`w-full sm:w-auto px-4 py-2.5 h-10 rounded transition-colors flex items-center justify-center gap-2 text-sm font-medium ${
              isSearching || !searchQuery.trim() || !location.trim()
                ? 'bg-[#2a3441] text-gray-400 cursor-not-allowed border border-[#3a4651]'
                : 'bg-[#2a3441] hover:bg-[#3a4651] text-gray-300 hover:text-white border border-[#3a4651]'
            }`}
          >
            {isSearching ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span className="hidden sm:inline">SEARCHING...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">SEARCH</span>
              </>
            )}
          </button>
          
          {/* Filter Button */}
          <button className="px-4 py-2.5 h-10 bg-[#2a3441] hover:bg-[#3a4651] text-gray-300 hover:text-white border border-[#3a4651] rounded transition-colors flex items-center gap-2 text-sm font-medium">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            <span className="hidden sm:inline">FILTER</span>
          </button>
        </div>
      </div>

      {/* Search Progress */}
      {searchStatus && searchStatus.running && (
        <div className="bg-[#1a2332] rounded-lg p-4 border border-[#2a3441]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">
              Searching for "{searchStatus.search_query}" in {searchStatus.location}
            </span>
            <span className="text-blue-400 text-sm">
              {searchStatus.progress}%
            </span>
          </div>
          <div className="w-full bg-[#2a3441] rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${searchStatus.progress}%` }}
            />
          </div>
          <p className="text-gray-400 text-sm mt-2">{searchStatus.message}</p>
        </div>
      )}

      {/* Job Results */}
      {jobs.length > 0 && (
        <div className="space-y-3">
          {jobs.map((job) => (
            <a 
              key={job.job_id} 
              href={job.job_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block bg-[#1e2d3d] rounded-xl border border-[#2a3441] p-5 hover:bg-[#243142] transition-all duration-200 shadow-sm cursor-pointer"
            >
              {/* Beautiful Layout - Matching Reference */}
              <div className="flex flex-col space-y-3">
                {/* Job Title - Blue and Prominent */}
                <h3 className="text-blue-400 font-semibold text-xl leading-snug">
                  {job.job_title || 'N/A'}
                </h3>
                
                {/* Company and Location - Clean Gray */}
                <div className="flex items-center text-gray-300 text-base">
                  <span className="flex items-center">
                    <Briefcase className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="font-medium">{job.company || 'N/A'}</span>
                  </span>
                  <span className="mx-3 text-gray-500">•</span>
                  <span className="font-medium">{job.location || 'N/A'}</span>
                </div>
                
                {/* Description - Clean and Readable */}
                <div className="py-1">
                  <p className="text-gray-200 text-base leading-relaxed line-clamp-2 sm:line-clamp-none">
                    <span className="text-blue-400 mr-2 text-lg">✨</span>{job.description ? job.description.substring(0, 180) + '...' : 'Seeking a highly motivated professional to lead and support projects involving data analysis and research.'}
                  </p>
                </div>
                
                {/* Bottom Section - Professional Layout */}
                <div className="flex items-center justify-between pt-3 border-t border-[#3a4651]">
                  {/* Date - Subtle Gray */}
                  <div className="text-gray-400 text-sm">
                    {job.posted_text || formatDate(job.created_at)}
                  </div>
                  
                  {/* Action Buttons - Professional Style */}
                  <div className="flex items-center gap-2">
                    <button className="text-sm font-medium text-white bg-[#475569] hover:bg-[#64748b] px-4 py-2 rounded-lg transition-colors">
                      ACCESS RESUME
                    </button>
                    <button 
                      className="p-2 text-gray-400 hover:text-white hover:bg-[#475569] rounded-lg transition-colors"
                      title="Save Job"
                    >
                      <Bookmark className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-2 text-gray-400 hover:text-white hover:bg-[#475569] rounded-lg transition-colors"
                      title="More Options"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isSearching && jobs.length === 0 && !searchStatus?.running && (
        <div className="bg-[#1a2332] rounded-lg p-12 text-center border border-[#2a3441]">
          <Briefcase className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Ready to find your dream job?
          </h3>
          <p className="text-gray-400">
            Enter a job title and location to get started with AI-powered job searching.
          </p>
        </div>
      )}
    </div>
  );
}
