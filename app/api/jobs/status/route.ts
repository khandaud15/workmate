import { NextRequest, NextResponse } from 'next/server';
import { getSearchStatus, getStoredJobs } from '../search/route';

export async function GET(request: NextRequest) {
  try {
    const isSearching = getSearchStatus();
    const storedJobs = getStoredJobs();
    const jobCount = storedJobs.length;
    
    console.log(`📊 Status API - isSearching: ${isSearching}, jobCount: ${jobCount}`);
    
    return NextResponse.json({
      running: isSearching,
      total_jobs: jobCount,
      message: isSearching ? 'Search in progress...' : 'Search completed',
      progress: isSearching ? 50 : 100,
      search_query: '',
      location: ''
    });
  } catch (error) {
    console.error('Status error:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
