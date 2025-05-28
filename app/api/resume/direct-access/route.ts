import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';
import { storage } from '@/lib/firebase-storage';

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      console.error('[DIRECT-ACCESS API] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userEmail = session.user.email;
    console.log(`[DIRECT-ACCESS API] Authenticated user: ${userEmail}`);
    let checkedLocations: string[] = [];

    // 1. Check Firebase Storage direct path
    try {
      const bucket = storage.bucket();
      const filePath = `raw_resume/${userEmail}`;
      const file = bucket.file(filePath);
      const [exists] = await file.exists();
      checkedLocations.push(`storage: ${filePath} exists=${exists}`);
      if (exists) {
        const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 60 * 60 * 1000 });
        return NextResponse.json({ resumeUrl: signedUrl, source: 'direct-storage', userEmail });
      }
    } catch (error) {
      console.error('[DIRECT-ACCESS API] Error checking storage:', error);
    }

    // 2. Check uploads collection
    try {
      const uploadsDoc = await db.collection('uploads').doc(userEmail).get();
      if (uploadsDoc.exists) {
        const uploadsData = uploadsDoc.data();
        const gsUri = uploadsData?.resumeUrl || uploadsData?.rawResumeUrl || uploadsData?.url;
        checkedLocations.push(`uploads: ${gsUri}`);
        if (gsUri && gsUri.startsWith('gs://')) {
          const match = gsUri.match(/^gs:\/\/([^\/]+)\/(.+)$/);
          if (match) {
            const bucketName = match[1];
            const filePath = match[2];
            const bucket = storage.bucket(bucketName);
            const file = bucket.file(filePath);
            const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 60 * 60 * 1000 });
            return NextResponse.json({ resumeUrl: signedUrl, source: 'uploads-collection', userEmail });
          }
        }
      } else {
        checkedLocations.push('uploads: not found');
      }
    } catch (error) {
      console.error('[DIRECT-ACCESS API] Error checking uploads collection:', error);
    }

    // 3. Check users collection
    try {
      const userDoc = await db.collection('users').doc(userEmail).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const gsUri = userData?.resumeUrl || userData?.rawResumeUrl;
        checkedLocations.push(`users: ${gsUri}`);
        if (gsUri && gsUri.startsWith('gs://')) {
          const match = gsUri.match(/^gs:\/\/([^\/]+)\/(.+)$/);
          if (match) {
            const bucketName = match[1];
            const filePath = match[2];
            const bucket = storage.bucket(bucketName);
            const file = bucket.file(filePath);
            const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 60 * 60 * 1000 });
            return NextResponse.json({ resumeUrl: signedUrl, source: 'users-collection', userEmail });
          }
        }
      } else {
        checkedLocations.push('users: not found');
      }
    } catch (error) {
      console.error('[DIRECT-ACCESS API] Error checking users collection:', error);
    }

    // 4. Try known URI pattern
    try {
      const knownUri = `gs://talexus-4339c.firebasestorage.app/raw_resume/${userEmail}`;
      checkedLocations.push(`knownUri: ${knownUri}`);
      const match = knownUri.match(/^gs:\/\/([^\/]+)\/(.+)$/);
      if (match) {
        const bucketName = match[1];
        const filePath = match[2];
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(filePath);
        const [exists] = await file.exists();
        if (exists) {
          const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 60 * 60 * 1000 });
          return NextResponse.json({ resumeUrl: signedUrl, source: 'known-uri', userEmail });
        }
      }
    } catch (error) {
      console.error('[DIRECT-ACCESS API] Error checking known URI:', error);
    }

    // Not found
    console.error(`[DIRECT-ACCESS API] No resume found for user: ${userEmail}. Checked:`, checkedLocations);
    return NextResponse.json({ error: 'No resume found', checkedLocations }, { status: 404 });
  } catch (error) {
    console.error('[DIRECT-ACCESS API] Error retrieving resume:', error);
    return NextResponse.json({ error: 'Failed to retrieve resume' }, { status: 500 });
  }
}

