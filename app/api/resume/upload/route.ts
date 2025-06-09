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
  
  // Define variables in the outer scope so they're available throughout the function
  let userEmail: string;
  let timestamp: number = 0; // Initialize with a default value
  
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
    
    // Get the resume name from the form input
    console.log('[UPLOAD API] Resume name from form:', resumeName);
    
    // Use resumeName from the form input as the base for the filename
    let baseFileName;
    if (resumeName && resumeName.trim() !== '') {
      // Convert resumeName to a valid filename format (replace spaces with underscores)
      baseFileName = resumeName.trim().replace(/\s+/g, '_');
      console.log('[UPLOAD API] Using custom name:', baseFileName);
    } else {
      // If no resumeName provided, use original filename without extension
      baseFileName = file.name.replace(/\.[^/.]+$/, '');
      console.log('[UPLOAD API] Using original filename:', baseFileName);
    }
    
    // Add a timestamp at the beginning to ensure uniqueness and prevent overwriting
    // This timestamp will be used for both the filename and the document ID
    timestamp = Date.now(); // Assign to outer scope variable
    const resumeId = timestamp.toString();
    const fileName = `${resumeId}_${baseFileName}.pdf`;
    
    // Create the file path with the unique filename
    const filePath = `raw_resume/${userEmail}/${fileName}`;
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

    // We already created the resumeId from the timestamp above
    
    // Create resume document data
    const resumeData = {
      rawResumeUrl: url,
      rawResumePath: filePath,
      uploadTimestamp: new Date(timestamp), // Use the timestamp we defined earlier
      displayName: resumeName || file.name.replace(/\.[^/.]+$/, ''),
      isTargeted: isTargeted || false,
      status: 'uploaded', // Can be: uploaded, parsing, parsed, error
      parsedResumeData: null, // Will be set after GPT parsing
      parsedResumeUrl: null, // Will be set after parsing and saving JSON
      parsedResumeTimestamp: null // Will be set after parsing
    };

    // Store in parsed_resumes collection under user's email
    await db.collection('parsed_resumes').doc(userEmail).collection('resumes').doc(resumeId).set(resumeData);
    console.log('[UPLOAD API] Saved resume document:', { userEmail, resumeId });

    // If this is a targeted resume, update other resumes to be non-targeted
    if (isTargeted) {
      const userResumesRef = db.collection('parsed_resumes').doc(userEmail).collection('resumes');
      const q = userResumesRef
        .where('isTargeted', '==', true)
        .where('__name__', '!=', resumeId);

      const querySnapshot = await q.get();
      const batch = db.batch();

      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, { isTargeted: false });
      });

      await batch.commit();
      console.log('[UPLOAD API] Updated other resumes to non-targeted');
    }

    // Return success response with resume info
    const response = {
      success: true,
      resumeId,
      resumeUrl: url,
      displayName: resumeData.displayName,
      isTargeted: resumeData.isTargeted,
      message: 'Resume uploaded successfully'
    };

    // --- Parse PDF with GPT-4 after upload ---
    try {
      // Cloud Run Python microservice solution: send storage path to service, let it parse and save JSON
      // Use the same filename for parsed JSON as the raw resume, just add .json extension
      const parsedFilePath = `parsed_resume/${userEmail}/${fileName}.json`;
      console.log('[UPLOAD API] Raw resume path:', filePath);
      console.log('[UPLOAD API] Parsed resume path:', parsedFilePath);
      
      // Update status to parsing
      const resumeRef = db.collection('parsed_resumes').doc(userEmail).collection('resumes').doc(resumeId);
      await resumeRef.update({
        status: 'parsing'
      });

      const cloudRunUrl = 'https://resume-parser-84814621060.us-central1.run.app/parse-resume';
      const parseResponse = await fetch(cloudRunUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebase_pdf_path: filePath,
          parsed_json_path: parsedFilePath
        })
      });
      
      const result = await parseResponse.json();
      if (result.status !== 'success') {
        throw new Error('Python API failed: ' + JSON.stringify(result));
      }
      
      // Get signed URL for parsed resume JSON
      const parsedStorageFile = bucket.file(parsedFilePath);
      const [parsedUrl] = await parsedStorageFile.getSignedUrl({
        action: 'read',
        expires: Date.now() + 365 * 24 * 60 * 60 * 1000
      });

      // Update parsed_resumes document with parsed data
      await resumeRef.update({
        status: 'parsed',
        parsedResumeData: result.parsed || null,
        parsedResumeUrl: parsedUrl,
        parsedResumeTimestamp: new Date()
      });
      
      console.log('[UPLOAD API] Successfully parsed and stored resume data');
      return NextResponse.json({
        ...response,
        parsedResumeUrl: parsedUrl,
        success: true
      });
    } catch (error) {
      console.error('[UPLOAD API] Error parsing resume:', error);
      
      // Update status to error
      const resumeRef = db.collection('parsed_resumes').doc(userEmail).collection('resumes').doc(resumeId);
      await resumeRef.update({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to parse resume'
      });
      
      return NextResponse.json({
        ...response,
        parsedResumeUrl: null,
        parsedResumeError: error instanceof Error ? error.message : 'Failed to parse resume',
        success: false
      });
    }
  } catch (error) {
    console.error('Error uploading resume:', error);
    // We don't need to check for resumeId existence since we're not using a variable from outer scope anymore
    // If we got far enough to have userEmail, we might have created a document that needs updating
    if (userEmail && timestamp) {
      const errorResumeId = timestamp.toString();
      try {
        await db.collection('parsed_resumes').doc(userEmail).collection('resumes').doc(errorResumeId).update({
          status: 'error',
          error: error instanceof Error ? error.message : 'Failed to upload or parse resume'
        });
      } catch (updateError) {
        console.error('Failed to update resume status:', updateError);
      }
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload resume' },
      { status: 500 }
    );
  }
}
