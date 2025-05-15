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

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
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
    <header className="fixed w-full top-0 z-[9999] bg-white border-b border-[#0e3a68]/10">
      <div className="max-w-7xl mx-auto">
        <div className="px-2 py-3 md:px-8 md:py-4">
          <div className="flex items-center justify-between space-x-2 md:space-x-6">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 min-w-[100px]">
              <Logo />
            </Link>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center flex-grow justify-between">
              {!isRestrictedPath && <div className="flex items-center space-x-12 ml-4">
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
                  <div className="absolute left-0 mt-2 bg-[#fefcf9] rounded-lg shadow-lg py-2 hidden group-hover:block z-50 min-w-[300px]">
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
                      className="absolute left-0 mt-2 bg-[#fefcf9] rounded-lg shadow-lg py-2 z-50 min-w-[200px]"
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

              {/* Auth Buttons - Now with ml-auto to push to the right */}

              {/* Auth Buttons */}
              <div className="hidden md:flex items-center space-x-4 ml-auto">
                {session ? (
                  <div className="relative">
                    {isProfileDropdownOpen && (
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      />
                    )}
                    <button 
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center space-x-2 text-[#0e3a68] hover:text-[#0c3156] transition-colors relative z-50"
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-[#0e3a68] text-white flex items-center justify-center text-base font-medium overflow-hidden">
                          {session.user?.image ? (
                            <img src={session.user.image} alt={session.user.name || 'User'} className="h-full w-full object-cover" />
                          ) : (
                            session.user?.name?.charAt(0) || 'U'
                          )}
                        </div>
                        {/* Only show name if not on home page */}
                        {pathname !== '/' && <span className="ml-2 text-base">{session.user?.name}</span>}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                        </div>
                        <Link 
                          href="/profile/settings" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            signOut({ callbackUrl: '/' });
                          }}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Log out
                        </button>
                      </div>
                    )}
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
            <div className="md:hidden flex items-center -mr-2 space-x-1">
              {/* Show user avatar when logged in - only show if not in restricted path to avoid duplicate */}
              {session && !isRestrictedPath && (
                <div className="relative">
                  {isProfileDropdownOpen && (
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    />
                  )}
                  <button 
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="p-2 text-[#0e3a68] hover:text-[#0c3156] transition-colors relative z-50"
                  >
                    <div className="h-6 w-6 rounded-full bg-[#0e3a68] text-white flex items-center justify-center text-xs font-medium overflow-hidden">
                      {session.user?.image ? (
                        <img src={session.user.image} alt={session.user.name || 'User'} className="h-full w-full object-cover" />
                      ) : (
                        session.user?.name?.charAt(0) || 'U'
                      )}
                    </div>
                  </button>
                  
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                      </div>
                      <Link 
                        href="/profile/settings" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          signOut({ callbackUrl: '/' });
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              )}
              {isMobileDropdownOpen && (
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => {
                    setIsMobileDropdownOpen(false);
                    setIsCountryDropdownOpen(false);
                  }}
                />
              )}
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
                        className="absolute top-full right-0 mt-1 bg-[#fefcf9] rounded-lg shadow-lg py-2 z-50 w-48"
                      >
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
                <div className="relative">
                  {isProfileDropdownOpen && (
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    />
                  )}
                  <button 
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="p-2 text-[#0e3a68] hover:text-[#0c3156] transition-colors relative z-50"
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-[#0e3a68] text-white flex items-center justify-center text-sm font-medium overflow-hidden">
                        {session.user?.image ? (
                          <img src={session.user.image} alt={session.user.name || 'User'} className="h-full w-full object-cover" />
                        ) : (
                          session.user?.name?.charAt(0) || 'U'
                        )}
                      </div>
                      {/* Only show dropdown arrow if not on home page */}
                      {pathname !== '/' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </button>
                  
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                      </div>
                      <Link 
                        href="/profile/settings" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          signOut({ callbackUrl: '/' });
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && !isRestrictedPath && (
            <div className="md:hidden bg-[#fefcf9] fixed inset-0 z-50 px-6">
              {/* Top Bar */}
              <div className="flex justify-between items-center py-8 border-b border-gray-100 bg-white">
                {/* Logo */}
                <Link href="/" className="flex-shrink-0">
                  <Logo />
                </Link>

                {/* Close Button */}
                <button
                  type="button"
                  className="text-[#0e3a68] hover:text-[#0c3156] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
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

                {/* Mobile Auth Buttons */}
                {session ? (
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-[#0e3a68] text-white flex items-center justify-center text-base font-medium overflow-hidden mr-3">
                        {session.user?.image ? (
                          <img src={session.user.image} alt={session.user.name || 'User'} className="h-full w-full object-cover" />
                        ) : (
                          session.user?.name?.charAt(0) || 'U'
                        )}
                      </div>
                      <div>
                        <p className="text-[#0e3a68] font-medium">{session.user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                      </div>
                    </div>
                    
                    <Link 
                      href="/profile/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center w-full px-4 py-2 rounded-lg border border-[#0e3a68] text-[#0e3a68] hover:bg-[#0e3a68]/5 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </Link>
                    
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="flex items-center w-full bg-[#0e3a68] text-white px-4 py-2 rounded-lg text-base font-medium hover:bg-[#0c3156] transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 mt-6">
                    <Link 
                      href="/signup"
                      className="w-full bg-[#0e3a68] text-white px-4 py-2 rounded-lg text-base font-medium text-center hover:bg-[#0c3156] transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link 
                      href="/signup"
                      className="w-full bg-[#0e3a68] text-white px-4 py-2 rounded-lg text-base font-medium text-center hover:bg-[#0c3156] transition-colors"
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
