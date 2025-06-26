import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';

export async function POST(req: Request) {
  try {
    console.log('Received request to update projects');
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('No session or email found');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Request body:', JSON.stringify(body));
    const { resumeId, Projects } = body;

    if (!resumeId) {
      console.log('No resumeId provided');
      return NextResponse.json({ success: false, error: 'Resume ID is required' }, { status: 400 });
    }

    if (!Projects || !Array.isArray(Projects)) {
      console.log('Projects is not an array:', Projects);
      return NextResponse.json({ success: false, error: 'Projects data is required and must be an array' }, { status: 400 });
    }
    
    console.log('Projects data to save:', JSON.stringify(Projects));

    console.log(`Updating projects for resumeId: ${resumeId}`);
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

    // Update the Projects array within the parsed data
    parsedData['Projects'] = Projects;

    // Update the entire parsedResumeData field
    await resumeRef.update({
      parsedResumeData: parsedData
    });

    console.log('Successfully updated Projects in Firestore.');

    return NextResponse.json({ 
      success: true, 
      projects: Projects
    });
  } catch (error) {
    console.error('Error updating projects:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update projects: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
