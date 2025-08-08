import { NextRequest, NextResponse } from 'next/server';
import { getLatestSearchStatus } from '../search/route';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Status API called - fetching from Firebase...');
    const status = await getLatestSearchStatus();
    
    console.log(`📊 Status API - running: ${status.running}, total_jobs: ${status.total_jobs}`);
    
    return NextResponse.json({
      running: status.running,
      total_jobs: status.total_jobs,
      message: status.message,
      progress: status.progress,
      search_query: status.search_query || '',
      location: status.location || ''
    });
  } catch (error) {
    console.error('🔥 Status API error:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
