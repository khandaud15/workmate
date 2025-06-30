import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * API endpoint to get resume data by ID
 * This retrieves both the metadata and structured content of a specific resume
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      console.error('[GET-RESUME-BY-ID API] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the user's email
    const userEmail = session.user.email;
    
    // Get the resume ID from the query parameters
    const resumeId = request.nextUrl.searchParams.get('id');
    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }
    
    console.log(`[GET-RESUME-BY-ID API] Fetching resume ${resumeId} for user ${userEmail}`);
    
    // Get the resume metadata from the resumes collection
    const resumeDoc = await db.collection('resumes').doc(resumeId).get();
    
    if (!resumeDoc.exists) {
      console.log(`[GET-RESUME-BY-ID API] Resume ${resumeId} not found`);
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
    
    const resumeData = resumeDoc.data();
    
    // Verify that the resume belongs to the authenticated user
    if (resumeData?.userId !== userEmail && resumeData?.owner !== userEmail) {
      console.error(`[GET-RESUME-BY-ID API] User ${userEmail} attempted to access resume ${resumeId} belonging to ${resumeData?.userId || resumeData?.owner}`);
      return NextResponse.json({ error: 'Unauthorized access to this resume' }, { status: 403 });
    }
    
    // Get the parsed resume data if available
    let parsedData = null;
    if (resumeData?.parsedDataId) {
      const parsedDoc = await db.collection('parsedResumeData').doc(resumeData.parsedDataId).get();
      if (parsedDoc.exists) {
        parsedData = parsedDoc.data();
      }
    }
    
    // Construct a comprehensive resume object with all available data
    const comprehensiveResume = {
      ...resumeData,
      parsedData,
      id: resumeId
    };
    
    return NextResponse.json({ 
      resume: comprehensiveResume,
      success: true
    });
    
  } catch (error) {
    console.error('[GET-RESUME-BY-ID API] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch resume data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
}
