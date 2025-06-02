import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    const { resumeId, contactInfo } = await req.json();
    
    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }
    
    console.log(`Updating contact info for resume ${resumeId} for user ${userEmail}`, { 
      resumeId, 
      userEmail,
      contactInfo
    });

    // Get user doc reference
    const userRef = db.collection('users').doc(userEmail);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update the contact info for this resume
    await userRef.update({
      [`resumeContactInfo.${resumeId}`]: contactInfo
    });
    
    console.log(`Successfully updated contact info for resume ${resumeId}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating contact info:', error);
    return NextResponse.json({ error: error.message || 'Failed to update contact info' }, { status: 500 });
  }
}