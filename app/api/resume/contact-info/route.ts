import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    const url = new URL(req.url);
    const resumeId = url.searchParams.get('id');
    
    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }
    
    console.log(`Fetching contact info for resume ${resumeId} for user ${userEmail}`);

    // Get user doc reference
    const userRef = db.collection('users').doc(userEmail);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userData = userDoc.data() || {};
    
    // Check if contact info exists for this resume
    let contactInfo = null;
    
    if (userData.resumeContactInfo && userData.resumeContactInfo[resumeId]) {
      contactInfo = userData.resumeContactInfo[resumeId];
    } else {
      // If no contact info saved yet, try to get parsed data from resume
      const resumesData = userData.resumes || {};
      const resumeData = resumesData[resumeId];
      
      if (resumeData && resumeData.parsedData) {
        // Extract contact info from parsed resume data
        contactInfo = {
          fullName: resumeData.parsedData.name || '',
          emailAddress: resumeData.parsedData.email || '',
          phoneNumber: resumeData.parsedData.phone || '',
          linkedinUrl: resumeData.parsedData.linkedin || '',
          personalWebsite: resumeData.parsedData.website || '',
          country: 'USA',
          state: resumeData.parsedData.state || 'IL',
          city: resumeData.parsedData.city || 'Chicago',
          showCountry: true,
          showState: true,
          showCity: true
        };
      } else {
        // Default empty contact info
        contactInfo = {
          fullName: '',
          emailAddress: '',
          phoneNumber: '',
          linkedinUrl: '',
          personalWebsite: '',
          country: 'USA',
          state: 'IL',
          city: 'Chicago',
          showCountry: true,
          showState: true,
          showCity: true
        };
      }
    }

    return NextResponse.json({ contactInfo });
  } catch (error: any) {
    console.error('Error fetching contact info:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch contact info' }, { status: 500 });
  }
}