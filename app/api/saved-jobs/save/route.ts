import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    console.log('=== SAVED JOBS SAVE API CALLED ===');
    
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    console.log(`💾 Saving jobs for authenticated user: ${userEmail}`);
    
    const body = await request.json();
    const { jobs } = body;
    
    if (!Array.isArray(jobs)) {
      return NextResponse.json({ error: 'Jobs must be an array' }, { status: 400 });
    }
    
    // Save to Firebase Firestore under users collection
    const userDocRef = db.collection('users').doc(userEmail);
    
    // Update the user's saved jobs
    await userDocRef.set({
      savedJobs: {
        jobs: jobs,
        updatedAt: new Date().toISOString(),
        totalJobs: jobs.length
      }
    }, { merge: true }); // Use merge to not overwrite other user data
    
    console.log(`✅ Saved ${jobs.length} jobs for user ${userEmail} to Firestore`);
    
    return NextResponse.json({
      success: true,
      message: `Saved ${jobs.length} jobs successfully`,
      totalJobs: jobs.length,
      userEmail: userEmail
    });
    
  } catch (error) {
    console.error('❌ Error saving jobs to Firestore:', error);
    return NextResponse.json(
      { error: 'Failed to save jobs' },
      { status: 500 }
    );
  }
}
