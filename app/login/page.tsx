'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router, mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      email,
      password,
      redirect: true,
      callbackUrl: '/dashboard'
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Value Proposition */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#F8FAFF] p-12 flex-col justify-between">
        <div>
          <h1 className="text-[40px] leading-[48px] font-bold text-[#1C1C1C] mb-4">
            Apply to jobs in 1-click.
          </h1>
          <h2 className="text-[40px] leading-[48px] font-bold text-[#1C1C1C] mb-8">
            Power your entire job search,<br />
            with our recruiter-approved AI.
          </h2>
          
          <div className="mb-12">
            <p className="text-[18px] text-[#1C1C1C] mb-4">
              Browse handpicked jobs from the best companies
            </p>
            <div className="flex items-center">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">JD</div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-green-100 flex items-center justify-center text-green-600 text-xs font-medium">AM</div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-medium">SK</div>
              </div>
              <span className="ml-4 text-[15px] text-[#666]">Trusted by 1,000,000+ job seekers</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <img src="https://raw.githubusercontent.com/khandaud15/files/main/Airbnb_logo_PNG3.png" alt="Airbnb" className="h-12 object-contain" />
            <img src="https://raw.githubusercontent.com/khandaud15/files/main/Meta_Logo_PNG7.png" alt="Meta" className="h-12 object-contain" />
            <img src="https://raw.githubusercontent.com/khandaud15/files/main/Apple_logo_PNG1.png" alt="Apple" className="h-12 object-contain" />
            <img src="https://raw.githubusercontent.com/khandaud15/files/main/Amazon-Logo.png" alt="Amazon" className="h-12 object-contain" />
            <img src="https://raw.githubusercontent.com/khandaud15/files/main/Tesla_logo_PNG2.png" alt="Tesla" className="h-12 object-contain" />
            <img src="https://raw.githubusercontent.com/khandaud15/files/main/Cisco_logo_PNG2.png" alt="Cisco" className="h-12 object-contain" />
            <img src="https://raw.githubusercontent.com/khandaud15/files/main/Dell_logo_PNG1.png" alt="Dell" className="h-12 object-contain" />
            <img src="https://raw.githubusercontent.com/khandaud15/files/main/OpenAI-Logo-PNG_004.png" alt="OpenAI" className="h-12 object-contain" />
          </div>
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-[32px] font-bold text-center mb-8">Sign in to your account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <button
              type="submit"
              className="w-full bg-[#4292FF] text-white py-3 rounded-[8px] font-medium hover:bg-[#237DFF] transition-colors"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-6">Or sign in with</p>
            <div className="space-y-3">
              <button
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                className="w-full relative flex items-center justify-center px-6 py-4 border border-gray-300 rounded-[8px] bg-white hover:bg-gray-50 transition-colors text-[16px] font-medium text-gray-700"
              >
                <div className="absolute left-6 flex items-center justify-center w-6 h-6 rounded-[3px] bg-[#4285F4] text-white font-bold text-sm">G</div>
                <span>Continue with Google</span>
              </button>
              
              <button
                className="w-full relative flex items-center justify-center px-6 py-4 border border-gray-300 rounded-[8px] bg-white hover:bg-gray-50 transition-colors text-[16px] font-medium text-gray-700"
              >
                <div className="absolute left-6 flex items-center justify-center w-6 h-6 rounded-[3px] bg-[#0A66C2] text-white font-bold text-xs">in</div>
                <span>Continue with LinkedIn</span>
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-500 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
