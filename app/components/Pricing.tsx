'use client';
import React, { useState, useEffect, useRef } from 'react';

interface PricingPlan {
  name: string;
  originalPrice: number;
  discountedPrice: number;
  features: string[];
  isPopular?: boolean;
  neonColor: string;
  glowColor: string;
}

interface FormState {
  email: string;
  isValid: boolean;
}

interface FormStates {
  [key: string]: FormState;
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'BASIC PLAN',
    originalPrice: 119,
    discountedPrice: 99,
    neonColor: 'from-blue-400 to-blue-600',
    glowColor: 'rgba(59, 130, 246, 0.5)', // blue-500 with opacity
    features: [
      '15 Applications/Day',
      '1 Resume Profile',
      'Apply for Jobs',
      'Basic Analytics',
      'Email Support'
    ]
  },
  {
    name: 'PREMIUM PLAN',
    originalPrice: 179,
    discountedPrice: 149,
    isPopular: true,
    neonColor: 'from-pink-400 to-pink-600',
    glowColor: 'rgba(236, 72, 153, 0.5)', // pink-500 with opacity
    features: [
      '150 Applications/Day',
      '5 Resume Profiles',
      'Apply for Jobs',
      'Basic Analytics',
      'Email Support'
    ]
  },
  {
    name: 'ULTIMATE PLAN',
    originalPrice: 1099,
    discountedPrice: 999,
    neonColor: 'from-orange-400 to-orange-600',
    glowColor: 'rgba(249, 115, 22, 0.5)', // orange-500 with opacity
    features: [
      '1500 Applications/Day',
      '20 Resume Profiles',
      'Apply for Jobs',
      'Advanced Analytics',
      'Priority Support'
    ]
  }
];

export default function Pricing() {
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [formStates, setFormStates] = useState<FormStates>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observers: IntersectionObserver[] = [];

    cardRefs.current.forEach((el, index) => {
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (el) {
            el.style.boxShadow = entry.isIntersecting ? `0 0 60px ${pricingPlans[index].glowColor}, 0 0 120px ${pricingPlans[index].glowColor}` : 'none';
            el.style.transition = 'box-shadow 0.7s ease-in-out';
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, []);

  const validateEmail = (email: string): boolean => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
  };

  const handleEmailChange = (planName: string, email: string) => {
    setFormStates(prev => ({
      ...prev,
      [planName]: { email, isValid: validateEmail(email) }
    }));
  };

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {pricingPlans.map((plan, index) => {
            return (
              <div
                key={plan.name}
                ref={el => {
                  if (el) cardRefs.current[index] = el;
                }}
                className={`relative rounded-2xl bg-[#1a1a1a] p-8 transition-all duration-700 hover:scale-105 hover:shadow-[0_0_50px_rgba(0,0,0,0.3)]`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 right-8 inline-flex items-center rounded-full bg-pink-600 px-4 py-1.5 text-sm font-extrabold text-white shadow-[0_0_30px_rgba(236,72,153,0.7)] animate-pulse">
                    MOST POPULAR
                  </div>
                )}
                <h3 
                  className={`text-2xl font-bold bg-gradient-to-r ${plan.neonColor} bg-clip-text text-transparent animate-pulse`}
                  style={{
                    textShadow: `0 0 10px ${plan.glowColor}, 0 0 20px ${plan.glowColor}`
                  }}
                >
                  {plan.name}
                </h3>
                
                <div className="mt-4 flex items-baseline text-white transition-all duration-500 hover:transform hover:scale-110 hover:-translate-y-2">
                  <span className="line-through text-gray-500 mr-2">${plan.originalPrice}</span>
                  <span className="text-3xl font-bold tracking-tight text-blue-400">
                    ${plan.discountedPrice}
                  </span>
                  <span className="text-sm font-semibold text-gray-600">/year</span>
                </div>

                <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-300">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center text-gray-300">
                      <svg
                        className={`h-5 w-5 mr-2 bg-gradient-to-r ${plan.neonColor} bg-clip-text`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <p className="text-sm text-gray-400 mb-2">
                    Enter the email to which the lazyapply plan has to be added
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    (Must be a gmail account)
                  </p>
                  <div role="group" aria-labelledby={`${plan.name}-email-label`}>
                    <label 
                      id={`${plan.name}-email-label`}
                      className="sr-only"
                      suppressHydrationWarning
                    >
                      Email for {plan.name}
                    </label>
                    <div className="space-y-4">
                      <input
                        type="email"
                        id={`${plan.name.toLowerCase().replace(' ', '-')}-email`}
                        name={`${plan.name.toLowerCase().replace(' ', '-')}-email`}
                        placeholder="Enter your Gmail address"
                        className={`w-full rounded-md bg-white border px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 transition-all duration-300 ${formStates[plan.name]?.email ? (formStates[plan.name]?.isValid ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : 'border-red-500 focus:border-red-500 focus:ring-red-500') : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                        value={formStates[plan.name]?.email || ''}
                        onChange={(e) => handleEmailChange(plan.name, e.target.value)}
                        required
                        suppressHydrationWarning
                      />
                      {formStates[plan.name]?.email && (
                        <div className="mt-2">
                          <p className={`text-sm ${formStates[plan.name]?.isValid ? 'text-green-600' : 'text-red-600'}`}>
                            {formStates[plan.name]?.isValid ? 'Valid Gmail address' : 'Must be a valid Gmail address'}
                          </p>
                        </div>
                      )}
                      <button
                        type="submit"
                        className={`mt-4 w-full rounded-md px-4 py-2 text-sm font-semibold ${formStates[plan.name]?.isValid ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        disabled={!formStates[plan.name]?.isValid}
                        suppressHydrationWarning
                      >
                        Purchase {plan.name}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
