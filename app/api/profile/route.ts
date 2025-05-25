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
    const { section, data, replace } = body;
    
    if (!section || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Log if this is a replace operation
    if (replace) {
      console.log(`[PROFILE API] Replacing entire ${section} section with new data`);
    }
    
    // Create a reference to the user's profile document
    const userEmail = session.user.email;
    const userDocRef = db.collection('users').doc(userEmail);
    // Get the current profile data
    const userDoc = await userDocRef.get();
    const userData = userDoc.exists ? userDoc.data() : null;
    const currentProfile = userData?.profile || {};
    // Update the profile data based on the replace flag
    let updatedProfile;
    
    if (replace) {
      // If replace is true, only keep the new section data and remove any existing data for this section
      updatedProfile = {
        ...currentProfile,
        [section]: data,  // Completely replace the section data
        lastUpdated: new Date().toISOString()
      };
      
      // Handle different sections that need to be replaced
      console.log(`[PROFILE API] Replacing ${section} with new data`);
      
      // If this is contact info and we're replacing, also clear related sections in the profile
      if (section === 'contactInfo') {
        // Remove any old data that might be merged with the new data
        console.log('[PROFILE API] Clearing related profile sections due to new resume upload');
        delete updatedProfile.workExperience;
        delete updatedProfile.education;
        delete updatedProfile.skills;
        
        // Save a flag indicating this was from a fresh resume upload
        updatedProfile.resumeUploadTimestamp = new Date().toISOString();
      }
      // For other sections, just ensure we're completely replacing that section
      else if (section === 'workExperience' || section === 'education' || section === 'skills') {
        console.log(`[PROFILE API] Completely replacing ${section} section`);
        // The section is already being replaced with the new data above
        // We just need to ensure we're not merging with existing data
      }
    } else {
      // Normal update - merge with existing data
      updatedProfile = {
        ...currentProfile,
        [section]: data,
        lastUpdated: new Date().toISOString()
      };
    }
    
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
