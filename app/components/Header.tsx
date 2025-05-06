'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useId } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchId = useId();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm py-4 px-2">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm shadow-sm rounded-full pl-4 pr-1 sm:px-8 py-4">
          <div className="flex items-center justify-between space-x-6">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
              <img src="https://raw.githubusercontent.com/khandaud15/files/main/workmate2.png" alt="WorkMate Logo" className="w-10 h-10 object-contain" />
              <span className="px-4 py-[6px] bg-[#4292FF] text-white rounded-[8px] font-medium text-[13px] hover:bg-[#237DFF] transition-colors">
                WorkMate
              </span>
            </Link>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center flex-grow justify-between">
              <div className="flex items-center space-x-8">
                <Link 
                  href="/features" 
                  className="text-gray-700 hover:text-[#4292FF] transition-colors font-bold"
                >
                  Core Features
                </Link>
                <Link 
                  href="/pricing" 
                  className="text-gray-700 hover:text-[#4292FF] transition-colors font-bold"
                >
                  Pricing
                </Link>
                <a 
                  href="#"
                  className="flex items-center space-x-2 text-gray-700 hover:text-[#4292FF] transition-colors font-bold"
                  title="Download Browser Extension"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Get Extension</span>
                </a>
              </div>

              {/* Search Bar */}
              <div className="relative mx-4 w-64">
                <div className="relative">
                  <label htmlFor={searchId} className="sr-only">Search jobs</label>
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    id={searchId}
                    type="search"
                    placeholder="Search Job"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-full bg-[#f0f1f3] border-none focus:outline-none focus:ring-2 focus:ring-gray-300 font-medium placeholder:text-gray-500 text-gray-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    suppressHydrationWarning
                  />
                </div>
              </div>

              {/* Auth Buttons */}
              <div className="flex items-center space-x-4">
                {session ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-700">Hello, {session.user?.name}</span>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="bg-[#4292FF] text-white px-4 py-[6px] rounded-[8px] hover:bg-[#237DFF] transition-colors font-medium text-[13px]"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <>
                    <Link 
                      href="/signup"
                      className="bg-[#4292FF] text-white px-4 py-[6px] rounded-[8px] hover:bg-[#237DFF] transition-colors font-medium text-[13px]"
                    >
                      Sign up
                    </Link>
                    <Link 
                      href="/login"
                      className="bg-[#4292FF] text-white px-4 py-[6px] rounded-[8px] hover:bg-[#237DFF] transition-colors font-medium text-[13px]"
                    >
                      Log in
                    </Link>
                  </>
                )}
              </div>
            </nav>

            {/* Mobile icons */}
            <div className="md:hidden flex items-center -mr-2">
              {/* Profile/Auth Icon */}
              {session ? (
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="p-1.5 bg-[#4292FF] rounded-full flex items-center justify-center w-8 h-8 mr-1.5 hover:bg-[#237DFF] transition-colors"
                  aria-label="Sign out"
                >
                  <svg
                    className="h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/login')}
                    className="p-1.5 bg-[#4292FF] rounded-full flex items-center justify-center w-8 h-8 mr-1.5 hover:bg-[#237DFF] transition-colors"
                    aria-label="Sign in"
                  >
                    <svg
                      className="h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </button>
                  <Link 
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="bg-[#4292FF] text-white px-4 py-[6px] rounded-[8px] text-[13px] font-medium whitespace-nowrap mr-2 hover:bg-[#237DFF] transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-[#4292FF] hover:text-[#237DFF] focus:outline-none transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                <Link 
                  href="/features" 
                  className="text-gray-700 hover:text-[#4292FF] transition-colors font-bold px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Core Features
                </Link>
                <Link 
                  href="/pricing" 
                  className="text-gray-700 hover:text-[#4292FF] transition-colors font-bold px-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <a 
                  href="#"
                  className="flex items-center space-x-2 text-gray-700 hover:text-[#4292FF] transition-colors font-bold px-2"
                  title="Download Browser Extension"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Get Extension</span>
                </a>
                
                {/* Mobile Search */}
                <div className="px-2">
                  <div className="relative">
                    <label htmlFor="mobile-search" className="sr-only">Search jobs</label>
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      id="mobile-search"
                      type="search"
                      placeholder="Search Job"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-full bg-[#f0f1f3] border-none focus:outline-none focus:ring-2 focus:ring-gray-300 font-medium placeholder:text-gray-500 text-gray-900"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                {/* Mobile Auth Buttons */}
                {session ? (
                  <div className="px-2">
                    <p className="text-gray-700 mb-2">Hello, {session.user?.name}</p>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="w-full bg-[#4292FF] text-white px-4 py-[6px] rounded-[8px] hover:bg-[#237DFF] transition-colors font-medium text-[13px] text-center"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 px-2">
                    <Link 
                      href="/signup"
                      className="w-full bg-[#4292FF] text-white px-4 py-[6px] rounded-[8px] hover:bg-[#237DFF] transition-colors font-medium text-[13px] text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                    <Link 
                      href="/login"
                      className="w-full bg-[#4292FF] text-white px-4 py-[6px] rounded-[8px] hover:bg-[#237DFF] transition-colors font-medium text-[13px] text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
