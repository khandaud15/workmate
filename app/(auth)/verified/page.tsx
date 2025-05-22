"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function VerifiedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (!result?.error) {
        router.push('/onboarding');
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 bg-[#18162b] rounded-lg shadow-xl text-center">
        <h1 className="text-2xl font-bold text-[#6d28d9] mb-2">Email Verified!</h1>
        <p className="text-white mb-6">Your email <span className="font-medium">{email}</span> has been successfully verified.<br/>Please sign in to continue.</p>
        <form onSubmit={handleSignIn} className="space-y-4">
          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-md px-4 py-3 bg-[#232136] text-white border border-[#333] mb-2 cursor-not-allowed"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-md px-4 py-3 bg-[#232136] text-white border border-[#333]"
            required
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#6d28d9] text-white font-medium hover:bg-[#5b21b6] transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
