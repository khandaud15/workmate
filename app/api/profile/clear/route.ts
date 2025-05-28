import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

/**
 * API endpoint to completely clear a user's profile data
 * This is useful when a new resume is uploaded and we want to ensure
 * no old data persists in the database
 */
export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the user's email
    const userEmail = session.user.email;
    
    // Reference to the user document
    const userDocRef = db.collection('users').doc(userEmail);
    
    // Completely reset the profile
    await userDocRef.set({
      profile: {
        // Only keep a timestamp
        lastUpdated: new Date().toISOString(),
        // These empty arrays ensure we start fresh
        workExperience: [],
        education: [],
        skills: [],
        // This flag indicates we've completely reset the profile
        completelyReset: true
      },
      // This is a critical flag that tells the frontend to ignore localStorage
      ignoreLocalStorage: true,
      // Add a timestamp for when the profile was cleared
      profileClearedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log(`[PROFILE CLEAR API] Completely reset profile for user: ${userEmail}`);
    
    return NextResponse.json({ 
      success: true,
      message: 'Profile data completely cleared'
    });
    
  } catch (error) {
    console.error('Error clearing profile data:', error);
    return NextResponse.json({ 
      error: 'Failed to clear profile data' 
    }, { status: 500 });
  }
}
