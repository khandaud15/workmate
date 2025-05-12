import { NextResponse } from 'next/server';

const AFFINDA_API_KEY = process.env.AFFINDA_API_KEY;
const AFFINDA_BASE_URL = 'https://api.affinda.com/v2';

export async function POST(request: Request) {
  console.log('AFFINDA_API_KEY:', AFFINDA_API_KEY ? 'Present' : 'Missing');
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Log file details
    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Create form data for Affinda
    const affindaFormData = new FormData();
    affindaFormData.append('file', file, file.name);

    // Upload to Affinda
    console.log('Uploading to Affinda with API key:', AFFINDA_API_KEY ? 'Present' : 'Missing');
    
    if (!AFFINDA_API_KEY) {
      console.error('Missing Affinda API key');
      return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
    }

    console.log('Making request to Affinda...');
    const response = await fetch(`${AFFINDA_BASE_URL}/resumes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AFFINDA_API_KEY}`,
        'Accept': 'application/json',
      },
      body: affindaFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch (e) {
        errorJson = null;
      }

      console.error('Affinda API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorJson || errorText,
        apiKey: AFFINDA_API_KEY ? 'Present' : 'Missing',
        url: `${AFFINDA_BASE_URL}/resumes`
      });

      const errorMessage = errorJson?.error || `Upload failed: ${response.status} ${response.statusText}`;
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const data = await response.json();
    console.log('Affinda upload response:', JSON.stringify(data, null, 2));
    
    // Get the identifier from the response
    const identifier = data.meta?.identifier || data.identifier;
    console.log('Resume identifier:', identifier);
    
    if (!identifier) {
      console.error('No identifier in response:', JSON.stringify(data, null, 2));
      return NextResponse.json({ error: 'Failed to get resume identifier from Affinda response' }, { status: 500 });
    }
    
    return NextResponse.json({ identifier });
  } catch (error) {
    console.error('Error uploading resume:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload resume' },
      { status: 500 }
    );
  }
}
