import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  console.log('[PARSE API] Called /api/resume/parse');
  
  // Authenticate user
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.email) {
      console.error('[PARSE API] Authentication failed');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    console.log('[PARSE API] Authenticated as', userEmail);
    
    // Get user document from Firestore
    const userDoc = await db.collection('users').doc(userEmail).get();
    
    if (!userDoc.exists) {
      console.log('[PARSE API] User document not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userData = userDoc.data();
    
    // Check if parsed resume URL exists
    if (!userData?.parsedResumeUrl) {
      console.log('[PARSE API] No parsed resume URL found for user');
      return NextResponse.json({ error: 'No parsed resume found' }, { status: 404 });
    }
    
    // Fetch the parsed resume data
    try {
      console.log('[PARSE API] Fetching parsed resume from:', userData.parsedResumeUrl);
      const response = await fetch(userData.parsedResumeUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch parsed resume: ${response.status} ${response.statusText}`);
      }
      
      const parsedResumeData = await response.json();
      console.log('[PARSE API] Successfully fetched parsed resume data');
      
      return NextResponse.json({
        data: parsedResumeData,
        success: true
      });
    } catch (fetchError) {
      console.error('[PARSE API] Error fetching parsed resume:', fetchError);
      return NextResponse.json(
        { error: fetchError instanceof Error ? fetchError.message : 'Failed to fetch parsed resume' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[PARSE API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
