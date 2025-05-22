import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendVerificationEmail = async (
  email: string,
  otp: string,
  verificationLink: string
): Promise<boolean> => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: 'Verify Your Talexus AI Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #6d28d9; margin-bottom: 20px;">Verify Your Talexus AI Account</h2>
          <p>Thank you for signing up! Please use the following verification code to complete your registration:</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <h3 style="font-size: 24px; letter-spacing: 5px; margin: 0;">${otp}</h3>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>Alternatively, you can click the button below to verify your email:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${verificationLink}" style="background-color: #6d28d9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
          </div>
          <p style="font-size: 12px; color: #777; margin-top: 30px;">If you didn't request this email, please ignore it.</p>
        </div>
      `,
    });
    if (error) {
      console.error('Error sending email with Resend:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
