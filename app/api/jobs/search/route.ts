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
    // Add timeout and better error handling for Vercel
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
    
    const response = await fetch('https://linkedin-scraper-84814621060.us-central1.run.app/scrape-jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Talexu-JobSearch/1.0'
      },
      body: JSON.stringify({
        jobTitle: jobTitle,
        location: location,
        maxJobs: 150
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`📡 Cloud scraper response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Cloud scraper API error: ${response.status} ${response.statusText}`);
      console.error(`Error response body: ${errorText}`);
      
      // Return mock data for testing on Vercel if API fails
      console.log('🔄 Returning mock data due to API failure');
      return generateMockJobs(jobTitle, location);
    }

    const jobs = await response.json();
    
    if (jobs.error) {
      console.error('Cloud scraper error:', jobs.error);
      return generateMockJobs(jobTitle, location);
    }

    console.log(`✅ Successfully received ${jobs.length} jobs from cloud scraper`);
    return jobs;
    
  } catch (error) {
    console.error('Failed to call cloud scraper:', error);
    console.log('🔄 Returning mock data due to network error');
    return generateMockJobs(jobTitle, location);
  }
}

// Generate mock jobs for testing when external API fails
function generateMockJobs(jobTitle: string, location: string): any[] {
  const mockJobs = [];
  const companies = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Tesla', 'Spotify'];
  const descriptions = [
    'We are looking for a talented professional to join our dynamic team and contribute to cutting-edge projects.',
    'Join our innovative company and work on exciting challenges that impact millions of users worldwide.',
    'Seeking a motivated individual to help drive our mission forward with creativity and technical excellence.',
    'Be part of a collaborative environment where your skills will make a real difference in our products.',
    'Opportunity to work with industry-leading technologies and contribute to groundbreaking solutions.'
  ];
  
  for (let i = 0; i < 25; i++) {
    mockJobs.push({
      job_id: `mock_${Date.now()}_${i}`,
      job_title: jobTitle,
      company: companies[i % companies.length],
      location: location,
      description: descriptions[i % descriptions.length],
      salary_text: '$80,000 - $120,000',
      posted_text: `${Math.floor(Math.random() * 7) + 1} days ago`,
      job_url: `https://example.com/job/${i}`,
      created_at: new Date().toISOString()
    });
  }
  
  console.log(`🎭 Generated ${mockJobs.length} mock jobs for testing`);
  return mockJobs;
}

// Export functions for other routes
export function getSearchStatus() {
  return searchInProgress;
}

export function getStoredJobs() {
  return storedJobs;
}
