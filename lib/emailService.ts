import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};



export const sendVerificationEmail = async (
  email: string,
  otp: string,
  type: 'verification' | 'reset' = 'verification'
): Promise<boolean> => {
  try {
    // Determine email subject based on type
    const subject = type === 'reset' 
      ? 'Reset Your Talexus AI Password'
      : 'Verify Your Talexus AI Account';
    
    // HTML content for the email
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${type === 'reset' ? 'Reset Your Talexus AI Password' : 'Welcome to Talexus AI – Verify Your Email'}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f0f11; font-family: Arial, sans-serif; color: #ffffff;">
  <div style="max-width: 600px; margin: 40px auto; padding: 30px; background: linear-gradient(to bottom right, #1e1b2d, #0f0e15); border-radius: 20px; box-shadow: 0 10px 40px rgba(168, 85, 247, 0.15); border: 1px solid #282630;">
    
    <h2 style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #ffffff;">${type === 'reset' ? 'Reset Your Password' : 'Welcome to Talexus AI 👋'}</h2>
    
    <p style="font-size: 15px; color: #dddddd; text-align: center; margin-bottom: 20px;">
      ${type === 'reset' ? 'We received a request to reset your Talexus AI password. Use the code below to complete the process.' : 'Talexus AI is your intelligent job-seeking copilot. We streamline your job search using smart automation and real-time job matching to help you apply faster and smarter.'}
    </p>

    ${type === 'verification' ? '<p style="font-size: 15px; color: #cccccc; text-align: center; margin-bottom: 24px;">To get started, please verify your email address using the code below:</p>' : ''}

    <div style="background-color: #2e2b3c; padding: 20px; border-radius: 12px; margin: 24px auto; width: fit-content; text-align: center;">
      <h3 style="font-size: 28px; letter-spacing: 6px; margin: 0; color: #a855f7;">${otp}</h3>
    </div>

    <p style="font-size: 14px; color: #a3a3a3; text-align: center; margin-top: 20px;">This code will expire in 10 minutes.</p>

    <p style="font-size: 13px; color: #888888; text-align: center;">${type === 'reset' ? 'Didn\'t request this password reset? You can safely ignore this email.' : 'Didn\'t request this email? Just ignore it.'}</p>
    <p style="font-size: 13px; color: #888888; text-align: center; margin-top: 12px;">${type === 'reset' ? 'The Talexus AI Team' : 'Thanks for joining Talexus — let\'s make job hunting easier, together.'}</p>
  </div>
</body>
</html>`;
    
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject,
      html
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
