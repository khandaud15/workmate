import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to access this resource' },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;

    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(userEmail).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    
    // Get parsed resume data if available
    let parsedResumeData = null;
    if (userData?.parsedResumeId) {
      const parsedResumeDoc = await db.collection('parsedResumes').doc(userData.parsedResumeId).get();
      if (parsedResumeDoc.exists) {
        parsedResumeData = parsedResumeDoc.data();
        
        // Verify this resume belongs to the current user
        if (!parsedResumeData || parsedResumeData.userEmail !== userEmail) {
          console.error('Security issue: Attempted to access resume data belonging to another user or resume data is missing');
          parsedResumeData = null;
        }
      }
    }

    // Prepare response with all necessary data for onboarding
    const response = {
      profile: userData?.profile || {},
      parsedResume: parsedResumeData,
      // Add cache-busting timestamp to ensure fresh data
      timestamp: new Date().toISOString()
    };

    // Set cache control headers to prevent caching
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Error fetching onboarding data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding data' },
      { status: 500 }
    );
  }
}
