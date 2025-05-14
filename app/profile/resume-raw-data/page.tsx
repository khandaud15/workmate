"use client";

import React, { useState, useEffect } from 'react';
import { FaCopy, FaCheckCircle } from 'react-icons/fa';

export default function RawResumeDataPage() {
  const [rawData, setRawData] = useState<Record<string, any> | null>(null);
  const [copiedSections, setCopiedSections] = useState<string[]>([]);

  useEffect(() => {
    console.log('Raw Resume Data Page Mounted');
    console.log('Window Object:', typeof window !== 'undefined');
    console.log('LocalStorage Available:', typeof localStorage !== 'undefined');

    // Fetch all localStorage items related to resume
    const resumeRelatedData: Record<string, any> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('resume') || 
        key.includes('parsed') || 
        key.includes('raw')
      )) {
        try {
          const value = localStorage.getItem(key);
          resumeRelatedData[key] = value ? JSON.parse(value) : value;
        } catch {
          resumeRelatedData[key] = localStorage.getItem(key);
        }
      }
    }

    setRawData(resumeRelatedData);
  }, []);

  const handleCopySection = (key: string) => {
    if (rawData && rawData[key]) {
      navigator.clipboard.writeText(JSON.stringify(rawData[key], null, 2));
      setCopiedSections(prev => [...prev, key]);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedSections(prev => prev.filter(section => section !== key));
      }, 2000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Raw Resume Data</h1>
      
      {rawData && Object.keys(rawData).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(rawData).map(([key, value]) => (
            <div 
              key={key} 
              className="bg-white shadow-md rounded-lg p-6 relative"
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-800">{key}</h2>
              
              <button 
                onClick={() => handleCopySection(key)}
                className="absolute top-4 right-4 text-gray-600 hover:text-blue-600 transition"
                title="Copy to clipboard"
              >
                {copiedSections.includes(key) ? (
                  <FaCheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <FaCopy className="w-6 h-6" />
                )}
              </button>
              
              <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-xl text-gray-600">
            No resume data found in local storage.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Please scan a resume first.
          </p>
        </div>
      )}
    </div>
  );
}
