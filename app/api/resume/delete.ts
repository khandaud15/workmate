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
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || 'talexus-4339c.appspot.com';
    const bucket = storage.bucket(bucketName);
    const filePath = `raw_resume/${userEmail}/${name}`;
    const file = bucket.file(filePath);
    await file.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[RESUME DELETE API] Error:', error);
    return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 });
  }
}
