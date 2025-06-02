import { NextResponse } from 'next/server';
import { storage } from '@/lib/firebase-storage';
import { db } from '@/lib/firebase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

const AFFINDA_API_KEY = process.env.AFFINDA_API_KEY;
const AFFINDA_BASE_URL = 'https://api.affinda.com/v2';

export async function POST(request: Request) {
  console.log('[UPLOAD API] Called /api/resume/upload');
  
  // Define userEmail in the outer scope so it's available throughout the function
  let userEmail: string;
  
  // Enhanced authentication check
  try {
    const session = await getServerSession(authOptions);
    console.log('[UPLOAD API] Session check result:', session ? 'Session found' : 'No session');
    
    if (!session) {
      console.error('[UPLOAD API] No session found');
      return NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 });
    }
    
    if (!session.user) {
      console.error('[UPLOAD API] Session has no user object');
      return NextResponse.json({ error: 'Invalid session. Please sign in again.' }, { status: 401 });
    }
    
    if (!session.user.email) {
      console.error('[UPLOAD API] User has no email');
      return NextResponse.json({ error: 'User email not found. Please sign in with a valid email.' }, { status: 401 });
    }
    
    userEmail = session.user.email;
    console.log('[UPLOAD API] Authenticated as', userEmail);
  } catch (authError) {
    console.error('[UPLOAD API] Error checking authentication:', authError);
    return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const resumeName = formData.get('resumeName') as string | null;
    const isTargeted = formData.get('isTargeted') === 'true';
    console.log('[UPLOAD API] Got form data', { resumeName, fileName: file?.name, isTargeted });

    if (!file) {
      console.error('[UPLOAD API] No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Log file details
    console.log('[UPLOAD API] File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // --- Upload file to Firebase Storage ---
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('[UPLOAD API] Got arrayBuffer');
    const buffer = Buffer.from(arrayBuffer);
    console.log('[UPLOAD API] Converted to Buffer');
    
    // Explicitly set bucket name from environment variable
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || 'talexus-4339c.appspot.com';
    console.log('[UPLOAD API] Using bucket name:', bucketName);
    
    // Get bucket with explicit name
    const bucket = storage.bucket(bucketName);
    console.log('[UPLOAD API] Got bucket reference with name:', bucket.name);
    
    const filePath = `raw_resume/${userEmail}/${Date.now()}_${file.name}`;
    const storageFile = bucket.file(filePath);
    try {
      console.log('[UPLOAD API] Attempting to save file to path:', filePath);
      await storageFile.save(buffer, {
        contentType: file.type,
        public: false,
      });
      console.log('[UPLOAD API] File uploaded to Firebase Storage:', filePath);
    } catch (uploadErr) {
      console.error('[UPLOAD API] Error uploading to Firebase Storage:', uploadErr);
      throw uploadErr;
    }
    // Get download URL (signed for 1 year)
    const [url] = await storageFile.getSignedUrl({
      action: 'read',
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000
    });
    // Store file URL in Firestore under user's doc
    // First, check if the user already has a resume
    const userDoc = await db.collection('users').doc(userEmail).get();
    const userData = userDoc.exists ? userDoc.data() : null;
    const hadPreviousResume = userData && userData.resumeUrl;
    
    // Store the new resume URL
    // Save custom resume name keyed by file name
    const fileKey = filePath.split('/').pop() || file.name;
    console.log('[UPLOAD API] Using fileKey for resumeName:', fileKey);
    
    // Get existing resumeNames or create new object
    let resumeNamesUpdate = {};
    let targetedUpdate = {};
    // Get current user data
    const currentUserData: any = userDoc && userDoc.exists && typeof userDoc.data === 'function' ? userDoc.data() : {};
    const currentResumeNames = (currentUserData && currentUserData.resumeNames) ? currentUserData.resumeNames : {};
    const currentTargeted = (currentUserData && currentUserData.targetedResumes) ? currentUserData.targetedResumes : {};
    
    console.log('[UPLOAD API] Current data:', {
      resumeNames: currentResumeNames,
      targetedResumes: currentTargeted
    });
    // Update resumeNames
    if (resumeName) {
      // Check if this resume name already exists for another file
      const existingNames = Object.values(currentResumeNames);
      let uniqueResumeName = resumeName;
      
      // If the name already exists, make it unique by adding a number
      if (existingNames.includes(resumeName)) {
        let counter = 1;
        while (existingNames.includes(`${resumeName} (${counter})`)) {
          counter++;
        }
        uniqueResumeName = `${resumeName} (${counter})`;
        console.log('[UPLOAD API] Made resume name unique:', { original: resumeName, unique: uniqueResumeName });
      }
      
      // Only update this specific file's name, not all files
      const updatedResumeNames = {
        ...currentResumeNames,
        [fileKey]: uniqueResumeName
      };
      
      // Log what's being saved to help debug
      console.log('[UPLOAD API] Current resume names:', currentResumeNames);
      console.log('[UPLOAD API] Updated resume names:', updatedResumeNames);
      
      resumeNamesUpdate = { resumeNames: updatedResumeNames };
      console.log('[UPLOAD API] Saving resumeName:', { [fileKey]: uniqueResumeName });
    }
    // Update targetedResumes
    if (typeof isTargeted === 'boolean') {
      // If this is a targeted resume, we need to make sure it's the only targeted one
      let updatedTargeted: Record<string, boolean> = {};
      
      if (isTargeted) {
        // Create a new object with all resumes set to false
        Object.keys(currentTargeted).forEach(key => {
          updatedTargeted[key] = false;
        });
        // Then set only the current resume to true
        updatedTargeted[fileKey] = true;
        console.log('[UPLOAD API] Setting as the only targeted resume:', fileKey);
      } else {
        // If not targeted, just update this one resume
        updatedTargeted = {
          ...currentTargeted,
          [fileKey]: false
        };
      }
      
      targetedUpdate = { targetedResumes: updatedTargeted };
      console.log('[UPLOAD API] Updated targeted resumes:', updatedTargeted);
    }
    await db.collection('users').doc(userEmail).set({ 
      resumeUrl: url,
      resumeUploadTimestamp: new Date().toISOString(),
      ...resumeNamesUpdate,
      ...targetedUpdate
    }, { merge: true });
    
    // If user had a previous resume, mark that we need to clear old data
    if (hadPreviousResume) {
      console.log('[UPLOAD API] User had a previous resume, marking for data replacement');
      await db.collection('users').doc(userEmail).set({ 
        shouldReplaceProfileData: true 
      }, { merge: true });
    }

    // --- Parse PDF with GPT-4 after upload ---
    let parsedResumeUrl = null;
    let parsedResumeError = null;
    try {
      // Cloud Run Python microservice solution: send storage path to service, let it parse and save JSON
      const parsedFilePath = `parsed_resume/${userEmail}/${Date.now()}_${file.name}.json`;
      const cloudRunUrl = 'https://resume-parser-84814621060.us-central1.run.app/parse-resume';
      const response = await fetch(cloudRunUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebase_pdf_path: filePath, // the path in Firebase Storage
          parsed_json_path: parsedFilePath // where to save the parsed JSON
        })
      });
      const result = await response.json();
      if (result.status !== 'success') throw new Error('Python API failed: ' + JSON.stringify(result));
      // Get signed URL for parsed resume
      const parsedStorageFile = bucket.file(parsedFilePath);
      const [parsedUrl] = await parsedStorageFile.getSignedUrl({
        action: 'read',
        expires: Date.now() + 365 * 24 * 60 * 60 * 1000
      });
      parsedResumeUrl = parsedUrl;
      // SINGLE SOURCE OF TRUTH: Store parsed resume data ONLY in the parsedResumes collection
      console.log('[UPLOAD API] Writing parsed resume for:', userEmail);
      console.log('[UPLOAD API] Storing parsed resume data in parsedResumes collection');
      
      // Create a unique identifier for this resume upload
      const resumeId = `${userEmail}_${Date.now()}`;
      
      // Store the complete parsed resume data in the parsedResumes collection only
      await db.collection('parsedResumes').doc(userEmail).set({
        parsedResumeUrl: parsedResumeUrl,
        parsedResumeData: result.parsed !== undefined ? result.parsed : null,
        parsedResumeTimestamp: new Date().toISOString(),
        resumeId: resumeId,
        userEmail: userEmail // Store user email for verification
      }, { merge: false }); // Use merge: false to completely replace any existing data
      console.log('[UPLOAD API] Write to parsedResumes complete.');
      
      // Get user document reference
      const userDocRef = db.collection('users').doc(userEmail);
      const userDoc = await userDocRef.get();
      
      // Update the user document with ONLY a reference to the parsed resume
      // Do NOT duplicate the actual resume data here
      if (userDoc.exists) {
        console.log('[UPLOAD API] Updating user document with reference to parsed resume');
        await userDocRef.set({
          // Store only essential user information
          email: userEmail,
          lastUpdated: new Date().toISOString(),
          
          // ONLY store a reference to the parsed resume, not the data itself
          parsedResumeReference: {
            collectionPath: 'parsedResumes',
            documentId: userEmail,
            resumeId: resumeId,
            timestamp: new Date().toISOString()
          },
          
          // Control flags for frontend
          ignoreLocalStorage: true,
          forceRefreshData: true,
          dataResetAt: new Date().toISOString()
        }, { merge: false }); // Use merge: false to completely replace the document
        
        console.log('[UPLOAD API] User document updated with reference to parsed resume');
      }
    } catch (parseError) {
      console.error('[UPLOAD API] Error parsing/saving resume with Python Cloud Run:', parseError);
      parsedResumeError = parseError instanceof Error ? parseError.message : String(parseError);
    }
    // Respond with both URLs and error if any
    return NextResponse.json({
      resumeUrl: url,
      parsedResumeUrl,
      parsedResumeError,
      success: true
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload resume' },
      { status: 500 }
    );
  }
}
