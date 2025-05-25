import { NextResponse } from 'next/server';
import { storage } from '@/lib/firebase-storage';
import { db } from '@/lib/firebase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

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
    console.log('[UPLOAD API] Got form data');

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
    await db.collection('users').doc(userEmail).set({ resumeUrl: url }, { merge: true });

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
      // Store parsed resume URL in Firestore
      await db.collection('users').doc(userEmail).set({ parsedResumeUrl }, { merge: true });
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
