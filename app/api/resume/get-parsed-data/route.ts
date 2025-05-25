import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';

/**
 * API endpoint to get the parsed resume data directly
 * This bypasses localStorage completely and ensures we always get the latest data
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the user's email
    const userEmail = session.user.email;
    
    // Get the parsed resume data directly from the parsedResumes collection
    const parsedResumeDoc = await db.collection('parsedResumes').doc(userEmail).get();
    
    if (!parsedResumeDoc.exists) {
      return NextResponse.json({ 
        error: 'No parsed resume found',
        parsedResumeData: null
      }, { status: 404 });
    }
    
    const parsedResumeData = parsedResumeDoc.data();
    
    // Return the parsed resume data directly
    return NextResponse.json({
      parsedResumeData: parsedResumeData.parsedResumeData || null,
      parsedResumeUrl: parsedResumeData.parsedResumeUrl || null,
      timestamp: parsedResumeData.parsedResumeTimestamp || null
    });
    
  } catch (error) {
    console.error('Error getting parsed resume data:', error);
    return NextResponse.json({ 
      error: 'Failed to get parsed resume data' 
    }, { status: 500 });
  }
}
