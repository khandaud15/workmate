'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Onboarding() {
  return (
    <div className="min-h-screen bg-[#fefcf9] flex flex-col">
      {/* Header */}
      <div className="text-center pt-5 pb-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[#111827] mb-1 md:mb-2">
          Let&apos;s set you up for success!
        </h1>
        <p className="text-[#4B5563] text-base">
          Automate your job search in 3 simple steps.
        </p>
      </div>

      {/* Main content */}
      <div className="flex-grow px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 mb-8">
          {/* Step 1 */}
          <div className="relative">
            <div className="mb-10 md:mb-12 text-center">
              <h3 className="text-[#111827] font-semibold mb-1">Upload your resume.</h3>
              <p className="text-[#6B7280] text-sm">Help us understand your experience.</p>
            </div>
            <div className="bg-gradient-to-br from-pink-200 via-fuchsia-100 to-cyan-300 rounded-2xl p-3 md:p-6 h-[190px] md:h-auto md:aspect-[4/3] shadow-lg transform hover:scale-[1.02] transition-all duration-300 hover:shadow-xl relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/30 before:to-transparent">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/20 pointer-events-none"></div>
              <div className="bg-white rounded-lg p-2 md:p-4 h-full relative z-10">
                <div className="flex items-center mb-1 md:mb-2">
                  <div className="w-5 h-5 bg-blue-600 rounded-sm flex items-center justify-center mr-2">
                    <span className="text-white text-xs">R</span>
                  </div>
                  <span className="text-sm text-gray-600">Resume.pdf</span>
                </div>
                <div className="space-y-2">
                  {['Personal Information', 'Experience', 'Skills', 'Education', 'Summary...'].map((item, index) => (
                    <div key={index} className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="mb-10 md:mb-12 text-center">
              <h3 className="text-[#111827] font-semibold mb-1">Complete a quick profile.</h3>
              <p className="text-[#6B7280] text-sm">Share your preferences and career goals.</p>
            </div>
            <div className="bg-gradient-to-br from-pink-200 via-fuchsia-100 to-cyan-300 rounded-2xl p-3 md:p-6 h-[190px] md:h-auto md:aspect-[4/3] shadow-lg transform hover:scale-[1.02] transition-all duration-300 hover:shadow-xl relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/30 before:to-transparent">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/20 pointer-events-none"></div>
              <div className="bg-white rounded-lg p-2 md:p-4 h-full relative z-10 space-y-2 md:space-y-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Desired job?</p>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Project Manager</span>
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Your desired salary:</p>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">$110,000</span>
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Where do you want to</p>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">New York, NY</span>
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="mb-10 md:mb-12 text-center">
              <h3 className="text-[#111827] font-semibold mb-1">We find jobs and fill out applications.</h3>
              <p className="text-[#6B7280] text-sm">Sit back while we do the heavy lifting.</p>
            </div>
            <div className="bg-gradient-to-br from-pink-200 via-fuchsia-100 to-cyan-300 rounded-2xl p-3 md:p-6 h-[190px] md:h-auto md:aspect-[4/3] shadow-lg transform hover:scale-[1.02] transition-all duration-300 hover:shadow-xl relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/30 before:to-transparent">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/20 pointer-events-none"></div>
              <div className="bg-white rounded-lg p-2 md:p-4 h-full relative z-10">
                <div className="flex items-center mb-2 md:mb-4">
                  <div className="w-5 h-5 bg-blue-600 rounded-sm flex items-center justify-center mr-2">
                    <span className="text-white text-xs">R</span>
                  </div>
                  <span className="text-sm text-gray-600">Resume.pdf</span>
                </div>
                <div className="text-sm text-blue-600 font-medium mb-2 md:mb-4">15 job matches</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-red-100 rounded-sm flex items-center justify-center mr-2">
                        <span className="text-red-600 text-xs">A</span>
                      </div>
                      <span className="text-sm text-gray-800">Software Developer</span>
                    </div>
                    <div className="flex items-center text-green-600 text-xs">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Applied
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-100 rounded-sm flex items-center justify-center mr-2">
                        <span className="text-blue-600 text-xs">G</span>
                      </div>
                      <span className="text-sm text-gray-800">Business Analyst</span>
                    </div>
                    <div className="flex items-center text-green-600 text-xs">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Applied
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Fixed Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-3 sm:py-4 max-w-5xl">
          <div className="flex justify-between items-center w-full px-2">
            <div className="text-xs text-gray-500 max-w-[calc(100%-100px)] sm:max-w-[calc(100%-120px)]">
              By clicking "Next", you agree to our{' '}
              <Link href="/terms" className="text-[#4F46E5] hover:underline">Terms of Use</Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#4F46E5] hover:underline">Privacy Policy</Link>.
            </div>
            <Link
              href="/onboarding/resume"
              className="flex items-center w-[80px] sm:w-[100px] rounded-lg border-2 border-[#0e3a68] px-4 sm:px-6 py-2 sm:py-2.5 bg-[#0e3a68] text-white text-sm sm:text-base font-medium transition-colors hover:bg-[#0c3156]"
            >
              Next
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
