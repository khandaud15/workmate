import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return NextResponse.json({ ok: true, message: 'Test route is working' });
}
