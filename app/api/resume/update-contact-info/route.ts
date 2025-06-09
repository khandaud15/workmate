import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    const { resumeId, contactInfo } = await req.json();
    
    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }
    
    console.log(`Updating contact info for resume ${resumeId} for user ${userEmail}`, { 
      resumeId, 
      userEmail,
      contactInfo
    });

    // Get reference to the resume document in parsed_resumes collection
    const resumeRef = db.collection('parsed_resumes')
      .doc(userEmail)
      .collection('resumes')
      .doc(resumeId);
    
    const resumeDoc = await resumeRef.get();
    
    if (!resumeDoc.exists) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    console.log('DEBUG: Received contactInfo from frontend:', JSON.stringify(contactInfo, null, 2));
    
    // Get the current document data
    const currentData = resumeDoc.data();
    const existingParsedData = currentData?.parsedResumeData || {};

    // Create update object with only the contact info fields
    // Add null checks for all fields to prevent undefined values
    // Note: Country field has been removed from the form
    const contactInfoUpdate: Record<string, string | null> = {
      'Full Name': contactInfo.fullName || null,
      'Email': contactInfo.emailAddress || null,
      'Phone': contactInfo.phoneNumber || null,
      'LinkedIn': contactInfo.linkedinUrl || null,
      'State': contactInfo.state || null,
      'City': contactInfo.city || null,
      'Address': contactInfo.address || null,
      'Postal Code': contactInfo.zipCode || null
    };
    
    // Filter out null values to avoid storing them in Firestore
    Object.keys(contactInfoUpdate).forEach(key => {
      if (contactInfoUpdate[key] === null) {
        delete contactInfoUpdate[key];
      }
    });

    // Merge the new contact info with existing data
    const parsedResumeDataUpdate = {
      ...existingParsedData,  // Keep all existing data (skills, education, etc.)
      ...contactInfoUpdate    // Update only the contact info fields
    };

    console.log('DEBUG: Existing parsed data:', JSON.stringify(existingParsedData, null, 2));
    console.log('DEBUG: Contact info update:', JSON.stringify(contactInfoUpdate, null, 2));
    console.log('DEBUG: Final merged update:', JSON.stringify(parsedResumeDataUpdate, null, 2));

    // Update only the merged data
    await resumeRef.update({
      parsedResumeData: parsedResumeDataUpdate
    });
    
    console.log(`Successfully updated contact info for resume ${resumeId} in parsed_resumes collection`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating contact info:', error);
    return NextResponse.json({ error: error.message || 'Failed to update contact info' }, { status: 500 });
  }
}