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
  posted_date?: string;
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);
  const [hasMoreJobs, setHasMoreJobs] = useState(false);
  const [allJobs, setAllJobs] = useState<Job[]>([]); // Store all jobs
  const [savedJobs, setSavedJobs] = useState<Job[]>([]); // Store saved jobs
  const JOBS_PER_PAGE = 20;

  // Helper function to capitalize first letter of each sentence
  const capitalizeJobTitle = (title: string): string => {
    return title.split('. ').map(sentence => 
      sentence.charAt(0).toUpperCase() + sentence.slice(1)
    ).join('. ');
  };

  // Firebase helper functions for saved jobs
  const saveSavedJobsToFirebase = async (jobs: Job[]) => {
    try {
      const response = await fetch('/api/saved-jobs/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobs: jobs
        })
      });
      
      if (response.ok) {
        console.log('💾 Saved jobs synced to Firestore:', jobs.length);
        return true;
      } else {
        console.error('❌ Failed to save jobs to Firestore:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Error saving jobs to Firestore:', error);
      return false;
    }
  };

  const loadSavedJobsFromFirebase = async (): Promise<Job[]> => {
    try {
      const response = await fetch('/api/saved-jobs/load');
      
      if (response.ok) {
        const data = await response.json();
        console.log('💾 Loaded saved jobs from Firestore:', data.jobs?.length || 0);
        return data.jobs || [];
      } else {
        console.log('💾 No saved jobs found in Firestore');
        return [];
      }
    } catch (error) {
      console.error('❌ Error loading saved jobs from Firestore:', error);
      return [];
    }
  };

  // Save/unsave job functionality with Firebase sync
  const toggleSaveJob = async (job: Job) => {
    const isAlreadySaved = savedJobs.some(savedJob => savedJob.job_id === job.job_id);
    
    let updatedSavedJobs: Job[];
    
    if (isAlreadySaved) {
      // Remove from saved jobs
      updatedSavedJobs = savedJobs.filter(savedJob => savedJob.job_id !== job.job_id);
      console.log('🗑️ Job removed from saved:', job.job_title);
    } else {
      // Add to saved jobs
      updatedSavedJobs = [...savedJobs, job];
      console.log('💾 Job saved:', job.job_title);
    }
    
    // Update local state immediately for responsive UI
    setSavedJobs(updatedSavedJobs);
    
    // Sync to Firebase in background
    await saveSavedJobsToFirebase(updatedSavedJobs);
  };

  // Check if job is saved
  const isJobSaved = (jobId: string): boolean => {
    return savedJobs.some(savedJob => savedJob.job_id === jobId);
  };

  // Load saved jobs from Firebase on component mount
  useEffect(() => {
    const loadSavedJobs = async () => {
      console.log('🔄 Loading saved jobs from Firebase on component mount...');
      const savedJobsFromFirebase = await loadSavedJobsFromFirebase();
      if (savedJobsFromFirebase.length > 0) {
        setSavedJobs(savedJobsFromFirebase);
        console.log(`✅ Loaded ${savedJobsFromFirebase.length} saved jobs from Firebase`);
      }
    };
    
    loadSavedJobs();
  }, []); // Run only once on mount

  // Update displayed jobs when page changes or active tab changes
  useEffect(() => {
    const filteredJobs = getFilteredJobs();
    const pageJobs = getCurrentPageJobs(filteredJobs);
    setJobs(pageJobs);
    
    // Reset to page 1 when switching tabs
    if (currentPage > 1 && filteredJobs.length <= JOBS_PER_PAGE) {
      setCurrentPage(1);
    }
    
    console.log(`📄 Tab: ${activeTab}, Page ${currentPage}: Showing ${pageJobs.length} jobs from ${filteredJobs.length} total`);
  }, [currentPage, allJobs, activeTab, savedJobs]);

  // Get filtered jobs based on active tab
  const getFilteredJobs = (): Job[] => {
    switch (activeTab) {
      case 'ALL JOBS':
        return allJobs;
      case 'SAVED':
        return savedJobs;
      case 'APPLIED':
        return []; // TODO: Implement applied jobs
      case 'INTERVIEWING':
        return []; // TODO: Implement interviewing jobs
      case 'REJECTED':
        return []; // TODO: Implement rejected jobs
      default:
        return allJobs;
    }
  };

  // Get jobs for current page from filtered jobs
  const getCurrentPageJobs = (filteredJobs: Job[]): Job[] => {
    const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
    const endIndex = startIndex + JOBS_PER_PAGE;
    return filteredJobs.slice(startIndex, endIndex);
  };

  // Navigate to specific page
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      console.log(`📄 Navigated to page ${page}`);
      // Scroll to top for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
    console.log('📝 Job title changed:', value);
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
    
    // Mobile debugging
    console.log('📱 Form state after job title change:', {
      searchQuery: value,
      location: location,
      canSearch: !!(value.trim() && location.trim())
    });
  };

  const handleLocationChange = (value: string) => {
    console.log('📍 Location changed:', value);
    setLocation(value);
    
    // Mobile debugging
    console.log('📱 Form state after location change:', {
      searchQuery: searchQuery,
      location: value,
      canSearch: !!(searchQuery.trim() && value.trim())
    });
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
    console.log('🌐 Current URL:', window.location.href);
    
    if (!searchQuery.trim() || !location.trim()) {
      console.log('❌ Missing required fields');
      alert('Please enter both job title and location');
      return;
    }

    console.log('✅ Starting job search...');
    setIsSearching(true);
    setJobs([]);
    setAllJobs([]); // Clear all jobs
    
    // Reset pagination for new search
    setCurrentPage(1);
    setTotalPages(1);
    setCurrentSearchId(null);
    setHasMoreJobs(false);

    try {
      // Test API connectivity first
      console.log('🧪 Testing API connectivity...');
      const testResponse = await fetch('/api/jobs/test', {
        method: 'GET'
      });
      console.log('🧪 Test API response status:', testResponse.status);
      
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('🧪 Test API data:', testData);
      } else {
        console.error('🧪 Test API failed:', testResponse.status, testResponse.statusText);
      }

      // Proceed with actual search
      console.log('📡 Calling search API...');
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

      console.log('📡 Search API response status:', response.status);
      console.log('📡 Search API response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('📡 Search API error response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('📡 Search API response data:', responseData);
      
      // Store search ID for pagination
      if (responseData.searchId) {
        setCurrentSearchId(responseData.searchId);
        console.log('🔍 Stored search ID for pagination:', responseData.searchId);
      }

      // If jobs were found, try loading them immediately
      if (responseData.jobCount && responseData.jobCount > 0) {
        console.log('🚀 Jobs found! Attempting immediate load...');
        
        // Calculate pagination info
        const estimatedPages = Math.ceil(responseData.jobCount / JOBS_PER_PAGE);
        setTotalPages(estimatedPages);
        setHasMoreJobs(false); // Will be set after loading initial jobs
        
        console.log('📊 Pagination setup:', {
          totalJobs: responseData.jobCount,
          estimatedPages,
          jobsPerPage: JOBS_PER_PAGE
        });
        
        // Try loading jobs immediately since search completed successfully
        setTimeout(() => {
          console.log('⚡ Immediate job load attempt...');
          loadJobResults();
        }, 1000);
      }

      // Start polling for status as backup
      console.log('🚀 Initiating status polling...');
      pollSearchStatus();
      
      // Also add a fallback check after 5 seconds
      setTimeout(() => {
        console.log('⏰ Fallback: Checking if jobs are ready...');
        loadJobResults();
      }, 5000);
    } catch (error) {
      console.error('❌ Search error:', error);
      alert(`Failed to start job search: ${error instanceof Error ? error.message : String(error)}`);
      setIsSearching(false);
    }
  };

  const pollSearchStatus = async () => {
    console.log('🔄 Starting status polling...');
    const interval = setInterval(async () => {
      try {
        console.log('📊 Polling status...');
        const statusResponse = await fetch('/api/jobs/status');
        console.log('📊 Status response status:', statusResponse.status);
        
        const status = await statusResponse.json();
        console.log('📊 Status data:', status);
        setSearchStatus(status);

        if (!status.running) {
          console.log('✅ Search completed! Jobs found:', status.total_jobs);
          clearInterval(interval);
          setIsSearching(false);
          
          if (status.total_jobs > 0) {
            console.log('📥 Loading job results...');
            loadJobResults();
          } else {
            console.log('❌ No jobs found in status');
          }
        } else {
          console.log('⏳ Search still running...', status.message);
        }
      } catch (error) {
        console.error('❌ Status polling error:', error);
        clearInterval(interval);
        setIsSearching(false);
      }
    }, 1000);
  };

  // Function to deduplicate jobs based on unique identifiers
  const deduplicateJobs = (existingJobs: Job[], newJobs: Job[]): Job[] => {
    const existingIds = new Set(existingJobs.map(job => 
      `${job.job_title}-${job.company}-${job.location}`.toLowerCase().replace(/\s+/g, '')
    ));
    
    const uniqueNewJobs = newJobs.filter(job => {
      const jobId = `${job.job_title}-${job.company}-${job.location}`.toLowerCase().replace(/\s+/g, '');
      return !existingIds.has(jobId);
    });
    
    console.log(`🔄 Deduplication: ${newJobs.length} new jobs, ${uniqueNewJobs.length} unique jobs after filtering`);
    return uniqueNewJobs;
  };
  
  // Function to load more jobs - simplified approach
  const loadMoreJobs = async () => {
    if (isLoadingMore) {
      console.log('❌ Already loading more jobs');
      return;
    }
    
    if (!searchQuery.trim() || !location.trim()) {
      console.log('❌ Cannot load more jobs: missing search query or location');
      return;
    }
    
    setIsLoadingMore(true);
    console.log('🔍 Loading more jobs...');
    
    try {
      // Trigger a fresh search for more jobs
      const response = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle: searchQuery,
          location: location,
          maxJobs: 100, // Request more jobs
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load more jobs: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('🔍 Load more search response:', responseData);
      
      // Wait for search to complete then load results
      setTimeout(async () => {
        try {
          const resultsResponse = await fetch('/api/jobs/results?per_page=100');
          if (!resultsResponse.ok) {
            throw new Error('Failed to fetch more results');
          }
          
          const resultsData = await resultsResponse.json();
          console.log('🔍 More jobs results:', resultsData);
          
          if (resultsData.jobs && resultsData.jobs.length > 0) {
            // Deduplicate and append new jobs to existing ones
            const uniqueNewJobs = deduplicateJobs(allJobs, resultsData.jobs);
            
            if (uniqueNewJobs.length > 0) {
              const updatedAllJobs = [...allJobs, ...uniqueNewJobs];
              setAllJobs(updatedAllJobs);
              
              // Update pagination
              const newTotalPages = Math.ceil(updatedAllJobs.length / JOBS_PER_PAGE);
              setTotalPages(newTotalPages);
              
              // Keep current page jobs or show first page if we were on page 1
              if (currentPage === 1) {
                const firstPageJobs = updatedAllJobs.slice(0, JOBS_PER_PAGE);
                setJobs(firstPageJobs);
              }
              
              // Check if we can load even more
              setHasMoreJobs(updatedAllJobs.length < 200);
              
              console.log(`✅ Loaded ${uniqueNewJobs.length} new unique jobs. Total: ${updatedAllJobs.length}`);
            } else {
              console.log('🔍 No new unique jobs found');
              setHasMoreJobs(false);
            }
          } else {
            console.log('❌ No additional jobs found');
            setHasMoreJobs(false);
          }
        } catch (error) {
          console.error('❌ Error loading more results:', error);
        }
      }, 3000); // Wait 3 seconds for search to complete
      
    } catch (error) {
      console.error('❌ Error triggering load more search:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const loadJobResults = async () => {
    try {
      console.log('📥 Fetching job results from API...');
      const response = await fetch('/api/jobs/results?per_page=50');
      console.log('📥 Results API response status:', response.status);
      
      if (!response.ok) {
        console.error('📥 Results API failed:', response.status, response.statusText);
        return;
      }
      
      const data = await response.json();
      console.log('📥 Results API data:', data);
      console.log('📥 Jobs array length:', data.jobs?.length || 0);
      
      if (data.jobs && data.jobs.length > 0) {
        console.log('✅ Setting all jobs in state:', data.jobs.length, 'jobs');
        
        // Store all jobs
        setAllJobs(data.jobs);
        
        // Calculate actual pagination - only count pages with jobs
        const actualTotalPages = Math.max(1, Math.ceil(data.jobs.length / JOBS_PER_PAGE));
        setTotalPages(actualTotalPages);
        
        console.log('📄 Pagination calculation:', {
          totalJobs: data.jobs.length,
          jobsPerPage: JOBS_PER_PAGE,
          calculatedPages: actualTotalPages
        });
        
        // Set current page jobs (first page)
        const firstPageJobs = data.jobs.slice(0, JOBS_PER_PAGE);
        setJobs(firstPageJobs);
        
        // Check if we can load more jobs beyond what we have
        // Always allow loading more unless we have a large number of jobs
        setHasMoreJobs(data.jobs.length < 200); // Cap at 200 jobs total
        
        console.log('📋 Pagination setup complete:', {
          totalJobs: data.jobs.length,
          totalPages: actualTotalPages,
          firstPageJobs: firstPageJobs.length,
          hasMoreJobs: data.jobs.length < 200
        });
      } else {
        console.log('❌ No jobs in response data');
        setJobs([]);
        setAllJobs([]);
      }
    } catch (error) {
      console.error('❌ Failed to load job results:', error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Recently posted';
      }
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Return relative time for recent posts
      if (diffDays === 1) {
        return '1 day ago';
      } else if (diffDays <= 7) {
        return `${diffDays} days ago`;
      } else if (diffDays <= 30) {
        const weeks = Math.floor(diffDays / 7);
        return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
      } else {
        // For older posts, show the actual date
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recently posted';
    }
  };

  const getJobCount = (tab: string) => {
    switch (tab) {
      case 'ALL JOBS':
        return allJobs.length;
      case 'SAVED':
        return savedJobs.length;
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
    <div className="w-full max-w-full space-y-4 px-0.5 sm:px-0 mt-16 sm:mt-6 min-h-screen overflow-x-hidden">
      {/* Tabs - Responsive Design */}
      <div className="bg-[#1a2332] rounded-lg border border-[#2a3441] p-3">
        <div 
          className="flex sm:flex-wrap gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
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
              {tab}{getJobCount(tab) > 0 ? ` ${getJobCount(tab)}` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Search Form - Mobile 3-line Layout */}
      <div className="bg-[#1a2332] rounded-lg border border-[#2a3441] p-4 w-full max-w-full overflow-hidden">
        <div className="flex flex-col md:flex-row gap-3 md:gap-2 md:items-center w-full max-w-full">
          {/* Job Title Input - Full width on mobile */}
          <div className="w-full md:flex-[3] relative">
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
                    <span>{capitalizeJobTitle(suggestion)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Location Input - Full width on mobile */}
          <div className="w-full md:flex-[2] relative">
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
          
          {/* Buttons Row - Full width on mobile */}
          <div className="flex gap-2 w-full md:w-auto">
            {/* Search Button */}
            <button 
            onClick={startJobSearch}
            onTouchStart={(e) => {
              // Prevent double-tap zoom on mobile
              e.preventDefault();
              console.log('🔘 Touch start on search button');
            }}
            onTouchEnd={(e) => {
              // Handle mobile touch
              e.preventDefault();
              console.log('🔘 Touch end on search button');
              if (!isSearching && searchQuery.trim() && location.trim()) {
                console.log('🔘 Triggering search from touch event');
                startJobSearch();
              }
            }}
              disabled={isSearching || !searchQuery.trim() || !location.trim()}
              className={`flex-1 md:w-auto pl-10 pr-4 py-2.5 h-10 rounded transition-colors flex items-center text-sm font-medium touch-manipulation relative ${
              isSearching || !searchQuery.trim() || !location.trim()
                ? 'bg-[#2a3441] text-gray-400 cursor-not-allowed border border-[#3a4651]'
                : 'bg-[#2a3441] hover:bg-[#3a4651] text-gray-300 hover:text-white border border-[#3a4651] active:bg-[#4a5661]'
            }`}
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isSearching ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Search className="h-4 w-4" />
              )}
            </div>
            <span>{isSearching ? 'SEARCHING...' : 'SEARCH'}</span>
          </button>
          
            {/* Filter Button */}
            <button className="flex-1 md:w-auto pl-10 pr-4 py-2.5 h-10 bg-[#2a3441] hover:bg-[#3a4651] text-gray-300 hover:text-white border border-[#3a4651] rounded transition-colors flex items-center text-sm font-medium relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <span>FILTER</span>
            </button>
          </div>
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
              className="block w-full max-w-full bg-[#1a2332] rounded-xl border border-[#2a3441] p-5 hover:bg-[#243142] transition-all duration-200 shadow-sm cursor-pointer overflow-hidden"
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
                  <p className="text-gray-200 text-base leading-relaxed line-clamp-2 sm:line-clamp-none break-words">
                    <span className="text-blue-400 mr-2 text-lg">✨</span>{job.description ? job.description.substring(0, 180) + '...' : 'Seeking a highly motivated professional to lead and support projects involving data analysis and research.'}
                  </p>
                </div>
                
                {/* Bottom Section - Professional Layout */}
                <div className="flex items-center justify-between pt-3 border-t border-[#3a4651]">
                  {/* Date - Subtle Gray */}
                  <div className="text-gray-400 text-xs sm:text-sm">
                    {job.posted_text || job.posted_date || 'Date not available'}
                  </div>
                  
                  {/* Action Buttons - Professional Style */}
                  <div className="flex items-center gap-2">
                    <button className="text-xs sm:text-sm font-medium text-white bg-[#475569] hover:bg-[#64748b] px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors">
                      ACCESS RESUME
                    </button>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleSaveJob(job);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isJobSaved(job.job_id)
                          ? 'text-blue-400 bg-blue-400/10 hover:bg-blue-400/20'
                          : 'text-gray-400 hover:text-white hover:bg-[#475569]'
                      }`}
                      title={isJobSaved(job.job_id) ? "Remove from Saved" : "Save Job"}
                    >
                      <Bookmark className={`h-4 w-4 ${
                        isJobSaved(job.job_id) ? 'fill-current' : ''
                      }`} />
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

      {/* Pagination UI */}
      {(() => {
        const filteredJobs = getFilteredJobs();
        return filteredJobs.length > 0 && (filteredJobs.length > JOBS_PER_PAGE || (activeTab === 'ALL JOBS' && hasMoreJobs));
      })() && (
        <div className="bg-[#1a2332] rounded-lg border border-[#2a3441] p-4 mt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Page Info */}
            <div className="text-gray-300 text-sm">
              {(() => {
                const filteredJobs = getFilteredJobs();
                const filteredTotalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
                return (
                  <>
                    <span>Page {currentPage} of {filteredTotalPages}</span>
                    <span className="mx-2 text-gray-500">•</span>
                    <span>{jobs.length} jobs on this page</span>
                    <span className="mx-2 text-gray-500">•</span>
                    <span>{filteredJobs.length} total {activeTab.toLowerCase()}</span>
                  </>
                );
              })()}
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* Previous Page */}
              {currentPage > 1 && (
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  className="px-3 py-2 text-sm bg-[#2a3441] hover:bg-[#3a4651] text-gray-300 hover:text-white border border-[#3a4651] rounded transition-colors"
                >
                  ← Prev
                </button>
              )}
              
              {/* Page Numbers - Only show if we have multiple pages with jobs */}
              {(() => {
                const filteredJobs = getFilteredJobs();
                const filteredTotalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
                return filteredJobs.length > JOBS_PER_PAGE && Array.from({ length: filteredTotalPages }, (_, i) => i + 1).map((page) => {
                  // Only show pages that actually have jobs
                  const startIndex = (page - 1) * JOBS_PER_PAGE;
                  const hasJobsOnPage = startIndex < filteredJobs.length;
                
                if (!hasJobsOnPage) return null;
                
                // Show first page, last page, current page, and pages around current
                const showPage = page === 1 || page === filteredTotalPages || 
                                Math.abs(page - currentPage) <= 1;
                                if (!showPage) {
                   // Show ellipsis
                   if (page === 2 && currentPage > 4) {
                     return <span key={page} className="text-gray-500 px-2">...</span>;
                   }
                   if (page === filteredTotalPages - 1 && currentPage < filteredTotalPages - 3) {
                     return <span key={page} className="text-gray-500 px-2">...</span>;
                   }
                   return null;
                 }
                 
                 return (
                   <button
                     key={page}
                     onClick={() => goToPage(page)}
                     className={`px-3 py-2 text-sm rounded transition-colors ${
                       page === currentPage
                         ? 'bg-blue-600 text-white border border-blue-600 font-medium'
                         : 'bg-[#2a3441] hover:bg-[#3a4651] text-gray-300 hover:text-white border border-[#3a4651]'
                     }`}
                   >
                     {page}
                   </button>
                 );
               });
              })()}
              
              {/* Next Page */}
              {(() => {
                const filteredJobs = getFilteredJobs();
                const filteredTotalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
                return currentPage < filteredTotalPages && (
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  className="px-3 py-2 text-sm bg-[#2a3441] hover:bg-[#3a4651] text-gray-300 hover:text-white border border-[#3a4651] rounded transition-colors"
                >
                  Next →
                </button>
                );
              })()}
            </div>
          </div>
          
          {/* Load More Jobs Section */}
          {hasMoreJobs && (
            <div className="mt-4 pt-4 border-t border-[#2a4651]">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-3">
                  Showing {allJobs.length} jobs. Load more to find additional opportunities.
                </p>
                <button
                  onClick={() => loadMoreJobs()}
                  disabled={isLoadingMore}
                  className={`px-6 py-3 text-sm rounded-lg transition-colors font-medium ${
                    isLoadingMore
                      ? 'bg-[#2a3441] text-gray-400 cursor-not-allowed border border-[#3a4651]'
                      : 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 shadow-md hover:shadow-lg'
                  }`}
                >
                  {isLoadingMore ? (
                    <>
                      <div className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Searching for more jobs...
                    </>
                  ) : (
                    <>
                      🔍 Load More Jobs
                      <span className="ml-2">→</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
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
