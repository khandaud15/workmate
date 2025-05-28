import { NextRequest, NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase';
import { generateOTP, sendVerificationEmail } from '@/lib/emailService';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

// Helper to generate a random verification token
const generateVerificationToken = (): string => crypto.randomBytes(32).toString('hex');

// POST: Start sign-up, generate OTP, send email
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    // Store in Firestore
    await db.collection('email_verifications').doc(email).set({
      email,
      hashedPassword,
      otp,
      verificationToken,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      verified: false,
    });
    // Send email with OTP
    // Debug logging for email sending
    console.log('[EMAIL-VERIFICATION] Attempting to send verification email:', {
      RESEND_API_KEY: process.env.RESEND_API_KEY ? 'SET' : 'MISSING',
      RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
      email,
    });
    const sent = await sendVerificationEmail(email, otp, 'verification');
    if (!sent) {
      console.error('[EMAIL-VERIFICATION] Failed to send verification email:', {
        RESEND_API_KEY: process.env.RESEND_API_KEY ? 'SET' : 'MISSING',
        RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
        email,
      });
      return NextResponse.json({ success: false, message: 'Failed to send verification email.' }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: 'Verification email sent.' });
  } catch (err) {
    console.error('POST /email-verification error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}

// PUT: Verify OTP, create account
export async function PUT(request: NextRequest) {
  try {
    const { email, otp } = await request.json();
    if (!email || !otp) {
      return NextResponse.json({ success: false, message: 'Email and OTP are required.' }, { status: 400 });
    }
    const docRef = db.collection('email_verifications').doc(email);
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ success: false, message: 'No verification request found.' }, { status: 400 });
    }
    const data = doc.data();
    if (!data) {
      return NextResponse.json({ success: false, message: 'No verification request found.' }, { status: 400 });
    }
    if (data.verified) {
      return NextResponse.json({ success: false, message: 'Email already verified.' }, { status: 400 });
    }
    if (data.otp !== otp) {
      return NextResponse.json({ success: false, message: 'Invalid OTP.' }, { status: 400 });
    }
    if (new Date(data.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, message: 'OTP expired.' }, { status: 400 });
    }
    // Check if user already exists in Firestore
    const existingUser = await db.collection('users').doc(email).get();
    if (existingUser.exists) {
      return NextResponse.json({ 
        success: false, 
        message: 'This email is already registered. Please sign in instead.' 
      }, { status: 400 });
    }
    
    // Create user in Firebase Auth
    try {
      await auth.createUser({
        email,
        password: data.hashedPassword,
        emailVerified: true,
      });
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        return NextResponse.json({ 
          success: false, 
          message: 'This email is already registered. Please sign in instead.' 
        }, { status: 400 });
      }
      throw error;
    }
    // Create user in Firestore 'users' collection for NextAuth
    await db.collection('users').doc(email).set({
      email,
      hashedPassword: data.hashedPassword,
      createdAt: new Date().toISOString(),
      name: email.split('@')[0],
    });
    await docRef.delete();
    return NextResponse.json({ success: true, message: 'Email verified and account created.' });
  } catch (err) {
    console.error('PUT /email-verification error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
