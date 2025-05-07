'use client';

import { useEffect, useRef } from 'react';

const companies = [
  {
    name: 'Airbnb',
    logo: 'https://raw.githubusercontent.com/khandaud15/files/main/Airbnb_logo_PNG3.png'
  },
  {
    name: 'Meta',
    logo: 'https://raw.githubusercontent.com/khandaud15/files/main/Meta_Logo_PNG7.png'
  },
  {
    name: 'Apple',
    logo: 'https://raw.githubusercontent.com/khandaud15/files/main/Apple_logo_PNG1.png'
  },
  {
    name: 'Amazon',
    logo: 'https://raw.githubusercontent.com/khandaud15/files/main/Amazon-Logo.png'
  },
  {
    name: 'Tesla',
    logo: 'https://raw.githubusercontent.com/khandaud15/files/main/Tesla_logo_PNG2.png'
  },
  {
    name: 'Cisco',
    logo: 'https://raw.githubusercontent.com/khandaud15/files/main/Cisco_logo_PNG2.png'
  },
  {
    name: 'Dell',
    logo: 'https://raw.githubusercontent.com/khandaud15/files/main/Dell_logo_PNG1.png'
  },
  {
    name: 'OpenAI',
    logo: 'https://raw.githubusercontent.com/khandaud15/files/main/OpenAI-Logo-PNG_004.png'
  }
];

export default function CompanyLogos() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroll = () => {
      if (scrollRef.current) {
        if (
          scrollRef.current.scrollLeft >=
          scrollRef.current.scrollWidth - scrollRef.current.clientWidth
        ) {
          scrollRef.current.scrollLeft = 0;
        } else {
          scrollRef.current.scrollLeft += 1;
        }
      }
    };

    const timer = setInterval(scroll, 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-8">
          Trusted by top companies worldwide
        </h2>
        <div className="relative p-8 bg-gray-50 border border-gray-200 rounded-2xl shadow-lg">
          <div className="absolute left-8 top-8 bottom-8 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10" />
          <div className="absolute right-8 top-8 bottom-8 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10" />
          <div 
            ref={scrollRef}
            className="overflow-hidden whitespace-nowrap py-4"
            style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 32px, black calc(100% - 32px), transparent)' }}
          >
            <div className="inline-block animate-scroll">
              {[...companies, ...companies].map((company, index) => (
                <div
                  key={`${company.name}-${index}`}
                  className="inline-block mx-16"
                >
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="h-16 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
