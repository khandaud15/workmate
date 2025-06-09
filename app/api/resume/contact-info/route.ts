import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/firebase';

interface ParsedResumeData {
  displayName?: string;
  isTargeted?: boolean;
  parsedResumeData: {
    // Contact Info Fields
    'Email': string;
    'Full Name': string;
    'LinkedIn': string;
    'Phone': string;
    'Postal Code': string;
    'State': string;
    'Address': string;
    'City': string;
    
    // Education
    Education: Array<{
      Degree: string;
      Institution: string;
      Year: string;
    }>;
    
    // Skills
    Skills: string[];
    'Technical Skills': {
      'Bioinformatics Tools': string[];
      'Databases': string[];
      'Programming Languages': string[];
    };
    
    // Work Experience
    'Work Experience': Array<{
      'Job Title': string;
      'Company': string;
      'Start/End Year': string;
      'Location': string | null;
      'Description': string[];
    }>;
  };
  parsedResumeUrl?: string;
  rawResumePath?: string;
  status?: string;
}

interface ContactInfo {
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  linkedinUrl: string;
  personalWebsite: string;
  country: string;
  state: string;
  city: string;
  address: string;
  zipCode: string;
  showCountry: boolean;
  showState: boolean;
  showCity: boolean;
  showAddress: boolean;
  showZipCode: boolean;
  // Raw fields from parsed resume data
  [key: string]: any;
};

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const userEmail = session.user.email;

    // Get resumeId from query params
    const url = new URL(request.url);
    const resumeId = url.searchParams.get('id') || '';
    if (!resumeId) {
      return NextResponse.json({ error: 'No resume ID provided' }, { status: 400 });
    }

    console.log('DEBUG: Getting contact info for:', { userEmail, resumeId });

    // Get resume data from new parsed_resumes collection structure
    const resumeRef = db.collection('parsed_resumes').doc(userEmail).collection('resumes').doc(resumeId);
    const resumeDoc = await resumeRef.get();
    
    if (!resumeDoc.exists) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const resumeData = resumeDoc.data();
    let parsedResumeData: ParsedResumeData;
    
    // Check if we have parsed data in the document
    if (resumeData?.parsedResumeData) {
      console.log('DEBUG: Using parsed resume data from Firestore document');
      parsedResumeData = resumeData.parsedResumeData as ParsedResumeData;
    } 
    // If not, but we have a URL to the parsed data, fetch it
    else if (resumeData?.parsedResumeUrl) {
      console.log('DEBUG: Fetching parsed resume data from URL:', resumeData.parsedResumeUrl);
      try {
        // Add null check for parsedResumeUrl
        const parsedResumeUrl = resumeData?.parsedResumeUrl;
        if (!parsedResumeUrl) {
          throw new Error('No parsed resume URL available');
        }
        
        const response = await fetch(parsedResumeUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch parsed resume data: ${response.status} ${response.statusText}`);
        }
        const jsonData = await response.json();
        parsedResumeData = jsonData;
        
        // Update the Firestore document with the parsed data for future use
        try {
          await resumeRef.update({
            parsedResumeData: jsonData
          });
          console.log('DEBUG: Updated Firestore document with parsed resume data');
        } catch (updateError) {
          console.error('DEBUG: Error updating Firestore document:', updateError);
          // Continue even if update fails - we already have the data we need
        }
      } catch (error) {
        console.error('DEBUG: Error fetching parsed resume data:', error);
        return NextResponse.json({ error: 'Failed to fetch parsed resume data' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'No parsed data available' }, { status: 404 });
    }
    
    console.log('DEBUG: Found parsed resume data:', parsedResumeData);

    console.log('DEBUG: Raw parsed resume data:', resumeData);
    
    // Get the document data and check if it exists
    const docData = resumeDoc.data();
    if (!docData) {
      return NextResponse.json({ error: 'Resume document is empty' }, { status: 404 });
    }
    console.log('DEBUG: Raw Firestore doc:', docData);

    console.log('DEBUG: Document ID:', resumeId);
    console.log('DEBUG: User Email:', userEmail);
    console.log('DEBUG: Full Document:', JSON.stringify(docData, null, 2));

    // Check if this is a fresh parse
    const parsedTimestamp = docData.parsedResumeTimestamp?.toDate();
    console.log('DEBUG: Parse timestamp:', parsedTimestamp);

    // Always try to get fresh data from the URL
    // Based on the Firestore structure you shared, we know exactly how the data is stored
    // The parsedResumeData is a top-level map with fields like Address, City, etc.
    
    // First, ensure we have the parsedResumeData from Firestore
    let resumeFieldsMap: any = {};
    
    // Start with the Firestore data - this is our primary source
    if (docData.parsedResumeData && typeof docData.parsedResumeData === 'object') {
      console.log('DEBUG: Using parsedResumeData from Firestore document');
      resumeFieldsMap = docData.parsedResumeData;
      console.log('DEBUG: Firestore parsedResumeData keys:', Object.keys(resumeFieldsMap));
      console.log('DEBUG: Sample fields - Address:', resumeFieldsMap['Address'], 'Postal Code:', resumeFieldsMap['Postal Code']);
    } else {
      console.warn('DEBUG: No parsedResumeData in Firestore document');
    }
    
    // Only try URL as a fallback if Firestore data is missing or empty
    if ((!resumeFieldsMap || Object.keys(resumeFieldsMap).length === 0) && docData.parsedResumeUrl) {
      console.log('DEBUG: Firestore data missing/empty. Attempting to fetch from URL:', docData.parsedResumeUrl);
      try {
        const response = await fetch(docData.parsedResumeUrl, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} fetching from ${docData.parsedResumeUrl}`);
        }
        
        const jsonDataFromUrl = await response.json();
        console.log('DEBUG: Raw data from URL:', JSON.stringify(jsonDataFromUrl, null, 2));
        
        // Check if the URL data has parsedResumeData field
        if (jsonDataFromUrl && typeof jsonDataFromUrl.parsedResumeData === 'object') {
          resumeFieldsMap = jsonDataFromUrl.parsedResumeData;
          console.log('DEBUG: Using parsedResumeData from URL');
        } else {
          // Otherwise use the URL data directly
          resumeFieldsMap = jsonDataFromUrl;
          console.log('DEBUG: Using URL data directly');
        }
        
        // Update Firestore with this data
        try {
          await resumeRef.update({ parsedResumeData: resumeFieldsMap });
          console.log('DEBUG: Updated Firestore document with parsed resume data');
        } catch (updateError) {
          console.error('DEBUG: Error updating Firestore:', updateError);
        }
      } catch (error) {
        console.error('DEBUG: Failed to fetch from URL:', error);
      }
    }
    console.log(`DEBUG: Final resumeFieldsMap keys: ${Object.keys(resumeFieldsMap)}`);

    if (!resumeFieldsMap || Object.keys(resumeFieldsMap).length === 0) {
      console.log('DEBUG: resumeFieldsMap is empty or undefined. Returning 404.');
      return NextResponse.json({ error: 'No parsed resume data found after processing' }, { status: 404 });
    }

    console.log('DEBUG: Final resumeFieldsMap being used for contact info. Keys:', Object.keys(resumeFieldsMap));
    if (Object.keys(resumeFieldsMap).length > 0) {
      console.log('DEBUG: Sample resumeFieldsMap content - Full Name:', resumeFieldsMap['Full Name'], 'Address:', resumeFieldsMap['Address']);
    }

    // Construct the contact info object
    const contactInfo: ContactInfo = {
      fullName: resumeFieldsMap['Full Name'] || '',
      emailAddress: resumeFieldsMap['Email'] || '',
      phoneNumber: resumeFieldsMap['Phone'] || '',
      linkedinUrl: resumeFieldsMap['LinkedIn'] || '',
      personalWebsite: '', // Not in parsed data
      country: resumeFieldsMap['Country'] || 'USA',
      state: resumeFieldsMap['State'] || '',
      city: resumeFieldsMap['City'] || '',
      address: resumeFieldsMap['Address'] || '',
      zipCode: resumeFieldsMap['Postal Code'] || '',
      showCountry: true,
      showState: true,
      showCity: true,
      showAddress: true,
      showZipCode: true,
      
      // Also include the raw fields directly to ensure frontend has access to them
      'Address': resumeFieldsMap['Address'] || '',
      'Postal Code': resumeFieldsMap['Postal Code'] || ''
    };

    console.log('DEBUG: Contact info:', contactInfo);

    // Try to extract state from address if not present
    if (!contactInfo.state && contactInfo.address) {
      const addressParts = contactInfo.address.split(',');
      if (addressParts.length > 1) {
        const lastPart = addressParts[addressParts.length - 1].trim();
        const words = lastPart.split(' ');
        for (const word of words) {
          if (/^[A-Z]{2}$/.test(word)) {
            contactInfo.state = word;
            break;
          }
        }
      }
    }

    console.log('DEBUG: Contact info after checking direct fields:', contactInfo);

    console.log('DEBUG: Parsed Resume Data:', parsedResumeData);
    console.log('DEBUG: Initial Contact Info:', contactInfo);
    
    console.log('DEBUG: Extracted contact info:', contactInfo);

    // If state is not directly present, try to extract from address
    if (!contactInfo.state && (docData['Address'] || (docData.parsedResumeData && docData.parsedResumeData['Address']))) {
      // Try to extract state from address
      const addressStr = docData['Address'] || (docData.parsedResumeData && docData.parsedResumeData['Address']) || '';
      const addressParts = addressStr.split(',');
      
      // Look for state in the last part (usually "City, State ZIP")
      if (addressParts.length > 1) {
        const lastPart = addressParts[addressParts.length - 1].trim();
        const words = lastPart.split(' ');
        
        // Look for state abbreviation
        for (const word of words) {
          const trimmed = word.trim();
          if (/^[A-Z]{2}$/.test(trimmed) || trimmed === 'IL' || trimmed === 'TX') {
            contactInfo.state = trimmed;
            break;
          }
        }
      }
    }

    console.log('DEBUG: Final Contact Info:', contactInfo);

    return NextResponse.json({
      success: true,
      contactInfo: contactInfo
    });
  } catch (error: any) {
    console.error('Error fetching contact info:', error);
    // Access userEmail and resumeId from the outer scope
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email || '';
    const url = new URL(request.url);
    const resumeId = url.searchParams.get('id') || '';
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch contact info',
      debug: { userEmail, resumeId }
    }, { status: 500 });
  }
}