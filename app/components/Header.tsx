'use client';
import Link from 'next/link';

import { useState, useId } from 'react';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchId = useId();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="bg-white shadow-lg rounded-[30px] px-6 py-4">
          <div className="flex items-center justify-between space-x-6">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-600 flex-shrink-0">
              WorkMate
            </Link>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center flex-grow justify-between">
              <div className="flex items-center space-x-8">
                <Link 
                  href="/features" 
                  className="text-gray-700 hover:text-blue-600 transition-colors font-bold"
                >
                  Core Features
                </Link>
                <Link 
                  href="/pricing" 
                  className="text-gray-700 hover:text-blue-600 transition-colors font-bold"
                >
                  Pricing
                </Link>
                <a 
                  href="#"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors font-bold"
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
                <Link 
                  href="/login"
                  className="bg-gray-900 text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors font-bold"
                >
                  Log in
                </Link>
                <Link 
                  href="/signup"
                  className="bg-gray-900 text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors font-bold"
                >
                  Sign up
                </Link>
              </div>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                type="button" 
                className="text-gray-900 hover:text-gray-600"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
                  className="text-gray-700 hover:text-blue-600 transition-colors font-bold px-2"
                >
                  Core Features
                </Link>
                <Link 
                  href="/pricing" 
                  className="text-gray-700 hover:text-blue-600 transition-colors font-bold px-2"
                >
                  Pricing
                </Link>
                <a 
                  href="#"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors font-bold px-2"
                  title="Download Browser Extension"
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
                <div className="flex flex-col space-y-2 px-2">
                  <Link 
                    href="/login"
                    className="bg-gray-900 text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors font-bold text-center"
                  >
                    Log in
                  </Link>
                  <Link 
                    href="/signup"
                    className="bg-gray-900 text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors font-bold text-center"
                  >
                    Sign up
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
