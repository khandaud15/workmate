import { NextRequest, NextResponse } from 'next/server';

// TODO: Replace with your actual deployed FastAPI endpoint:
const FASTAPI_URL = 'https://resume-parser-84814621060.us-central1.run.app/generate-bullets'; // User's Cloud Run backend

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const resp = await fetch(FASTAPI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
