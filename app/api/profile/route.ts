import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';
// Removed client SDK imports. Use admin SDK methods directly.

// API route for saving and retrieving user profile data
export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse the request body
    const body = await request.json();
    const { section, data } = body;
    
    if (!section || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Create a reference to the user's profile document
    const userEmail = session.user.email;
    const userDocRef = db.collection('users').doc(userEmail);
    // Get the current profile data
    const userDoc = await userDocRef.get();
    const userData = userDoc.exists ? userDoc.data() : null;
    const currentProfile = userData?.profile || {};
    // Update only the specified section
    const updatedProfile = {
      ...currentProfile,
      [section]: data,
      lastUpdated: new Date().toISOString()
    };
    // Save to Firestore
    await userDocRef.set({ profile: updatedProfile }, { merge: true });
    
    return NextResponse.json({ 
      success: true, 
      message: `${section} updated successfully` 
    });
    
  } catch (error) {
    console.error('Error saving profile data:', error);
    return NextResponse.json({ 
      error: 'Failed to save profile data' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the user's profile document
    const userEmail = session.user.email;
    const userDocRef = db.collection('users').doc(userEmail);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      return NextResponse.json({ profile: {} });
    }
    const userData = userDoc.data();
    if (!userData) {
      return NextResponse.json({ profile: {} });
    }
    // Also return parsedResumeUrl and resumeUrl if present
    return NextResponse.json({ 
      profile: userData.profile || {},
      parsedResumeUrl: userData.parsedResumeUrl || null,
      resumeUrl: userData.resumeUrl || null
    });
    
  } catch (error) {
    console.error('Error retrieving profile data:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve profile data' 
    }, { status: 500 });
  }
}
