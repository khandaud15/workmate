"use client";

import React from 'react';

export default function ProfileLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <div className="min-h-screen bg-[#fefcf9]">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
