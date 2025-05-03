'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import Modal from '../components/Modal';

export default function SignupPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <Modal onClose={() => router.push('/')}>
      <div className="p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <span className="px-4 py-[6px] bg-[#4285F4] text-white rounded-[8px] font-medium text-[15px]">
            WorkMate
          </span>
        </div>

        <h1 className="text-[32px] leading-[40px] font-bold text-[#1C1C1C] mb-2">
          Create account
        </h1>
        <p className="text-[15px] text-[#666] mb-8">
          Already have an account?{' '}
          <Link href="/login" className="text-[#7327CC] hover:text-[#5E20A7] font-medium">
            Sign in
          </Link>
        </p>

        {/* Phone Input */}
        <div className="mb-8">
          <div className="relative rounded-[12px] border border-[#E5E5E5] bg-white hover:border-[#1C1C1C] focus-within:border-[#1C1C1C] transition-colors">
            <div className="flex items-center px-4 py-4">
              <svg className="w-6 h-6 text-[#666] mr-3" viewBox="0 0 24 24" fill="none">
                <path d="M16 2H8C6.34315 2 5 3.34315 5 5V19C5 20.6569 6.34315 22 8 22H16C17.6569 22 19 20.6569 19 19V5C19 3.34315 17.6569 2 16 2Z" stroke="currentColor" strokeWidth="2" />
                <path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="tel"
                id="phone"
                className="block w-full border-0 p-0 text-[17px] text-[#1C1C1C] placeholder-[#666] focus:ring-0 focus:outline-none"
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>
          <p className="mt-2 text-[13px] text-[#666]">
            Message and data rates may apply
          </p>
        </div>

        {/* Continue Button */}
        <button className="w-full bg-[#1C1C1C] text-white rounded-full py-[14px] text-[15px] font-medium hover:bg-[#2C2C2C] transition-colors mb-6">
          Continue
        </button>

        <p className="text-[13px] text-[#666] mb-8">
          WorkMate will <span className="text-[#7327CC]">remember you</span> for faster sign-ins
        </p>

        {/* Google Sign In */}
        <button
          onClick={() => signIn('google')}
          className="w-full flex items-center justify-center py-[14px] px-4 bg-[#4285F4] text-white rounded-[4px] text-[15px] font-medium hover:bg-[#3367D6] transition-colors mb-6"
        >
          <div className="w-[18px] h-[18px] bg-white rounded-[2px] flex items-center justify-center mr-3">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                fill="#4285F4"
                d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
              />
            </svg>
          </div>
          Continue with Google
        </button>

        {/* Terms */}
        <div className="text-[13px] text-[#666]">
          <p>
            Protected by reCAPTCHA: Google{' '}
            <Link href="#" className="underline hover:text-[#1C1C1C]">Policy</Link> and{' '}
            <Link href="#" className="underline hover:text-[#1C1C1C]">Terms</Link>
          </p>
          <p className="mt-1">
            By continuing, I agree to the{' '}
            <Link href="#" className="underline hover:text-[#1C1C1C]">User Terms</Link> ·{' '}
            <Link href="#" className="underline hover:text-[#1C1C1C]">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </Modal>
  );
}
