import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';

/**
 * API endpoint to reset user data and ensure proper isolation between users
 * This is called when a user signs up or logs in to ensure they don't see other users' data
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[USER-DATA-RESET] Request received');
    
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      console.error('[USER-DATA-RESET] Unauthorized access attempt');
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    // Get the user's email
    const userEmail = session.user.email;
    console.log(`[USER-DATA-RESET] Processing reset for user: ${userEmail}`);
    
    // Check if the user exists in the database
    const userDoc = await db.collection('users').doc(userEmail).get();
    
    if (!userDoc.exists) {
      // Create a new user document with empty data
      await db.collection('users').doc(userEmail).set({
        email: userEmail,
        createdAt: new Date().toISOString(),
        profile: {
          workExperience: [],
          education: [],
          skills: [],
          lastUpdated: new Date().toISOString()
        },
        // This flag indicates this is a new user with no resume data
        isNewUser: true,
        // Set flags to ensure frontend clears any cached data
        clearCache: true,
        ignoreLocalStorage: true
      });
      
      console.log(`[USER-DATA-RESET] Created new user document for: ${userEmail}`);
    } else {
      // Update existing user document to ensure data isolation
      await db.collection('users').doc(userEmail).update({
        // Set flags to ensure frontend clears any cached data
        clearCache: true,
        ignoreLocalStorage: true,
        dataResetAt: new Date().toISOString()
      });
      
      console.log(`[USER-DATA-RESET] Updated existing user document for: ${userEmail}`);
    }
    
    // Check if there's parsed resume data for this user
    const parsedResumeDoc = await db.collection('parsedResumes').doc(userEmail).get();
    
    // Return appropriate response based on whether the user has resume data
    if (parsedResumeDoc.exists) {
      console.log(`[USER-DATA-RESET] User has parsed resume data: ${userEmail}`);
      return NextResponse.json({
        success: true,
        hasResumeData: true,
        userEmail: userEmail,
        message: 'User data reset completed with existing resume data',
        clearCache: true
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      });
    } else {
      console.log(`[USER-DATA-RESET] User has no parsed resume data: ${userEmail}`);
      return NextResponse.json({
        success: true,
        hasResumeData: false,
        userEmail: userEmail,
        message: 'User data reset completed with no resume data',
        clearCache: true
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      });
    }
  } catch (error) {
    console.error('[USER-DATA-RESET] Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      clearCache: true
    }, { status: 500 });
  }
}
