'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function ApplicationProcess() {
  return (
    <div className="py-16 bg-[#0e3a68]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-4">
          {/* Left Column - Text Content */}
          <div className="md:w-2/5 text-white">
            <h2 className="text-[32px] md:text-[40px] leading-tight font-bold mb-4">
              Stand out with expert-crafted resumes
            </h2>
            <p className="text-lg mb-6">
              Land more interviews with ATS-optimized templates trusted by hiring managers at top companies.
            </p>
            <Link
              href="/resume-examples"
              className="inline-flex items-center px-6 py-3 text-[16px] font-medium rounded-[8px] text-[#0e3a68] bg-white hover:bg-gray-100 transition-colors"
            >
              Browse templates
            </Link>
            
            {/* Rating Section */}
            <div className="mt-8">
              <div className="flex items-center mb-1">
                {/* Star Rating */}
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-[#39FF14] text-xl mr-1">
                      {star <= 4 ? '★' : '☆'}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-200">
                4.4/5 from 54.5K reviews
              </p>
            </div>
          </div>
          
          {/* Right Column - Resume Examples */}
          <div className="md:w-3/5 relative">
            <div className="flex overflow-x-auto pb-4 space-x-6 snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {/* Resume Example 1 */}
              <div className="flex-shrink-0 w-[320px] md:w-[350px] snap-center transform hover:scale-105 transition-transform duration-300 -mt-4">
                <img
                  src="/canva-blue.jpeg"
                  alt="Professional Resume Template - Blue"
                  className="rounded-lg w-full h-auto shadow-xl"
                />
              </div>
              
              {/* Resume Example 2 */}
              <div className="flex-shrink-0 w-[320px] md:w-[350px] snap-center transform hover:scale-105 transition-transform duration-300 -mt-4">
                <img
                  src="/canva.jpeg"
                  alt="Professional Resume Template - Standard"
                  className="rounded-lg w-full h-auto shadow-xl"
                />
              </div>
              
              {/* Resume Example 3 */}
              <div className="flex-shrink-0 w-[320px] md:w-[350px] snap-center transform hover:scale-105 transition-transform duration-300 -mt-4">
                <img
                  src="/canva-white.jpeg"
                  alt="Professional Resume Template - White"
                  className="rounded-lg w-full h-auto shadow-xl"
                />
              </div>
            </div>
            
            {/* Scroll indicators */}
            <div className="flex justify-center mt-4 space-x-2">
              <div className="w-2 h-2 rounded-full bg-white opacity-70"></div>
              <div className="w-2 h-2 rounded-full bg-white opacity-40"></div>
              <div className="w-2 h-2 rounded-full bg-white opacity-40"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
