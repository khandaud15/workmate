import { NextResponse } from 'next/server';

const AFFINDA_API_KEY = process.env.AFFINDA_API_KEY;
const AFFINDA_BASE_URL = 'https://api.affinda.com/v2';

export async function GET(request: Request) {
  console.log('AFFINDA_API_KEY:', AFFINDA_API_KEY ? 'Present' : 'Missing');
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get('identifier');
  console.log('Scanning resume with identifier:', identifier);

  if (!identifier) {
    console.log('Error: Missing identifier in request');
    return NextResponse.json({ error: 'Missing identifier' }, { status: 400 });
  }

  try {
    const response = await fetch(`${AFFINDA_BASE_URL}/resumes/${identifier}`, {
      headers: {
        'Authorization': `Bearer ${AFFINDA_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Affinda API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Affinda API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Affinda scan response:', data);
    
    // Check for errors
    if (data.error?.errorCode || data.error?.errorDetail) {
      console.error('Resume processing error:', data.error);
      throw new Error(data.error.errorDetail || 'Failed to process resume');
    }
    
    // If we have data, it's ready
    if (data.data) {
      console.log('Resume data received');
      return NextResponse.json({
        status: 'complete',
        data: data.data
      });
    }
    
    // Otherwise still processing
    console.log('Resume still processing...');
    return NextResponse.json({ status: 'processing' });
  } catch (error) {
    console.error('Error fetching resume data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume data' },
      { status: 500 }
    );
  }
}
