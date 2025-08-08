import { NextRequest, NextResponse } from 'next/server';
import { getLatestStoredJobs } from '../search/route';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const perPage = parseInt(searchParams.get('per_page') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    
    console.log('📥 Results API called - fetching jobs from Firebase...');
    
    // Get jobs from Firebase
    const storedJobs = await getLatestStoredJobs();
    
    console.log(`📥 Retrieved ${storedJobs.length} jobs from Firebase`);
    
    // Calculate pagination
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedJobs = storedJobs.slice(startIndex, endIndex);
    
    console.log(`📥 Results API: Returning ${paginatedJobs.length} jobs (page ${page}, total: ${storedJobs.length})`);
    
    return NextResponse.json({
      jobs: paginatedJobs,
      total: storedJobs.length,
      page: page,
      per_page: perPage,
      has_more: endIndex < storedJobs.length
    });
  } catch (error) {
    console.error('🔥 Results API error:', error);
    return NextResponse.json(
      { error: 'Failed to get job results' },
      { status: 500 }
    );
  }
}
