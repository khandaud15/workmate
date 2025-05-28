import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET() {
  console.log('[PARSE API] Called /api/resume/parse');
  
  // Authenticate user
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.email) {
      console.error('[PARSE API] Authentication failed');
      return NextResponse.json({ 
        error: 'Authentication required', 
        success: false,
        clearCache: true 
      }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    console.log('[PARSE API] Authenticated as', userEmail);
    
    // SINGLE SOURCE OF TRUTH: Get parsed resume data directly from parsedResumes collection
    console.log('[PARSE API] Retrieving data from parsedResumes collection');
    const parsedResumeDoc = await db.collection('parsedResumes').doc(userEmail).get();
    
    if (!parsedResumeDoc.exists) {
      console.log('[PARSE API] No parsed resume found for user');
      return NextResponse.json({ 
        error: 'No parsed resume found', 
        success: false,
        clearCache: true 
      }, { 
        status: 404,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }
    
    const parsedResumeData = parsedResumeDoc.data();
    
    // Verify data ownership
    if (!parsedResumeData) {
      console.error('[PARSE API] Empty data for user');
      return NextResponse.json({ 
        error: 'No resume data available', 
        success: false,
        clearCache: true 
      }, { status: 404 });
    }
    
    // Additional verification to ensure data belongs to the current user
    if (parsedResumeData.userEmail && parsedResumeData.userEmail !== userEmail) {
      console.error(`[PARSE API] Data ownership mismatch! Document belongs to ${parsedResumeData.userEmail} but request is from ${userEmail}`);
      return NextResponse.json({ 
        error: 'Data ownership verification failed', 
        success: false,
        clearCache: true 
      }, { status: 403 });
    }
    
    console.log('[PARSE API] Successfully retrieved parsed resume data');
    
    return NextResponse.json({
      data: parsedResumeData.parsedResumeData || null,
      success: true,
      userEmail: userEmail, // Include user email for verification on client side
      timestamp: parsedResumeData.parsedResumeTimestamp || new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('[PARSE API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
