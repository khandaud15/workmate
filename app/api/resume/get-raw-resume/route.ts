import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

/**
 * API endpoint to get the raw resume URL
 * This provides access to the original uploaded resume file
 * with strict user isolation to prevent data leakage between users
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[API] Raw resume URL request received');
    
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      console.error('[API] Unauthorized access attempt to raw resume');
      return NextResponse.json({ error: 'Unauthorized', rawResumeUrl: null }, { status: 401 });
    }
    
    // Get the user's email
    const userEmail = session.user.email;
    console.log(`[API] Authenticated user requesting raw resume: ${userEmail}`);
    
    // Get the user's profile document which should contain the raw resume URL
    const userDoc = await db.collection('users').doc(userEmail).get();
    
    if (!userDoc.exists) {
      console.log(`[API] No user profile found for: ${userEmail}`);
      return NextResponse.json({ 
        error: 'No user profile found',
        rawResumeUrl: null
      }, { status: 404 });
    }
    
    const userData = userDoc.data();
    
    // Check if we have a raw resume URL or fallback to resumeUrl
    let resumeUrl = userData?.rawResumeUrl || userData?.resumeUrl;
    if (!resumeUrl) {
      console.log(`[API] No resume URL found for user: ${userEmail}`);
      return NextResponse.json({ 
        error: 'No resume found',
        rawResumeUrl: null
      }, { status: 404 });
    }
    
    console.log(`[API] Successfully retrieved resume URL for: ${userEmail}`);
    
    // Return the resume URL with strict no-cache headers
    return NextResponse.json({
      rawResumeUrl: resumeUrl,
      userEmail: userEmail // Include user email for verification on client side
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });
    
  } catch (error) {
    console.error('Error getting raw resume URL:', error);
    return NextResponse.json({ 
      error: 'Failed to get raw resume URL',
      rawResumeUrl: null
    }, { status: 500 });
  }
}
