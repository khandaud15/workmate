import { NextRequest, NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase';

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    if (!token || !email) {
      return new Response('Invalid verification link.', { status: 400 });
    }
    // Get verification data from Firestore
    const docRef = db.collection('email_verifications').doc(email);
    const doc = await docRef.get();
    if (!doc.exists) {
      return new Response('Verification link expired or invalid.', { status: 400 });
    }
    const data = doc.data();
    if (!data) {
      return new Response('No verification request found.', { status: 400 });
    }
    if (data.verified) {
      return new Response('Email already verified.', { status: 400 });
    }
    if (data.verificationToken !== token) {
      return new Response('Invalid verification token.', { status: 400 });
    }
    if (new Date(data.expiresAt) < new Date()) {
      return new Response('Verification link expired.', { status: 400 });
    }
    // Create user in Firebase Auth
    try {
      await auth.createUser({
        email,
        password: data.hashedPassword,
        emailVerified: true,
      });
    } catch (error: any) {
      if (error.code !== 'auth/email-already-exists') throw error;
    }
    await docRef.delete();
    // Redirect to /verified page with email param
    return new Response(`<!DOCTYPE html><html><head><meta http-equiv='refresh' content='1;url=/verified?email=${encodeURIComponent(email)}'><title>Email Verified</title></head><body style='font-family:sans-serif;text-align:center;padding-top:10vh;'><h1>Email Verified!</h1><p>Your account is ready. Redirecting to sign in...</p></body></html>`, { status: 200, headers: { 'Content-Type': 'text/html' }});
  } catch (err) {
    console.error('GET /verify error:', err);
    return new Response('Internal server error.', { status: 500 });
  }
}
