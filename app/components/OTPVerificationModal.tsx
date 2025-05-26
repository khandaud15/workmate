import React, { useState, useRef, useEffect } from 'react';

interface OTPVerificationModalProps {
  email: string;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (success: boolean) => void;
}

const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  email,
  isOpen,
  onClose,
  onVerify,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    if (!isOpen) {
      setOtp(Array(6).fill(''));
      setError('');
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    }
  };

  const handleVerify = async () => {
    setError('');
    setIsVerifying(true);
    try {
      const otpString = otp.join('');
      
      // Determine which endpoint to use based on the current URL path
      const isPasswordReset = window.location.pathname.includes('forgot-password');
      const endpoint = isPasswordReset ? '/api/auth/reset-password' : '/api/auth/email-verification';
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString }),
      });
      const data = await response.json();
      if (data.success) {
        onVerify(true);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
        onVerify(false);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      onVerify(false);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(15,15,17,0.92)', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <div className="verify-box" style={{
        width: '92vw',
        maxWidth: 340,
        background: 'linear-gradient(to bottom right, #1e1b2d, #0f0e15)',
        border: '1px solid #282630',
        borderRadius: 14,
        boxShadow: '0 8px 32px rgba(168, 85, 247, 0.13)',
        padding: '18px 10px 24px 10px',
        textAlign: 'center',
      }}>
        <h2 style={{fontSize: '1.15rem', fontWeight: 600, marginBottom: 12, color: '#fff'}}>Verify Your Email</h2>
        <p style={{fontSize: '0.95rem', color: '#bcbcbc', lineHeight: 1.6}}>
          We've sent a verification code to <strong style={{color: '#fff'}}>{email}</strong>.<br />
          Please enter the 6-digit code below.
        </p>

        <div className="otp-inputs" style={{display: 'flex', justifyContent: 'space-between', margin: '18px 0'}}>
          {Array(6).fill(0).map((_, index) => (
            <input
              key={index}
              ref={el => { inputRefs.current[index] = el; }}
              type="text"
              maxLength={1}
              value={otp[index]}
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              style={{
                width: 36,
                height: 42,
                background: '#0f0e15',
                border: '2px solid #1f1f25',
                borderRadius: 8,
                color: '#fff',
                fontSize: '1.1rem',
                textAlign: 'center',
                outline: 'none',
                transition: 'all 0.2s ease',
                fontWeight: 600,
              }}
              className={
                'focus:border-[#a855f7] focus:shadow-[0_0_0_2px_rgba(168,85,247,0.3)]' +
                (otp[index] ? ' border-[#a855f7]' : '')
              }
            />
          ))}
        </div>

        {error && (
          <div style={{color: '#ef4444', fontSize: '0.95rem', marginBottom: 10}}>{error}</div>
        )}
        <button
          onClick={handleVerify}
          disabled={otp.join('').length !== 6 || isVerifying}
          className="verify-btn"
          style={{
            width: '100%',
            padding: 14,
            backgroundColor: '#6b21a8',
            border: 'none',
            borderRadius: 10,
            color: '#e0d2fc',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: isVerifying ? 'not-allowed' : 'pointer',
            marginTop: 10,
            opacity: otp.join('').length !== 6 || isVerifying ? 0.6 : 1,
          }}
        >
          {isVerifying ? 'Verifying...' : 'Verify'}
        </button>
        <div
          className="cancel-btn"
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'center',
            marginTop: 14,
            color: '#a3a3a3',
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
          onClick={onClose}
          tabIndex={0}
          role="button"
        >
          Cancel
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationModal;
