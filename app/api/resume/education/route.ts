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

    console.log(`Fetching education data for resumeId: ${resumeId}`);
    const resumeRef = db.collection('parsed_resumes').doc(session.user.email).collection('resumes').doc(resumeId);
    const resumeDoc = await resumeRef.get();

    if (!resumeDoc.exists) {
      console.log('Resume document not found.');
      return NextResponse.json({ success: false, error: 'Resume not found' }, { status: 404 });
    }

    const resumeData = resumeDoc.data() || {};
    console.log('DEBUG API: Raw resumeData from Firestore:', JSON.stringify(resumeData, null, 2));
    
    // Log all top-level keys in the resumeData
    console.log('DEBUG API: Top-level keys in resumeData:', Object.keys(resumeData));

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
    
    // Check specifically for education data
    if (parsedData.Education) {
      console.log('DEBUG API: Education data found:', JSON.stringify(parsedData.Education, null, 2));
    } else if (parsedData.education) {
      console.log('DEBUG API: education data found (lowercase):', JSON.stringify(parsedData.education, null, 2));
    } else {
      console.log('DEBUG API: No education data found in parsed resume data');
      
      // Look for education data in other possible locations
      const possibleKeys = Object.keys(parsedData).filter(key => 
        key.toLowerCase().includes('education') || 
        key.toLowerCase().includes('school') || 
        key.toLowerCase().includes('academic'));
      
      if (possibleKeys.length > 0) {
        console.log('DEBUG API: Possible education-related keys:', possibleKeys);
        possibleKeys.forEach(key => {
          console.log(`DEBUG API: Content of ${key}:`, JSON.stringify(parsedData[key], null, 2));
        });
      }
    }

    // Return the entire parsed data object
    return NextResponse.json(parsedData);

  } catch (error) {
    console.error('Error fetching education data:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch education data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { resumeId, Education } = await req.json();

    if (!resumeId) {
      return NextResponse.json({ success: false, error: 'Resume ID is required' }, { status: 400 });
    }

    console.log(`Updating education data for resumeId: ${resumeId}`, Education);
    
    const resumeRef = db.collection('parsed_resumes').doc(session.user.email).collection('resumes').doc(resumeId);
    const resumeDoc = await resumeRef.get();

    if (!resumeDoc.exists) {
      return NextResponse.json({ success: false, error: 'Resume not found' }, { status: 404 });
    }

    const resumeData = resumeDoc.data() || {};
    let parsedData = resumeData.parsedResumeData || {};

    if (typeof parsedData === 'string') {
      try {
        parsedData = JSON.parse(parsedData);
      } catch (e) {
        console.error('Failed to parse parsedResumeData string:', e);
        parsedData = {};
      }
    }

    // Update the Education field in the parsed data
    parsedData.Education = Education;

    // Save the updated parsed data back to Firestore
    await resumeRef.update({
      parsedResumeData: parsedData,
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating education data:', error);
    return NextResponse.json({ success: false, error: 'Failed to update education data' }, { status: 500 });
  }
}
