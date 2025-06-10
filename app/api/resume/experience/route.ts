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
    const resumeRef = db.collection('parsed_resumes').doc(session.user.email).collection('resumes').doc(resumeId);
    const resumeDoc = await resumeRef.get();

    if (!resumeDoc.exists) {
      console.log('Resume document not found.');
      return NextResponse.json({ success: false, error: 'Resume not found' }, { status: 404 });
    }

    const resumeData = resumeDoc.data() || {};
    console.log('DEBUG API: Raw resumeData from Firestore:', JSON.stringify(resumeData, null, 2));

    let parsedData = resumeData.parsedResumeData || {};

    if (typeof parsedData === 'string') {
      try {
        parsedData = JSON.parse(parsedData);
      } catch (e) {
        console.error('Failed to parse parsedResumeData string:', e);
        parsedData = {}; // Reset if parsing fails
      }
    }

    console.log('DEBUG API: Final parsedData being sent to client:', JSON.stringify(parsedData, null, 2));

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

export async function POST(req: Request) {
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

    const body = await req.json();
    const { experiences } = body;

    if (!experiences) {
      return NextResponse.json({ success: false, error: 'Experiences data is required' }, { status: 400 });
    }

    const resumeRef = db.collection('parsed_resumes').doc(session.user.email).collection('resumes').doc(resumeId);

    // We need to update the 'Work Experience' field within the 'parsedResumeData' object.
    await resumeRef.update({
      'parsedResumeData.Work Experience': experiences
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error saving resume data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save resume data' },
      { status: 500 }
    );
  }
}
