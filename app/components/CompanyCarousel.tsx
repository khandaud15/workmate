'use client';

import { useRef, useEffect } from 'react';

const logos = [
  'https://raw.githubusercontent.com/khandaud15/files/main/Images2/16A6B598-9209-487A-9ED7-73AFA431B82F_1_105_c.png',
  'https://raw.githubusercontent.com/khandaud15/files/main/Images2/3A945AD2-1E1D-4E56-8E36-CD0F59C09E79_1_105_c.png',
  'https://raw.githubusercontent.com/khandaud15/files/main/Images2/5383E4A8-E962-4983-83C7-8A26F158B8FB_1_105_c.png',
  'https://raw.githubusercontent.com/khandaud15/files/main/Images2/5A689FDD-4E01-4FF8-9E43-9C4B126D25D3_1_105_c.png',
  'https://raw.githubusercontent.com/khandaud15/files/main/Images2/74B4D6E1-04CF-4C85-9221-A4C8D9AB45DF_1_105_c.png',
  'https://raw.githubusercontent.com/khandaud15/files/main/Images2/812111C1-843D-480C-8652-FDC4D516AF9D_1_105_c.png',
  'https://raw.githubusercontent.com/khandaud15/files/main/Images2/923F8DFD-56B0-43D5-8654-8512729B466C_1_105_c.png',
  'https://raw.githubusercontent.com/khandaud15/files/main/Images2/984F7334-CA80-4308-B02A-D5ECA38536B4_1_105_c.png',
  'https://raw.githubusercontent.com/khandaud15/files/main/Images2/A1E4B751-D8AC-4F41-B790-AB1EC4727DA7_1_105_c.png',
  'https://raw.githubusercontent.com/khandaud15/files/main/Images2/AC42F654-DCBD-4E08-9EBB-379C8B84661A_1_105_c.png',
  'https://raw.githubusercontent.com/khandaud15/files/main/Images2/D6099720-B4EC-458D-95F6-6A426B0525FD_1_105_c.png',
  'https://raw.githubusercontent.com/khandaud15/files/main/Images2/DD669E9C-4437-4FD1-B3B8-DF259BA738A9_1_105_c.png',
  'https://raw.githubusercontent.com/khandaud15/files/main/Images2/F1209C17-117A-4420-90EB-2444A70E8122_1_105_c.png',
];

const arrowStyle = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  background: '#fff',
  border: 'none',
  padding: '8px 12px',
  fontSize: '20px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  borderRadius: '50%',
  zIndex: 10,
  cursor: 'pointer',
};

export default function CompanyCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-[20px] text-center -mt-4 mb-4 text-[#0A0F1C] tracking-wide" style={{ fontFamily: 'Helvetica Neue Bold, Helvetica Neue, Helvetica, Arial, sans-serif', fontWeight: 700 }}>
          Top companies hiring
        </h2>

        <div className="bg-[#fefcf9] rounded-[24px] p-4 sm:p-6 relative transform hover:scale-[1.01] transition-all duration-500 ease-out shadow-2xl border border-gray-100 mt-8">
          <div className="relative overflow-hidden">
            <style jsx>{`
              @keyframes slide {
                0% { transform: translateX(0); }
                100% { transform: translateX(calc(-200px * ${logos.length})); }
              }
              .animate-slide {
                animation: slide 30s linear infinite;
              }
              .animate-slide:hover {
                animation-play-state: paused;
              }
            `}</style>
            <div className="flex gap-[80px] px-4 py-3 animate-slide">
              {/* First set of logos */}
              <div className="flex gap-[80px]">
                {logos.map((src, i) => (
                  <div
                    key={i}
                    className="flex-none w-[120px] h-[120px] bg-[#fefcf9] rounded-2xl p-4 shadow-lg hover:scale-105 transition-all duration-300 hover:shadow-[0_0_30px_rgba(66,146,255,0.3)] border border-white/10"
                  >
                    <img
                      src={src}
                      alt={`Company logo ${i + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex gap-[80px]">
                {logos.map((src, i) => (
                  <div
                    key={`dup-${i}`}
                    className="flex-none w-[120px] h-[120px] bg-[#fefcf9] rounded-2xl p-4 shadow-lg hover:scale-105 transition-all duration-300 hover:shadow-[0_0_30px_rgba(66,146,255,0.3)] border border-white/10"
                  >
                    <img
                      src={src}
                      alt={`Company logo ${i + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
