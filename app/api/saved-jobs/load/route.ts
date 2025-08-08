import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    console.log('=== SAVED JOBS LOAD API CALLED ===');
    
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    console.log(`📥 Loading saved jobs for authenticated user: ${userEmail}`);
    
    // Load from Firebase Firestore users collection
    const userDocRef = db.collection('users').doc(userEmail);
    const userDoc = await userDocRef.get();
    
    if (!userDoc.exists) {
      console.log(`📝 No user document found for: ${userEmail}`);
      
      return NextResponse.json({
        success: true,
        jobs: [],
        totalJobs: 0,
        userEmail: userEmail,
        message: 'No saved jobs found'
      });
    }
    
    const userData = userDoc.data();
    const savedJobsData = userData?.savedJobs;
    
    if (!savedJobsData || !savedJobsData.jobs) {
      console.log(`📝 No saved jobs found for user: ${userEmail}`);
      
      return NextResponse.json({
        success: true,
        jobs: [],
        totalJobs: 0,
        userEmail: userEmail,
        message: 'No saved jobs found'
      });
    }
    
    const jobs = savedJobsData.jobs || [];
    
    console.log(`✅ Loaded ${jobs.length} saved jobs for user ${userEmail}`);
    
    return NextResponse.json({
      success: true,
      jobs: jobs,
      totalJobs: jobs.length,
      userEmail: userEmail,
      updatedAt: savedJobsData.updatedAt
    });
    
  } catch (error) {
    console.error('❌ Error loading saved jobs from Firestore:', error);
    return NextResponse.json(
      { error: 'Failed to load saved jobs' },
      { status: 500 }
    );
  }
}
