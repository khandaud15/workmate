"use client";
import { useState } from "react";
import Link from "next/link";
import Logo from "../../components/Logo";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
        setSubmitted(true);
      } else {
        setError(data.message || "Failed to send reset link.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start pt-24">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="flex flex-col items-center space-y-6">
          <Link href="/" className="flex-shrink-0 transform scale-125 flex items-center justify-center">
            <Logo />
          </Link>
          <h1 className="text-[28px] sm:text-[36px] font-bold text-white whitespace-nowrap">
            Forgot Password
          </h1>
        </div>
        <div className="space-y-6">
          {submitted ? (
            <div className="text-green-400 text-center text-[15px]">
              If an account exists for <b>{email}</b>, a password reset link has been sent.
              <br />Check your inbox (and spam folder).
              <div className="mt-6">
                <Link href="/signin" className="text-[#4292FF] hover:text-[#237DFF] transition-colors font-medium">
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <div className="mt-4 text-center">
                <Link href="/signin" className="text-[#4292FF] hover:text-[#237DFF] transition-colors font-medium">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
