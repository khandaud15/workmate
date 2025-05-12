'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        setError('Invalid email or password');
        return;
      }

      // Redirect to onboarding
      window.location.href = '/onboarding';
    } catch (error) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start pt-16">
      <div className="w-full max-w-[400px] space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-6">
          <Link href="/" className="bg-black text-white text-[15px] font-medium px-6 py-2 rounded-[8px] hover:bg-gray-800 transition-colors cursor-pointer outline outline-2 outline-[#39FF14]">
            Talexus
          </Link>
          <h1 className="text-[28px] sm:text-[40px] font-bold text-white whitespace-nowrap">
            Create your account
          </h1>
        </div>

        <div className="space-y-6">
          {/* Social Sign Up Buttons */}
          <button
            onClick={() => signIn('google', { 
              callbackUrl: '/onboarding',
              redirect: true
            })}
            className="flex w-full items-center justify-center gap-3 rounded-[8px] border border-[#333] bg-transparent px-4 py-3 text-[15px] font-medium text-white hover:bg-white/5"
          >
            <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign up with Google
          </button>

          <button
            onClick={() => signIn('github', { callbackUrl: '/onboarding', redirect: true })}
            className="flex w-full items-center justify-center gap-3 rounded-[8px] border border-[#333] bg-transparent px-4 py-3 text-[15px] font-medium text-white hover:bg-white/5"
          >
            <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            Sign up with GitHub
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#333]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-black px-4 text-[13px] text-gray-500">OR</span>
            </div>
          </div>

          {/* Email Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[13px] font-medium text-white mb-1">
                Email
              </label>
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-[8px] border border-[#333] bg-transparent px-4 py-3 text-[15px] text-white placeholder-gray-400 focus:border-[#4292FF] focus:outline-none focus:ring-0"
                  placeholder="Email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[13px] font-medium text-white mb-1">
                Password
              </label>
              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-[8px] border border-[#333] bg-transparent px-4 py-3 text-[15px] text-white placeholder-gray-400 focus:border-[#4292FF] focus:outline-none focus:ring-0"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="h-4 w-4 rounded border-[#333] bg-transparent text-[#4292FF] focus:ring-0 focus:ring-offset-0"
              />
              <label htmlFor="terms" className="ml-2 block text-[13px] text-gray-400">
                Agree to our{' '}
                <Link href="/terms" className="text-white hover:text-[#4292FF]">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-white hover:text-[#4292FF]">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {error && (
              <div className="text-red-500 text-[13px] mt-2">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={!agreed}
                className="mt-2 w-full rounded-[8px] bg-[#FFFFFF] text-black px-4 py-3 text-[15px] font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign up
              </button>
            </div>
          </form>

          <p className="text-center text-[13px] text-gray-400">
            Already have an account?{' '}
            <Link href="/signin" className="text-white hover:text-[#4292FF]">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
