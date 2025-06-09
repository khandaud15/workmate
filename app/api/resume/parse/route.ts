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
    
    // Get all parsed resumes for the user, ordered by timestamp
    console.log('[PARSE API] Retrieving resumes from parsed_resumes collection');
    const userResumesRef = db.collection('parsed_resumes').doc(userEmail).collection('resumes');
    const q = userResumesRef
      .where('status', '==', 'parsed')
      .orderBy('uploadTimestamp', 'desc')
      .limit(1); // Get most recent parsed resume
    
    const querySnapshot = await q.get();
    
    if (querySnapshot.empty) {
      console.log('[PARSE API] No parsed resumes found for user');
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
    
    // Get the most recent parsed resume
    const parsedResumeDoc = querySnapshot.docs[0];
    const parsedResumeData = parsedResumeDoc.data();
    const resumeId = parsedResumeDoc.id;
    
    if (!parsedResumeData || !parsedResumeData.parsedResumeData) {
      console.error('[PARSE API] Empty or invalid data for resume:', resumeId);
      return NextResponse.json({ 
        error: 'No resume data available', 
        success: false,
        clearCache: true 
      }, { status: 404 });
    }
    
    console.log('[PARSE API] Successfully retrieved parsed resume data');
    
    return NextResponse.json({
      data: parsedResumeData.parsedResumeData,
      success: true,
      userEmail: userEmail,
      resumeId: resumeId,
      timestamp: parsedResumeData.parsedResumeTimestamp?.toDate().toISOString() || new Date().toISOString()
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
