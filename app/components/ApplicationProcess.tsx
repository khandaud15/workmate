'use client';

import Link from 'next/link';

// Using HTML entities instead of react-icons to avoid SSR issues
const EditIcon = () => <span className="text-lg">✎</span>;
const ArrowIcon = () => <span className="text-lg">→</span>;

export default function ApplicationProcess() {
  return (
    <div className="py-16 bg-[#fefcf9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Headline */}
        <h2 className="text-center text-[24px] sm:text-[32px] text-[#1A1A1A] mb-12" style={{ fontFamily: 'Helvetica Neue Bold, Helvetica Neue, Helvetica, Arial, sans-serif', fontWeight: 700 }}>
          Save time — skip the job application process
        </h2>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 [perspective:1000px]">
          {/* Column 1: We get to know you */}
          <div className="rounded-[16px] sm:rounded-[20px] p-4 sm:p-6 md:p-8 h-full bg-gradient-to-br from-[#F3E8FF] via-[#FFE8F9] to-[#FFE0EA] shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl relative before:absolute before:inset-0 before:bg-black/5 before:rounded-[16px] sm:before:rounded-[20px] before:opacity-0 hover:before:opacity-100 before:transition-opacity">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center">We get to know you</h3>
            
            {/* Info Cards */}
            <div className="space-y-4">
              <div className="bg-[#fefcf9] rounded-[10px] sm:rounded-[12px] p-3 sm:p-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Your desired salary</p>
                    <p className="text-base sm:text-lg font-semibold">$85,000</p>
                  </div>
                  <div role="button" tabIndex={0} onClick={() => {}} onKeyDown={(e) => e.key === 'Enter' && {}} className="p-2 text-[#4292FF] hover:bg-blue-50 rounded-full transition-colors cursor-pointer">
                    <EditIcon />
                  </div>
                </div>
              </div>
              
              <div className="bg-[#fefcf9] rounded-[10px] sm:rounded-[12px] p-3 sm:p-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Where do you want to work?</p>
                    <p className="text-base sm:text-lg font-semibold">Houston, TX</p>
                  </div>
                  <div role="button" tabIndex={0} onClick={() => {}} onKeyDown={(e) => e.key === 'Enter' && {}} className="p-2 text-[#4292FF] hover:bg-blue-50 rounded-full transition-colors cursor-pointer">
                    <EditIcon />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: We find jobs for you */}
          <div className="rounded-[16px] sm:rounded-[20px] p-4 sm:p-6 md:p-8 h-full bg-gradient-to-br from-[#FFF3E8] via-[#FFE8D4] to-[#FFE0E0] shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl relative before:absolute before:inset-0 before:bg-black/5 before:rounded-[16px] sm:before:rounded-[20px] before:opacity-0 hover:before:opacity-100 before:transition-opacity">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center">We find jobs for you</h3>
            
            {/* Search Input */}
            <div className="bg-[#fefcf9] rounded-[10px] sm:rounded-[12px] p-2 sm:p-3 shadow-sm flex items-center mb-3 sm:mb-4">
              <div className="flex-1 text-gray-800">Project Manager</div>
              <div role="button" tabIndex={0} onClick={() => {}} onKeyDown={(e) => e.key === 'Enter' && {}} className="p-2 text-[#4292FF] hover:bg-blue-50 rounded-full transition-colors cursor-pointer">
                <ArrowIcon />
              </div>
            </div>

            {/* Job Card */}
            <div className="bg-[#fefcf9] rounded-[12px] p-4 shadow-sm">
              <h4 className="font-semibold mb-2">Project Manager</h4>
              <p className="text-sm text-gray-600 line-clamp-3">
                The Project Manager is responsible for planning, delivery, and marketing across the lifecycle...
              </p>
            </div>
          </div>

          {/* Column 3: We apply for you */}
          <div className="rounded-[16px] sm:rounded-[20px] p-4 sm:p-6 md:p-8 h-full bg-gradient-to-br from-[#E8E8FF] via-[#F0E8FF] to-[#F8E8FF] shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl relative before:absolute before:inset-0 before:bg-black/5 before:rounded-[16px] sm:before:rounded-[20px] before:opacity-0 hover:before:opacity-100 before:transition-opacity">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center">We apply for you</h3>
            
            {/* Resume Card */}
            <div className="bg-[#fefcf9] rounded-[10px] sm:rounded-[12px] p-3 sm:p-4 shadow-sm mb-3 sm:mb-4">
              <p className="font-medium text-sm sm:text-base">Resume.pdf</p>
            </div>

            {/* Matched Offers Badge */}
            <div className="inline-block bg-[#4292FF] text-white text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full mb-3 sm:mb-4">
              15 Matched offers
            </div>

            {/* Applied Jobs List */}
            <div className="space-y-3">
              <div className="bg-[#fefcf9] rounded-[10px] sm:rounded-[12px] p-2 sm:p-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-sm sm:text-base">Project Manager</p>
                  <span className="text-green-600 flex items-center gap-1 text-sm sm:text-base">
                    Applied ✅
                  </span>
                </div>
              </div>
              <div className="bg-[#fefcf9] rounded-[10px] sm:rounded-[12px] p-2 sm:p-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-sm sm:text-base">Data Engineer</p>
                  <span className="text-green-600 flex items-center gap-1 text-sm sm:text-base">
                    Applied ✅
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-12 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 text-[14px] sm:text-[16px] font-medium rounded-[6px] sm:rounded-[8px] text-white bg-[#0e3a68] hover:bg-[#0c3156] transition-colors"
          >
            Get Started →
          </Link>
        </div>
      </div>
    </div>
  );
}
