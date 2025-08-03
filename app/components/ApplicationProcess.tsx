'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';

export default function ApplicationProcess() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical mobile breakpoint
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // We'll handle the auto-scroll without cloning to avoid visual duplication
  
  // Auto-scroll effect for mobile only
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || !isMobile) return;
    
    let interval: NodeJS.Timeout;
    let currentIndex = 0;
    const slideCount = 3; // Total number of slides
    
    const startAutoScroll = () => {
      interval = setInterval(() => {
        // Calculate next index with wrapping
        currentIndex = (currentIndex + 1) % slideCount;
        
        // Get dimensions
        const slideWidth = scrollContainer.children[0].getBoundingClientRect().width;
        const gap = 24; // 1.5rem = 24px
        
        // Smooth scroll to the next slide
        scrollContainer.scrollTo({
          left: (slideWidth + gap) * currentIndex,
          behavior: 'smooth'
        });
        
        // Update active index for dots
        setActiveIndex(currentIndex);
      }, 3000);
    };
    
    startAutoScroll();
    
    const handleTouchStart = () => clearInterval(interval);
    const handleTouchEnd = () => startAutoScroll();
    
    scrollContainer.addEventListener('touchstart', handleTouchStart);
    scrollContainer.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      clearInterval(interval);
      scrollContainer.removeEventListener('touchstart', handleTouchStart);
      scrollContainer.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile]);
  
  return (
    <div className="py-16 bg-[#0e3a68]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-4">
          {/* Left Column - Text Content */}
          <div className="md:w-2/5 text-white">
            <h2 className="text-[32px] md:text-[40px] leading-tight font-bold mb-4 text-center md:text-left">
              Stand out with expert-crafted resumes
            </h2>
            <p className="text-lg mb-6">
              Land more interviews with ATS-optimized templates trusted by hiring managers at top companies.
            </p>
            <div className="flex justify-center md:justify-start">
              <Link
                href="/resume-examples"
                className="inline-flex items-center px-6 py-3 text-[16px] font-medium rounded-[8px] text-[#0e3a68] bg-white hover:bg-gray-100 transition-colors"
              >
                Browse templates
              </Link>
            </div>
            
            {/* Rating Section - Hidden on mobile */}
            <div className="mt-8 hidden md:block">
              <div className="flex items-center">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="ml-2 text-sm font-medium text-white">4.9 out of 5</p>
              </div>
              <p className="mt-1 text-sm text-gray-300">Based on 2,000+ reviews</p>
            </div>
          </div>
          
          {/* Right Column - Resume Examples */}
          <div className="md:w-3/5 relative overflow-hidden">
            <div ref={scrollRef} className="flex overflow-x-auto pb-4 space-x-6 snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {/* Resume Example 1 */}
              <div className="flex-shrink-0 w-[320px] md:w-[350px] snap-center -mt-4 p-2">
                <div className="hover:scale-105 transition-transform duration-300">
                  <img
                    src="/canva-blue.jpeg"
                    alt="Professional Resume Template - Blue"
                    className="rounded-lg w-full h-auto shadow-xl"
                  />
                </div>
              </div>
              
              {/* Resume Example 2 */}
              <div className="flex-shrink-0 w-[320px] md:w-[350px] snap-center -mt-4 p-2">
                <div className="hover:scale-105 transition-transform duration-300">
                  <img
                    src="/canva.jpeg"
                    alt="Professional Resume Template - Standard"
                    className="rounded-lg w-full h-auto shadow-xl"
                  />
                </div>
              </div>
              
              {/* Resume Example 3 */}
              <div className="flex-shrink-0 w-[320px] md:w-[350px] snap-center -mt-4 p-2">
                <div className="hover:scale-105 transition-transform duration-300">
                  <img
                    src="/canva-white.jpeg"
                    alt="Professional Resume Template - White"
                    className="rounded-lg w-full h-auto shadow-xl"
                  />
                </div>
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
