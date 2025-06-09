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
    
    // Delete the raw resume file
    const rawFilePath = `raw_resume/${userEmail}/${name}`;
    const rawFile = bucket.file(rawFilePath);
    console.log(`[RESUME DELETE API] Deleting raw resume: ${rawFilePath}`);
    await rawFile.delete().catch(err => {
      console.error(`[RESUME DELETE API] Error deleting raw resume: ${rawFilePath}`, err);
      // Continue even if there's an error deleting the raw file
    });
    
    // Extract the base name of the resume (without timestamp and extension)
    const baseNameMatch = name.match(/\d+_(.+)\.pdf$/);
    const baseName = baseNameMatch ? baseNameMatch[1] : null;
    console.log(`[RESUME DELETE API] Extracted base name: ${baseName}`);
    
    if (baseName) {
      // List all files in both possible directories to find matching JSON files
      console.log(`[RESUME DELETE API] Looking for JSON files with base name: ${baseName}`);
      
      // Get all files from parsed_resume directory
      const [parsedFiles] = await bucket.getFiles({
        prefix: `parsed_resume/${userEmail}/`
      }).catch(() => [[]]);
      
      // Get all files from raw_resume directory
      const [rawFiles] = await bucket.getFiles({
        prefix: `raw_resume/${userEmail}/`
      }).catch(() => [[]]);
      
      // Combine all files
      const allFiles = [...parsedFiles, ...rawFiles];
      
      // Find JSON files that match the base name
      const matchingJsonFiles = allFiles.filter(file => {
        const fileName = file.name;
        return fileName.endsWith('.json') && fileName.includes(baseName);
      });
      
      console.log(`[RESUME DELETE API] Found ${matchingJsonFiles.length} matching JSON files:`, 
                 matchingJsonFiles.map(f => f.name));
      
      // Delete all matching JSON files
      const deletePromises = matchingJsonFiles.map(async (file) => {
        console.log(`[RESUME DELETE API] Deleting parsed JSON: ${file.name}`);
        return file.delete().catch(err => {
          console.error(`[RESUME DELETE API] Error deleting parsed JSON: ${file.name}`, err);
          // Continue even if there's an error
        });
      });
      
      // Wait for all delete operations to complete
      await Promise.all(deletePromises);
    } else {
      console.log(`[RESUME DELETE API] Could not extract base name from: ${name}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[RESUME DELETE API] Error:', error);
    return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 });
  }
}
