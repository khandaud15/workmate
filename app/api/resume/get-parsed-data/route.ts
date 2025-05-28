import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * API endpoint to get the parsed resume data directly
 * This bypasses localStorage completely and ensures we always get the latest data
 * with strict user isolation to prevent data leakage between users
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[FETCH API] Resume data request received');
    
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      console.error('[FETCH API] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized', parsedResumeData: null }, { status: 401 });
    }
    
    // Get the user's email
    const userEmail = session.user.email;
    console.log(`[FETCH API] Authenticated user: ${userEmail}`);
    
    // SINGLE SOURCE OF TRUTH: Get the parsed resume data ONLY from the parsedResumes collection
    console.log(`[FETCH API] Retrieving parsed resume data for user: ${userEmail}`);
    const parsedResumeDoc = await db.collection('parsedResumes').doc(userEmail).get();
    
    if (!parsedResumeDoc.exists) {
      console.log(`[FETCH API] No parsed resume found for user: ${userEmail}`);
      return NextResponse.json({ 
        error: 'No parsed resume found',
        parsedResumeData: null,
        newUser: true,
        clearCache: true
      }, { 
        status: 404,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      });
    }
    
    const parsedResumeData = parsedResumeDoc.data();
    
    // Strict verification to ensure data belongs to the current user
    if (!parsedResumeData) {
      console.error(`[FETCH API] Empty data for user: ${userEmail}`);
      return NextResponse.json({ 
        error: 'No resume data available',
        parsedResumeData: null,
        clearCache: true
      }, { status: 404 });
    }
    
    // Additional verification to ensure data belongs to the current user
    if (parsedResumeData.userEmail && parsedResumeData.userEmail !== userEmail) {
      console.error(`[FETCH API] Data ownership mismatch! Document belongs to ${parsedResumeData.userEmail} but request is from ${userEmail}`);
      return NextResponse.json({ 
        error: 'Data ownership verification failed',
        parsedResumeData: null,
        clearCache: true
      }, { status: 403 });
    }
    
    console.log(`[FETCH API] Successfully retrieved resume data for: ${userEmail}`);
    
    // Return the data with strict no-cache headers
    return NextResponse.json({
      parsedResumeData: parsedResumeData?.parsedResumeData || null,
      parsedResumeUrl: parsedResumeData?.parsedResumeUrl || null,
      timestamp: parsedResumeData?.parsedResumeTimestamp || null,
      userEmail: userEmail, // Include user email for verification on client side
      clearLocalStorage: true // Signal to client to clear any localStorage cached data
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
    
  } catch (error) {
    console.error('Error getting parsed resume data:', error);
    return NextResponse.json({ 
      error: 'Failed to get parsed resume data',
      parsedResumeData: null,
      clearCache: true
    }, { status: 500 });
  }
}
