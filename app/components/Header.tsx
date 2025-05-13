'use client';

// Updated mobile menu icons - May 10, 2025

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Logo from './Logo';
import { useState, useId, useEffect } from 'react';

interface Country {
  code: string;
  name: string;
  flag: string;
}

const countries: Country[] = [
  { code: 'NONE', name: 'Select Country', flag: '🌐' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
];
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Header({ className = '' }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ code: 'NONE', name: 'Select Country', flag: '🌐' });

  useEffect(() => {
    const saved = localStorage.getItem('selectedCountry');
    if (saved) {
      try {
        const parsedCountry = JSON.parse(saved);
        setSelectedCountry(parsedCountry);
      } catch (e) {
        console.error('Error parsing saved country:', e);
      }
    }
  }, []);

  const handleCountrySelect = (country: any) => {
    setSelectedCountry(country);
    setIsCountryDropdownOpen(false);
    setIsMobileDropdownOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCountry', JSON.stringify(country));
    }
  };
  

  const searchId = useId();

  const isRestrictedPath = pathname?.startsWith('/onboarding') || pathname?.startsWith('/profile');

  return (
    <header className={`sticky top-0 z-50 bg-white shadow-sm border-b border-[#0e3a68]/10 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="px-4 py-4 md:px-8">
          <div className="flex items-center justify-between space-x-6">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Logo />
            </Link>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center flex-grow justify-between">
              {!isRestrictedPath && <div className="flex items-center justify-center space-x-12 ml-12">
                <div className="relative group">
                  <button 
                    type="button"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                    className="text-[#0e3a68] hover:text-[#0c3156] transition-colors text-[15px] font-medium flex items-center gap-1"
                  >
                    Core Features
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute left-0 mt-2 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block z-50 min-w-[300px]">
                    <Link 
                      href="/resume-builder" 
                      className="block px-10 py-2 text-[15px] font-medium text-[#0e3a68] hover:bg-[#0e3a68] hover:text-white transition-colors whitespace-nowrap"
                    >
                      Resume Builder
                    </Link>
                    <Link 
                      href="/applications" 
                      className="block px-10 py-2 text-[15px] font-medium text-[#0e3a68] hover:bg-[#0e3a68] hover:text-white transition-colors whitespace-nowrap"
                    >
                      Application Tracker
                    </Link>
                  </div>
                </div>
                <Link 
                  href="/pricing" 
                  className="text-[#0e3a68] hover:text-[#0c3156] transition-colors text-[15px] font-medium"
                >
                  Pricing
                </Link>
                <Link 
                  href="/copilot" 
                  className="text-[#0e3a68] hover:text-[#0c3156] transition-colors text-[15px] font-medium"
                >
                  Copilot
                </Link>
                <div className="relative">
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsCountryDropdownOpen(false)}
                    style={{ display: isCountryDropdownOpen ? 'block' : 'none' }}
                  />

                  <button 
                    type="button"
                    role="button"
                    aria-haspopup="true"
                    aria-expanded={isCountryDropdownOpen}
                    className="text-[#0e3a68] hover:text-[#0c3156] transition-colors text-[15px] font-medium flex items-center gap-1"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                  >
                    {!selectedCountry || selectedCountry.code === 'NONE' ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                          />
                        </svg>
                        Select Country
                      </>
                    ) : (
                      <>
                        <span className="mr-1 text-lg">{selectedCountry.flag}</span>
                        {selectedCountry.name}
                      </>
                    )}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isCountryDropdownOpen && (
                    <div 
                      className="absolute left-0 mt-2 bg-white rounded-lg shadow-lg py-2 z-50 min-w-[200px]"
                      onMouseLeave={() => setIsCountryDropdownOpen(false)}
                    >
                      {countries.map((country) => (
                        <button
                          key={country.code}
                          onClick={() => handleCountrySelect(country)}
                          className="flex items-center w-full px-10 py-2 text-[15px] font-medium text-[#0e3a68] hover:bg-[#0e3a68] hover:text-white transition-colors whitespace-nowrap"
                        >
                          <span className="mr-2">{country.flag}</span>
                          {country.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>}

              {/* Search Bar */}
              {!isRestrictedPath && <div className="relative ml-auto mr-8 w-64">
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
              </div>}

              {/* Auth Buttons */}
              <div className="hidden md:flex items-center space-x-4 ml-auto">
                {session ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-[#0e3a68]">Hello, {session.user?.name}</span>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="bg-[#0e3a68] text-white px-4 py-[6px] rounded-[8px] hover:bg-[#0c3156] transition-colors font-medium text-[13px]"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : !isRestrictedPath && (
                  <div className="flex items-center space-x-4">
                    <Link 
                      href="/signup" 
                      className="bg-[#0e3a68] text-white px-4 py-[6px] rounded-[8px] hover:bg-[#0c3156] transition-colors font-medium text-[13px]"
                    >
                      Log in
                    </Link>
                    <Link 
                      href="/signup" 
                      className="hidden md:block bg-[#0e3a68] text-white px-4 py-[6px] rounded-[8px] hover:bg-[#0c3156] transition-colors font-medium text-[13px]"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile icons */}
            <div className="md:hidden flex items-center space-x-2">
              {!isRestrictedPath && (
                <>
                  <div className="relative inline-block">
                    <button
                      type="button"
                      className="p-2 text-[#0e3a68] hover:text-[#0c3156] transition-colors flex items-center justify-center"
                      aria-label="Select country"
                      aria-expanded={isMobileDropdownOpen}
                      onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                    >
                      {!selectedCountry || selectedCountry.code === 'NONE' ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                          />
                        </svg>
                      ) : (
                        <span className="text-lg">{selectedCountry.flag}</span>
                      )}
                    </button>
                    {isMobileDropdownOpen && (
                      <div 
                        className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg py-2 z-50 w-48 overflow-hidden"
                      >
                        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">
                          {countries.map((country) => (
                            <button
                              type="button"
                              key={country.code}
                              onClick={() => handleCountrySelect(country)}
                              className="flex items-center w-full px-4 py-2 text-[15px] font-medium text-[#0e3a68] hover:bg-[#0e3a68] hover:text-white transition-colors whitespace-nowrap"
                            >
                              <span className="mr-2 text-base">{country.flag}</span>
                              {country.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="md:hidden p-2 text-[#0e3a68] hover:text-[#0c3156] transition-colors"
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
                </>
              )}
              {session && isRestrictedPath && (
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="bg-[#0e3a68] text-white px-4 py-[6px] rounded-[8px] hover:bg-[#0c3156] transition-colors font-medium text-[13px]"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && !isRestrictedPath && (
            <div className="md:hidden bg-white fixed inset-0 z-50 px-6 overflow-y-auto">
              {/* Top Bar */}
              <div className="flex justify-between items-center py-8 border-b border-gray-100">
                {/* Logo */}
                <Link href="/" className="flex-shrink-0" onClick={() => setIsMobileMenuOpen(false)}>
                  <Logo />
                </Link>
                {/* Close Button */}
                <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="md:hidden p-1 text-[#0e3a68] hover:text-[#0c3156] transition-colors"
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
                    className="flex items-center justify-between w-full text-left text-[#0e3a68] text-base font-medium"
                  >
                    Core Features
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 transform transition-transform text-[#0e3a68] ${isMobileDropdownOpen ? 'rotate-180' : ''}`}
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
                      className="block text-[#0e3a68] text-base font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Resume Builder
                    </Link>
                    <Link 
                      href="/applications" 
                      className="block text-[#0e3a68] text-base font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Application Tracker
                    </Link>
                  </div>
                </div>
                <Link 
                  href="/pricing" 
                  className="text-[#0e3a68] text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link 
                  href="/copilot" 
                  className="text-[#0e3a68] text-base font-medium"
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
                    <p className="text-[#0e3a68] mb-4">Hello, {session.user?.name}</p>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="w-full bg-[#0e3a68] text-white px-4 py-2 rounded-lg text-base font-medium hover:bg-[#0c3156] transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 px-2">
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        console.log('Mobile Device:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
                        console.log('Current URL:', window.location.href);
                        try {
                          router.push('/login');
                        } catch (error) {
                          console.error('Router push error:', error);
                          window.location.href = '/login';
                        }
                      }}
                      className="bg-gray-900 text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors font-bold text-center"
                    >
                      Log in
                    </button>
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        console.log('Mobile Device:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
                        console.log('Current URL:', window.location.href);
                        try {
                          router.push('/signup');
                        } catch (error) {
                          console.error('Router push error:', error);
                          window.location.href = '/signup';
                        }
                      }}
                      className="bg-gray-900 text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors font-bold text-center"
                    >
                      Sign up
                    </button>
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
