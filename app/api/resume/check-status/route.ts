import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';

/**
 * API endpoint to check if a new resume has been uploaded
 * This helps the frontend know when to prioritize resume data over localStorage
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the user's data from Firestore
    const userEmail = session.user.email;
    const userDocRef = db.collection('users').doc(userEmail);
    const userDoc = await userDocRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ 
        hasNewResume: false,
        timestamp: null
      });
    }
    
    const userData = userDoc.data();
    
    // Check if there's a new resume available
    const hasNewResume = userData?.newResumeAvailable === true;
    const timestamp = userData?.resumeUploadTimestamp || null;
    
    // Return the status without clearing the flag
    // The profile API will clear the flag when fetching profile data
    return NextResponse.json({
      hasNewResume,
      timestamp
    });
    
  } catch (error) {
    console.error('Error checking resume status:', error);
    return NextResponse.json({ 
      error: 'Failed to check resume status',
      hasNewResume: false,
      timestamp: null
    }, { status: 500 });
  }
}
