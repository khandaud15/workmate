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
    
    // Extract timestamp from filename if present (this is the actual document ID in Firestore)
    const timestampMatch = resumeId.match(/^(\d+)/);
    const timestamp = timestampMatch ? timestampMatch[1] : null;
    
    console.log(`[PROJECTS API] Extracted timestamp from resumeId: ${timestamp || 'none'} (from ${resumeId})`);
    
    // First try to get the resume directly by the timestamp (which is the document ID in Firestore)
    let resumeDoc;
    if (timestamp) {
      console.log(`[PROJECTS API] Trying to find resume by timestamp ID: ${timestamp}`);
      const timestampRef = db.collection('parsed_resumes').doc(session.user.email).collection('resumes').doc(timestamp);
      resumeDoc = await timestampRef.get();
      if (resumeDoc.exists) {
        console.log(`[PROJECTS API] Found resume by timestamp ID: ${timestamp}`);
      }
    }
    
    // If not found by timestamp, try the full ID
    if (!resumeDoc || !resumeDoc.exists) {
      console.log(`[PROJECTS API] Trying to find resume by full ID: ${resumeId}`);
      const resumeRef = db.collection('parsed_resumes').doc(session.user.email).collection('resumes').doc(resumeId);
      resumeDoc = await resumeRef.get();
    }

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
    console.log('Received POST request to update projects');
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('No session or email found');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get('resumeId');

    if (!resumeId) {
      console.log('No resumeId provided in URL params');
      return NextResponse.json({ success: false, error: 'Resume ID is required' }, { status: 400 });
    }

    const body = await req.json();
    console.log('Request body:', JSON.stringify(body));
    const { Projects } = body;

    if (!Projects || !Array.isArray(Projects)) {
      console.log('Projects is not an array:', Projects);
      return NextResponse.json({ success: false, error: 'Projects data is required and must be an array' }, { status: 400 });
    }
    
    console.log('Projects data to save:', JSON.stringify(Projects));
    console.log(`Updating projects for resumeId: ${resumeId}`);
    
    // Use the same path as in the GET method
    const resumeRef = db.collection('parsed_resumes').doc(session.user.email).collection('resumes').doc(resumeId);
    const resumeDoc = await resumeRef.get();

    if (!resumeDoc.exists) {
      console.log('Resume document not found.');
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
    console.log('Updated parsedData:', JSON.stringify(parsedData));

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
