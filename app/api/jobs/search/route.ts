import { NextRequest, NextResponse } from 'next/server';

// Simple CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://www.talexus.ai',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

// Handle OPTIONS method for CORS preflight
const handleOptions = () => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      'Content-Length': '0'
    }
  });
};

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
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleOptions();
  }
  
  try {
    const body = await request.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));
    
    const { jobTitle, location } = body;
    console.log(`Extracted - jobTitle: "${jobTitle}", location: "${location}"`);
    
    if (!jobTitle || !location) {
      console.log('❌ Missing required fields');
      return new NextResponse(
        JSON.stringify({ error: 'Job title and location are required' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }
    
    if (searchInProgress) {
      console.log('❌ Search already in progress');
      return new NextResponse(
        JSON.stringify({ error: 'Search already in progress' }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }
    
    searchInProgress = true;
    (global as any).searchInProgress = true;
    console.log('✅ Starting cloud scraper...');
    
    try {
      // Run cloud scraper
      const jobs = await runCloudScraper(jobTitle, location);
      console.log(`✅ Cloud scraper completed. Found ${jobs.length} jobs`);
      
      // Store jobs in global storage
      storedJobs = jobs;
      (global as any).storedJobs = jobs;
      
      return new NextResponse(
        JSON.stringify({ 
          success: true, 
          message: 'Search completed successfully',
          jobCount: jobs.length 
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in cloud scraper:', errorMessage);
      
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to complete job search',
          details: errorMessage 
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    } finally {
      // Always reset search in progress flag
      searchInProgress = false;
      (global as any).searchInProgress = false;
      console.log(`🔄 Search completed. searchInProgress: ${searchInProgress}, storedJobs: ${storedJobs.length}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error in search API:', errorMessage);
    
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to process search request',
        details: errorMessage 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
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
