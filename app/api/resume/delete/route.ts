import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { storage } from '@/lib/firebase-storage';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userEmail = session.user.email;
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Missing resume name' }, { status: 400 });
    }
    
    console.log('[RESUME DELETE API] Attempting to delete file:', name);
    
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || 'talexus-4339c.appspot.com';
    const bucket = storage.bucket(bucketName);
    
    // If name already includes the prefix, use it as is, otherwise add the prefix
    const filePath = name.includes(`raw_resume/${userEmail}/`) 
      ? name 
      : `raw_resume/${userEmail}/${name}`;
    
    console.log('[RESUME DELETE API] Full file path:', filePath);
    
    try {
      const file = bucket.file(filePath);
      const [exists] = await file.exists();
      
      if (!exists) {
        console.error('[RESUME DELETE API] File not found:', filePath);
        return NextResponse.json({ error: 'Resume file not found' }, { status: 404 });
      }
      
      await file.delete();
      console.log('[RESUME DELETE API] Successfully deleted file:', filePath);
      return NextResponse.json({ success: true });
    } catch (deleteError) {
      console.error('[RESUME DELETE API] Error deleting file:', deleteError);
      return NextResponse.json({ 
        error: 'Failed to delete resume file', 
        details: deleteError instanceof Error ? deleteError.message : String(deleteError)
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[RESUME DELETE API] Error:', error);
    return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 });
  }
}
