'use client';

// Updated mobile menu icons - May 10, 2025

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useId } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const searchId = useId();

  return (
    <header className="fixed w-full top-0 z-[9999] bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="px-4 py-4 md:px-8">
          <div className="flex items-center justify-between space-x-6">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span className="text-[15px] md:text-[13px] font-medium px-4 py-1.5 rounded-[8px] bg-black text-white hover:bg-gray-800 transition-colors">
                Talexus
              </span>
            </Link>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center flex-grow justify-between">
              <div className="flex items-center space-x-8">
                <div className="relative group">
                  <button 
                    type="button"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                    className="text-gray-700 hover:text-[#4292FF] transition-colors text-[22px] md:text-base font-bold flex items-center gap-1"
                  >
                    Core Features
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute left-0 mt-2 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block z-50 min-w-[300px]">
                    <Link 
                      href="/resume-builder" 
                      className="block px-10 py-2 text-[15px] text-gray-700 hover:bg-[#4292FF] hover:text-white transition-colors whitespace-nowrap"
                    >
                      Resume Builder
                    </Link>
                    <Link 
                      href="/jobs" 
                      className="block px-10 py-2 text-[15px] text-gray-700 hover:bg-[#4292FF] hover:text-white transition-colors whitespace-nowrap"
                    >
                      Job Search
                    </Link>
                    <Link 
                      href="/applications" 
                      className="block px-10 py-2 text-[15px] text-gray-700 hover:bg-[#4292FF] hover:text-white transition-colors whitespace-nowrap"
                    >
                      Application Tracker
                    </Link>
                  </div>
                </div>
                <Link 
                  href="/pricing" 
                  className="text-gray-700 hover:text-[#4292FF] transition-colors text-[22px] md:text-base font-bold"
                >
                  Pricing
                </Link>
                <Link 
                  href="/copilot" 
                  className="text-gray-700 hover:text-[#4292FF] transition-colors text-[22px] md:text-base font-bold"
                >
                  Copilot
                </Link>
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
              <div className="hidden md:flex items-center space-x-4">
                {session ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-700">Hello, {session.user?.name}</span>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="bg-black text-white px-4 py-[6px] rounded-[8px] hover:bg-gray-800 transition-colors font-medium text-[20px] md:text-[13px]"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link 
                      href="/signup" 
                      className="bg-black text-white px-4 py-[6px] rounded-[8px] hover:bg-gray-800 transition-colors font-medium text-[20px] md:text-[13px]"
                    >
                      Log in
                    </Link>
                    <Link 
                      href="/signup" 
                      className="hidden md:block bg-black text-white px-4 py-[6px] rounded-[8px] hover:bg-gray-800 transition-colors font-medium text-[20px] md:text-[13px]"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile icons */}
            <div className="md:hidden flex items-center -mr-2">
              {/* Profile/Auth Icon */}
              {session ? (
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="p-1.5 bg-black rounded-full flex items-center justify-center w-8 h-8 mr-1.5 hover:bg-gray-800 transition-colors"
                  aria-label="Sign out"
                >
                  <svg
                    className="w-6 h-6 text-white"
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
                    onClick={() => router.push('/signup')}
                    className="p-1.5 bg-black rounded-full flex items-center justify-center w-8 h-8 mr-1.5 hover:bg-gray-800 transition-colors"
                    aria-label="Sign in"
                  >
                    <svg
                      className="w-6 h-6 md:w-5 md:h-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </button>

                </>
              )}

              {/* Mobile Menu */}
              <button
                type="button"
                className="md:hidden p-2 text-gray-700"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle mobile menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white fixed inset-0 z-50 px-6">
              {/* Top Bar */}
              <div className="flex justify-between items-center py-8 border-b border-gray-100">
                {/* Logo */}
                <Link href="/" className="flex-shrink-0">
                  <span className="text-[15px] font-medium px-4 py-1.5 rounded-[8px] bg-black text-white">Talexus</span>
                </Link>
                {/* Close Button */}
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                  className="md:hidden p-1 text-gray-600 hover:text-gray-900"
                  aria-label="Close menu"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="flex flex-col space-y-6">
                {/* Mobile Core Features Dropdown */}
                <div>
                  <button
                    onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                    className="flex items-center justify-between w-full text-left text-gray-900 text-xl font-semibold"
                  >
                    Core Features
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 transform transition-transform ${isMobileDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div className={`mt-4 space-y-4 ${isMobileDropdownOpen ? 'block' : 'hidden'}`}>
                    <Link 
                      href="/resume-builder" 
                      className="block text-gray-600 text-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Resume Builder
                    </Link>
                    <Link 
                      href="/jobs" 
                      className="block text-gray-600 text-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Job Search
                    </Link>
                    <Link 
                      href="/applications" 
                      className="block text-gray-600 text-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Application Tracker
                    </Link>
                  </div>
                </div>
                <Link 
                  href="/pricing" 
                  className="text-gray-900 text-xl font-semibold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link 
                  href="/copilot" 
                  className="text-gray-900 text-xl font-semibold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Copilot
                </Link>

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
                  <div className="mt-6">
                    <p className="text-gray-600 mb-4">Hello, {session.user?.name}</p>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="w-full bg-black text-white px-4 py-2 rounded-lg text-base font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 mt-6">
                    <Link 
                      href="/signup"
                      className="w-full bg-black text-white px-4 py-2 rounded-lg text-base font-medium text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link 
                      href="/signup"
                      className="w-full bg-black text-white px-4 py-2 rounded-lg text-base font-medium text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign up
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
