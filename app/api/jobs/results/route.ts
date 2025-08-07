import { NextRequest, NextResponse } from 'next/server';
import { getStoredJobs } from '../search/route';

// Moved storeJobs functionality to search/route.ts
// This function is now handled by the search route

// Get job count helper (moved to top level)
function getJobsCount() {
  const storedJobs = getStoredJobs();
  return storedJobs.length;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const perPage = parseInt(searchParams.get('per_page') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    
    // Get jobs from the search route
    const storedJobs = getStoredJobs();
    
    // Calculate pagination
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedJobs = storedJobs.slice(startIndex, endIndex);
    
    console.log(`Results API: Returning ${paginatedJobs.length} jobs (page ${page}, total: ${storedJobs.length})`);
    
    return NextResponse.json({
      jobs: paginatedJobs,
      total: storedJobs.length,
      page: page,
      per_page: perPage,
      has_more: endIndex < storedJobs.length
    });
  } catch (error) {
    console.error('Results error:', error);
    return NextResponse.json(
      { error: 'Failed to get job results' },
      { status: 500 }
    );
  }
}
