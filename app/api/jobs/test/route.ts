import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🧪 Test API route called');
  
  return NextResponse.json({
    success: true,
    message: 'API routes are working on Vercel',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown'
  });
}

export async function POST(request: NextRequest) {
  console.log('🧪 Test API POST route called');
  
  try {
    const body = await request.json();
    console.log('Test POST body:', body);
    
    return NextResponse.json({
      success: true,
      message: 'POST API routes are working on Vercel',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process test request' },
      { status: 500 }
    );
  }
}
