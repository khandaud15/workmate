'use client';

import { useState } from 'react';

export default function Hero3DImage() {
  return (
    <div className="relative order-2 md:order-1 w-full max-w-xl md:max-w-none">
      <div 
        className="aspect-[4/3] relative rounded-2xl overflow-hidden bg-[#F5F5F5] transform transition-all duration-300 hover:scale-[1.02] hover:-rotate-1"
        style={{ 
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}
      >
        <img
          src="https://raw.githubusercontent.com/khandaud15/files/main/Main2.png"
          alt="Job Applications"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
