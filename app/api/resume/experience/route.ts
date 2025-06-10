import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get('resumeId');

    if (!resumeId) {
      return NextResponse.json({ success: false, error: 'Resume ID is required' }, { status: 400 });
    }

    console.log(`Fetching data for resumeId: ${resumeId}`);
    const resumeRef = db.doc(`parsed_resume/${session.user.email}/${resumeId}`);
    const resumeDoc = await resumeRef.get();

    if (!resumeDoc.exists) {
      console.log('Resume document not found.');
      return NextResponse.json({ success: false, error: 'Resume not found' }, { status: 404 });
    }

    const resumeData = resumeDoc.data() || {};
    let parsedData = resumeData.parsedResumeData || {};

    if (typeof parsedData === 'string') {
      try {
        parsedData = JSON.parse(parsedData);
      } catch (e) {
        console.error('Failed to parse parsedResumeData string:', e);
        parsedData = {}; // Reset if parsing fails
      }
    }

    // Return the entire parsed data object
    return NextResponse.json(parsedData);

  } catch (error) {
    console.error('Error fetching resume data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resume data' },
      { status: 500 }
    );
  }
}
