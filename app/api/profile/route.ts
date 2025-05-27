import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';
import { storage } from '@/lib/firebase-storage';
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

async function getSignedUrlIfGsUri(uri: string | null): Promise<string | null> {
  if (!uri || !uri.startsWith('gs://')) return uri;
  try {
    // Extract bucket and file path
    const match = uri.match(/^gs:\/\/([^\/]+)\/(.+)$/);
    if (!match) return null;
    const bucketName = match[1];
    const filePath = match[2];
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);
    // Generate a signed URL valid for 1 hour
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000
    });
    return signedUrl;
  } catch (err) {
    console.error('[PROFILE API] Failed to generate signed URL for', uri, err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the user's profile data from Firestore
    const userEmail = session.user.email;
    const userDocRef = db.collection('users').doc(userEmail);
    const userDoc = await userDocRef.get();
    const userData = userDoc.exists ? userDoc.data() : {};
    
    // Get the parsed resume data if available
    let parsedResumeData = null;
    const parsedResumeDoc = await db.collection('parsedResumes').doc(userEmail).get();
    if (parsedResumeDoc.exists) {
      parsedResumeData = parsedResumeDoc.data()?.parsedResumeData;
    }
    
    // Check if there's a new resume available
    const newResumeAvailable = userData?.newResumeAvailable === true;
    
    // If there's a new resume, include a flag in the response
    if (newResumeAvailable) {
      console.log('[PROFILE API] New resume available, returning flag');
      
      // Clear the flag to prevent it from being returned multiple times
      await userDocRef.update({
        newResumeAvailable: false
      });
    }
    
    // Log what we found for debugging
    console.log(`[PROFILE API] User data for ${userEmail}:`, {
      hasProfile: !!userData?.profile,
      hasParsedResumeUrl: !!userData?.parsedResumeUrl,
      hasResumeUrl: !!userData?.resumeUrl,
      hasRawResumeUrl: !!userData?.rawResumeUrl,
      newResumeAvailable: newResumeAvailable,
      hasParsedResumeData: !!parsedResumeData
    });

    // Check if we need to look in other collections for resume data
    let resumeUrl = userData?.resumeUrl || userData?.rawResumeUrl || null;
    let rawResumeUrl = userData?.rawResumeUrl || null;
    let uploadsResumeUrl = null;
    let directStorageUrl = null;

    // If we still don't have a resume URL, check the uploads collection
    if (!resumeUrl) {
      try {
        console.log(`[PROFILE API] Looking for resume in uploads collection for ${userEmail}`);
        const uploadsDoc = await db.collection('uploads').doc(userEmail).get();
        if (uploadsDoc.exists) {
          const uploadsData = uploadsDoc.data();
          uploadsResumeUrl = uploadsData?.resumeUrl || uploadsData?.rawResumeUrl || uploadsData?.url || null;
          if (uploadsResumeUrl) {
            resumeUrl = uploadsResumeUrl;
          }
          console.log(`[PROFILE API] Found resume URL in uploads collection: ${!!resumeUrl}`);
        }
      } catch (error) {
        console.error('[PROFILE API] Error checking uploads collection:', error);
      }
    }
    
    // If still no resume, check Firebase Storage directly
    if (!resumeUrl) {
      try {
        console.log(`[PROFILE API] Checking Firebase Storage directly for ${userEmail}`);
        const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
        console.log(`[PROFILE API] Using bucket name: ${bucketName}`);
        const bucket = storage.bucket(bucketName);
        console.log(`[PROFILE API] Bucket reference obtained: ${bucket.name}`);
        
        // Check multiple possible locations
        const possiblePaths = [
          `raw_resume/${userEmail}`, // Direct path
          `resumes/${userEmail}`,
          `uploads/${userEmail}/resume.pdf`,
        ];
        
        try {
          // Try both encoded and unencoded email formats
          const [files] = await bucket.getFiles({ prefix: `raw_resume/${userEmail}/` });
          console.log(`[PROFILE API] Files in raw_resume/${userEmail}/: ${files?.length || 0}`);
          if (files && files.length > 0) {
            console.log('[PROFILE API] Found files in user folder:', files.map(f => f.name));
            files.forEach(f => console.log(`[PROFILE API] File: ${f.name}, Created: ${f.metadata?.timeCreated}`));
            // Sort by creation time (newest first)
            files.sort((a, b) => {
              const aCreated = a.metadata?.timeCreated ? new Date(a.metadata.timeCreated).getTime() : 0;
              const bCreated = b.metadata?.timeCreated ? new Date(b.metadata.timeCreated).getTime() : 0;
              return bCreated - aCreated;
            });
            // Get the most recent file
            const mostRecentFile = files[0];
            console.log(`[PROFILE API] Found most recent resume: ${mostRecentFile.name}`);
            try {
              const [signedUrl] = await mostRecentFile.getSignedUrl({
                action: 'read',
                expires: Date.now() + 60 * 60 * 1000 // 1 hour
              });
              console.log(`[PROFILE API] Signed URL generated: ${signedUrl}`);
              directStorageUrl = signedUrl;
              resumeUrl = signedUrl;
            } catch (err) {
              console.error('[PROFILE API] Error generating signed URL:', err);
            }
          } else {
            console.log(`[PROFILE API] No files found in raw_resume/${userEmail}/`);
          }
        } catch (error) {
          console.error('[PROFILE API] Error checking raw_resume folder:', error);
        }
      } catch (error) {
        console.error('[PROFILE API] Error checking Firebase Storage directly:', error);
      }
    }

    // Return profile data, parsed resume data, and flags
    return NextResponse.json({ 
      profile: userData?.profile || {},
      parsedResumeUrl: userData?.parsedResumeUrl || null,
      resumeUrl: resumeUrl, // This will be a signed URL if a file exists
      newResumeAvailable: newResumeAvailable,
      parsedResumeData: parsedResumeData,
      userEmail: userEmail // Include the user's email for verification on frontend
    });
    
  } catch (error) {
    console.error('Error retrieving profile data:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve profile data' 
    }, { status: 500 });
  }
}
