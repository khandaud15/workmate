import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { resumeId } = body;
    const workExperience = body['Work Experience'];

    if (!resumeId) {
      return NextResponse.json({ success: false, error: 'Resume ID is required' }, { status: 400 });
    }

    if (!workExperience) {
      return NextResponse.json({ success: false, error: 'Work Experience data is required' }, { status: 400 });
    }

    console.log(`Updating experiences for resumeId: ${resumeId}`);
    const resumeRef = db.doc(`parsed_resume/${session.user.email}/${resumeId}`);
    const resumeDoc = await resumeRef.get();

    if (!resumeDoc.exists) {
      return NextResponse.json({ success: false, error: 'Resume not found' }, { status: 404 });
    }

    // Get existing data
    const resumeData = resumeDoc.data() || {};
    let parsedData = resumeData.parsedResumeData || {};

    // If parsedResumeData is a string, parse it
    if (typeof parsedData === 'string') {
      try {
        parsedData = JSON.parse(parsedData);
      } catch (e) {
        console.error('Failed to parse parsedResumeData string on update:', e);
        parsedData = {}; // Reset if parsing fails
      }
    }

    // Update the Work Experience array within the parsed data
    parsedData['Work Experience'] = workExperience;

    // Update the entire parsedResumeData field
    await resumeRef.update({
      parsedResumeData: parsedData
    });

    console.log('Successfully updated Work Experience in Firestore.');

    return NextResponse.json({ 
      success: true, 
      experiences: workExperience
    });
  } catch (error) {
    console.error('Error updating experience:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update experience' },
      { status: 500 }
    );
  }
}
