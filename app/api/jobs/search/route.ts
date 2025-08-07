import { NextRequest, NextResponse } from 'next/server';

// Robust in-memory job storage with global persistence
if (!(global as any).storedJobs) {
  (global as any).storedJobs = [];
}
if (!(global as any).searchInProgress) {
  (global as any).searchInProgress = false;
}

let storedJobs: any[] = (global as any).storedJobs;
let searchInProgress: boolean = (global as any).searchInProgress;

export async function POST(request: NextRequest) {
  console.log('=== SEARCH API CALLED ===');
  
  try {
    const body = await request.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));
    
    const { jobTitle, location } = body;
    console.log(`Extracted - jobTitle: "${jobTitle}", location: "${location}"`);
    
    if (!jobTitle || !location) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Job title and location are required' },
        { status: 400 }
      );
    }
    
    if (searchInProgress) {
      console.log('❌ Search already in progress');
      return NextResponse.json(
        { error: 'Search already in progress' },
        { status: 429 }
      );
    }
    
    searchInProgress = true;
    (global as any).searchInProgress = true;
    console.log('✅ Starting cloud scraper...');
    
    try {
      // Run cloud scraper directly with simpler approach
      const jobs = await runCloudScraper(jobTitle, location);
      console.log(`✅ Cloud scraper completed. Found ${jobs.length} jobs`);
      
      // Store jobs directly in global storage
      storedJobs = jobs;
      (global as any).storedJobs = jobs;
      console.log(`📊 Jobs stored in memory: ${storedJobs.length} jobs`);
      
      return NextResponse.json({
        success: true,
        message: `Found ${jobs.length} jobs`,
        jobCount: jobs.length
      });
    } catch (error) {
      console.error('❌ Cloud scraper error:', error);
      return NextResponse.json(
        { error: 'Failed to run job search' },
        { status: 500 }
      );
    } finally {
      searchInProgress = false;
      (global as any).searchInProgress = false;
      console.log(`🔄 Search completed. searchInProgress: ${searchInProgress}, storedJobs: ${storedJobs.length}`);
    }
  } catch (error) {
    console.error('❌ API Error:', error);
    searchInProgress = false;
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function runCloudScraper(jobTitle: string, location: string): Promise<any[]> {
  console.log(`🌐 Calling cloud scraper API for "${jobTitle}" in "${location}"`);
  
  try {
    const response = await fetch('https://linkedin-scraper-84814621060.us-central1.run.app/scrape-jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobTitle: jobTitle,
        location: location,
        maxJobs: 150  // Restored: get full job count from commercial scraper
      })
    });

    if (!response.ok) {
      console.error(`Cloud scraper API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const jobs = await response.json();
    
    if (jobs.error) {
      console.error('Cloud scraper error:', jobs.error);
      return [];
    }

    console.log(`✅ Successfully received ${jobs.length} jobs from cloud scraper`);
    return jobs;
    
  } catch (error) {
    console.error('Failed to call cloud scraper:', error);
    return [];
  }
}

// Export functions for other routes
export function getSearchStatus() {
  return searchInProgress;
}

export function getStoredJobs() {
  return storedJobs;
}
