import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';
import { normalizeResumeId } from '@/app/middleware/resumeIdNormalizer';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let resumeId = searchParams.get('resumeId');

    if (!resumeId) {
      return NextResponse.json({ success: false, error: 'Resume ID is required' }, { status: 400 });
    }

    // Normalize the resumeId to ensure consistent handling
    resumeId = normalizeResumeId(resumeId);
    console.log(`[PROJECTS API] Fetching data for normalized resumeId: ${resumeId}`);
    
    // Since we've already normalized the resumeId, we can use it directly as the document ID
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
    console.log('Received POST request to update projects');
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('No session or email found');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let resumeId = searchParams.get('resumeId');

    if (!resumeId) {
      console.log('No resumeId provided in URL params');
      return NextResponse.json({ success: false, error: 'Resume ID is required' }, { status: 400 });
    }
    
    // Normalize the resumeId to ensure consistent handling
    resumeId = normalizeResumeId(resumeId);

    const body = await req.json();
    console.log('Request body:', JSON.stringify(body));
    const { Projects } = body;

    if (!Projects || !Array.isArray(Projects)) {
      console.log('Projects is not an array:', Projects);
      return NextResponse.json({ success: false, error: 'Projects data is required and must be an array' }, { status: 400 });
    }
    
    console.log('Projects data to save:', JSON.stringify(Projects));
    console.log(`Updating projects for normalized resumeId: ${resumeId}`);
    
    // Use the normalized resumeId directly as the document ID
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
