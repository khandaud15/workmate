import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import bcrypt from 'bcryptjs';

// Verify OTP for password reset
export async function PUT(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    
    if (!email || !otp) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email and OTP are required' 
      }, { status: 400 });
    }
    
    // First check if user exists
    const userSnap = await db.collection('users').doc(email).get();
    
    if (!userSnap.exists) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }
    
    // Get OTP from passwordResetOTPs collection
    const otpSnap = await db.collection('passwordResetOTPs').doc(email).get();
    
    if (!otpSnap.exists) {
      return NextResponse.json({ 
        success: false, 
        message: 'No reset code found. Please request a new one.' 
      }, { status: 400 });
    }
    
    const otpData = otpSnap.data();
    
    if (!otpData) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid reset code data. Please request a new one.' 
      }, { status: 400 });
    }
    
    // Check if OTP is already used
    if (otpData.used) {
      return NextResponse.json({ 
        success: false, 
        message: 'This reset code has already been used. Please request a new one.' 
      }, { status: 400 });
    }
    
    // Check if OTP is expired
    const expiresAt = new Date(otpData.expiresAt);
    const now = new Date();
    
    if (now > expiresAt) {
      return NextResponse.json({ 
        success: false, 
        message: 'Reset code has expired. Please request a new one.' 
      }, { status: 400 });
    }
    
    // Verify OTP
    if (otpData.otp !== otp) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid reset code. Please try again.' 
      }, { status: 400 });
    }
    
    // OTP is valid
    return NextResponse.json({ 
      success: true, 
      message: 'Reset code verified successfully' 
    });
    
  } catch (error) {
    console.error('Error verifying reset OTP:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Something went wrong. Please try again.' 
    }, { status: 500 });
  }
}

// Reset password after OTP verification
export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();
    
    if (!email || !newPassword) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email and new password are required' 
      }, { status: 400 });
    }
    
    // Update user password
    const userSnap = await db.collection('users').doc(email).get();
    
    if (!userSnap.exists) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }
    
    // Check if there's a valid OTP for this email
    const otpSnap = await db.collection('passwordResetOTPs').doc(email).get();
    if (!otpSnap.exists) {
      return NextResponse.json({ 
        success: false, 
        message: 'Please verify your email with a reset code first' 
      }, { status: 400 });
    }
    
    const otpData = otpSnap.data();
    if (!otpData || otpData.used || new Date() > new Date(otpData.expiresAt)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Your verification has expired. Please request a new reset code' 
      }, { status: 400 });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user document with new password
    await db.collection('users').doc(email).update({ 
      hashedPassword: hashedPassword, // Use hashedPassword field to match the field used in authentication
      updatedAt: new Date().toISOString()
    });
    
    // Mark OTP as used
    await db.collection('passwordResetOTPs').doc(email).update({
      used: true,
      usedAt: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Password has been reset successfully' 
    });
    
  } catch (error) {
    console.error('Error in reset password:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Something went wrong. Please try again.' 
    }, { status: 500 });
  }
}
