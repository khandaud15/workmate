"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/app/components/Logo";
import OTPVerificationModal from "@/app/components/OTPVerificationModal";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: New Password, 3: Success
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        setShowOTPModal(true);
      } else {
        setError(data.message || "Failed to send reset code.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle OTP verification result
  const handleOTPVerification = async (success: boolean) => {
    if (success) {
      // Move to password reset step after successful verification
      setShowOTPModal(false);
      setStep(2);
    } else {
      setError("Verification failed. Please try again.");
      setShowOTPModal(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await response.json();
      if (data.success) {
        setStep(3); // Move to success step
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start pt-24">
      {!showOTPModal && (
        <div className="w-full max-w-[400px] space-y-6">
          <div className="flex flex-col items-center space-y-6">
            <Link href="/" className="flex-shrink-0 transform scale-125 flex items-center justify-center">
              <Logo />
            </Link>
            <h1 className="text-[28px] sm:text-[36px] font-bold text-white whitespace-nowrap">
              {step === 1 && "Forgot Password"}
              {step === 2 && "Reset Password"}
              {step === 3 && "Password Reset"}
            </h1>
          </div>
          <div className="space-y-6">
            {step === 1 && (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-[13px] font-medium text-white mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="block w-full rounded-[8px] border border-[#333] bg-transparent px-4 py-3 text-[15px] text-white placeholder-gray-400 focus:border-[#4292FF] focus:outline-none focus:ring-0"
                    placeholder="Enter your email"
                  />
                </div>
                {error && <div className="text-red-500 text-[13px] mt-2">{error}</div>}
                <button
                  type="submit"
                  className="mt-2 w-full rounded-[8px] bg-[#FFFFFF] text-black px-4 py-3 text-[15px] font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Code"}
                </button>
                <div className="mt-4 text-center">
                  <Link href="/signin" className="text-[#4292FF] hover:text-[#237DFF] transition-colors font-medium">
                    Back to Sign In
                  </Link>
                </div>
              </form>
            )}
            {step === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-[13px] font-medium text-white mb-1">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="block w-full rounded-[8px] border border-[#333] bg-transparent px-4 py-3 text-[15px] text-white placeholder-gray-400 focus:border-[#4292FF] focus:outline-none focus:ring-0"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-[13px] font-medium text-white mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-[8px] border border-[#333] bg-transparent px-4 py-3 text-[15px] text-white placeholder-gray-400 focus:border-[#4292FF] focus:outline-none focus:ring-0"
                    placeholder="Confirm new password"
                  />
                </div>
                {error && <div className="text-red-500 text-[13px] mt-2">{error}</div>}
                <button
                  type="submit"
                  className="mt-2 w-full rounded-[8px] bg-[#FFFFFF] text-black px-4 py-3 text-[15px] font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
                <div className="mt-4 text-center">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="text-[#4292FF] hover:text-[#237DFF] transition-colors font-medium"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
            {step === 3 && (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Password Reset Successful</h2>
                <p className="text-gray-400 text-[15px] mb-6">
                  Your password has been reset successfully. You can now sign in with your new password.
                </p>
                <Link 
                  href="/signin" 
                  className="block w-full rounded-[8px] bg-[#FFFFFF] text-black px-4 py-3 text-[15px] font-medium hover:opacity-90 text-center"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      {/* OTP Verification Modal */}
      <OTPVerificationModal
        email={email}
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={handleOTPVerification}
      />
    </div>
  );
}
