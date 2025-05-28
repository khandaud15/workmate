import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { generateOTP, sendVerificationEmail } from '@/lib/emailService';

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }
    
    // Check if user exists
    const userSnap = await db.collection('users').doc(email).get();
    
    // We don't want to reveal if an email exists or not for security reasons
    // So we'll always return success, but only send an email if the account exists
    if (userSnap.exists) {
      // Generate OTP
      const otp = generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP valid for 10 minutes
      
      // Store OTP in Firestore
      await db.collection('passwordResetOTPs').doc(email).set({
        otp,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
        used: false
      });
      
      // Send email with OTP
      await sendVerificationEmail(email, otp, 'reset');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'If an account with this email exists, a password reset code has been sent.' 
    });
    
  } catch (error) {
    console.error('Error in forgot password:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Something went wrong. Please try again.' 
    }, { status: 500 });
  }
}
