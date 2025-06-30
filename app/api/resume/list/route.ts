import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/firebase';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { storage } from '@/lib/firebase-storage';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userEmail = session.user.email;
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || 'talexus-4339c.appspot.com';
    const bucket = storage.bucket(bucketName);
    const prefix = `raw_resume/${userEmail}/`;
    // List all files in the user's raw_resume folder
    const [files] = await bucket.getFiles({ prefix });
    if (!files || files.length === 0) {
      return NextResponse.json({ resumes: [] });
    }
    // Sort by creation time (newest first)
    files.sort((a, b) => {
      const aCreated = a.metadata?.timeCreated ? new Date(a.metadata.timeCreated).getTime() : 0;
      const bCreated = b.metadata?.timeCreated ? new Date(b.metadata.timeCreated).getTime() : 0;
      return bCreated - aCreated;
    });
    // Fetch user's custom resume name if available
    const userDoc = await db.collection('users').doc(userEmail).get();
    const userData: any = userDoc && userDoc.exists && typeof userDoc.data === 'function' ? userDoc.data() : {};
    const customResumeNames = (userData && userData.resumeNames) ? userData.resumeNames : {};
    const targetedResumes = (userData && userData.targetedResumes) ? userData.targetedResumes : {};
    
    console.log('[LIST API] User data:', {
      email: userEmail,
      customResumeNames,
      targetedResumes
    });

    // Get parsed resumes from Firestore
    const parsedResumesRef = db.collection('parsed_resumes').doc(userEmail).collection('resumes');
    const parsedResumesSnapshot = await parsedResumesRef.get();
    const parsedResumes = new Map();
    
    parsedResumesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === 'parsed') {
        // Store the document ID as the parsed resume ID
        const docId = doc.id;
        
        // Map various fields to this document ID
        const fieldsToMap = [
          'originalFileName', 
          'fullFileName', 
          'storageName',
          'name'
        ];
        
        // Add all possible mappings
        fieldsToMap.forEach(field => {
          if (data[field]) {
            parsedResumes.set(data[field], docId);
            console.log(`[LIST API] Mapping ${field} '${data[field]}' to parsed resume ID: ${docId}`);
          }
        });
        
        // Also map the document ID to itself to allow direct ID usage
        parsedResumes.set(docId, docId);
        
        // If we have filenames with timestamps, also map the raw filename without timestamp
        if (data.fullFileName) {
          const match = data.fullFileName.match(/^\d+_(.*)$/);
          if (match && match[1]) {
            parsedResumes.set(match[1], docId);
            console.log(`[LIST API] Mapping cleaned filename '${match[1]}' to parsed resume ID: ${docId}`);
          }
        }
      }
    });
    
    console.log('[LIST API] Resume ID mapping:', {
      parsedResumes: Object.fromEntries(parsedResumes),
      parsedResumeCount: parsedResumes.size
    });

    console.log('[LIST API] Found parsed resumes:', Array.from(parsedResumes.entries()));

    // Build resume list with signed URLs and metadata
    console.log('[LIST API] Building resume list with parsed IDs:', {
      fileCount: files.length,
      parsedResumeCount: parsedResumes.size,
      parsedResumeIds: Array.from(parsedResumes.values())
    });

    const resumes = await Promise.all(
      files.map(async (file) => {
        const [signedUrl] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 60 * 60 * 1000 // 1 hour
        });
        // Extract clean filename by removing prefix and timestamp pattern
        let fileName = file.name.replace(prefix, '');
        // Remove timestamp pattern (e.g., 1748727806656_) from the beginning of filenames
        fileName = fileName.replace(/^\d+_/, '');
        console.log('[RESUME LIST API] Processing file:', { originalName: file.name, cleanedName: fileName });
        // Only use the full filename (with timestamp) as the key for custom names
        const fullFileName = file.name.replace(prefix, '');
        const displayName = customResumeNames[fullFileName] || fileName;
        
        // Check if this resume is targeted - convert string 'true' to boolean true if needed
        let isTargeted = false;
        
        // First check with the full filename (with timestamp)
        if (targetedResumes && fullFileName in targetedResumes) {
          const targetValue = targetedResumes[fullFileName];
          isTargeted = targetValue === true || targetValue === 'true';
        }
        
        console.log(`[RESUME LIST API] Resume ${fullFileName} targeted status:`, {
          hasTargetedKey: targetedResumes && fullFileName in targetedResumes,
          targetedValue: targetedResumes ? targetedResumes[fullFileName] : null,
          finalIsTargeted: isTargeted
        });
        
        console.log('[RESUME LIST API] Name resolution:', { 
          fullFileName, 
          cleanedFileName: fileName, 
          customNames: Object.keys(customResumeNames), 
          resolved: displayName,
          isTargeted: isTargeted,
          targetedValue: targetedResumes ? targetedResumes[fullFileName] : 'no data',
          targetedResumesKeys: targetedResumes ? Object.keys(targetedResumes) : [],
          targetedResumesValues: targetedResumes ? Object.values(targetedResumes) : []
        });
        
        // Get the parsed resume ID for this file using multiple keys
        const parsedResumeId = parsedResumes.get(fullFileName) || parsedResumes.get(fileName) || parsedResumes.get(file.name) || null;
        console.log(`[LIST API] Resume ${fullFileName} parsed ID:`, parsedResumeId);

        // Ensure isTargeted is a boolean, not a string
        return {
          name: displayName, // for UI display
          storageName: fullFileName, // actual storage file name (with timestamp)
          isTargeted: Boolean(isTargeted), // force conversion to boolean
          url: signedUrl,
          createdAt: file.metadata?.timeCreated,
          updatedAt: file.metadata?.updated || file.metadata?.timeCreated,
          size: file.metadata?.size,
          contentType: file.metadata?.contentType,
          parsedResumeId // Include the parsed resume ID
        };
      })
    );
    return NextResponse.json({ resumes });
  } catch (error) {
    console.error('[RESUME LIST API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch resume list', resumes: [] }, { status: 500 });
  }
}
