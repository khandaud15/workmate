'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon
} from '@heroicons/react/24/solid';
import {
  MagnifyingGlassIcon,
  BellAlertIcon,
  RocketLaunchIcon,
  ClockIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const plans = [
  {
    id: 'trial',
    title: 'Trial access',
    price: '$2.95',
    period: '',
    features: [
      'AI-powered job search',
      'Auto-fill your applications',
      'Full access with unlimited applications'
    ],
    summary: 'Try it risk-free',
    recommended: false
  },
  {
    id: '3month',
    title: '3 month full access',
    price: '$13.95',
    period: '/mo',
    features: [
      'AI-powered job search',
      'Auto-fill your applications',
      'Full access with unlimited applications'
    ],
    summary: '$41.85 up front',
    recommended: true
  },
  {
    id: '6month',
    title: '6 month full access',
    price: '$10.95',
    period: '/mo',
    features: [
      'AI-powered job search',
      'Auto-fill your applications',
      'Full access with unlimited applications'
    ],
    summary: '$65.70 up front and save 63%',
    recommended: false
  }
];

type Feature = {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const features: Feature[] = [
  {
    title: 'Automate your job search',
    description: 'Let AI find the perfect matches',
    icon: MagnifyingGlassIcon
  },
  {
    title: 'Wake up to your best matches',
    description: 'Daily job alerts tailored to you',
    icon: BellAlertIcon
  },
  {
    title: '10x your job applications',
    description: 'Apply to multiple jobs in minutes',
    icon: RocketLaunchIcon
  },
  {
    title: 'Save valuable hours every week',
    description: 'Streamline your job search process',
    icon: ClockIcon
  },
  {
    title: 'Money-back guarantee',
    description: 'Risk-free trial period',
    icon: ShieldCheckIcon
  },
  {
    title: '24/7 customer support',
    description: 'We\'re here to help you succeed',
    icon: ChatBubbleLeftRightIcon
  }
];

const companies = [
  'Yeti',
  'The UPS Store',
  'HubSpot',
  'Deloitte',
  'Starbucks',
  'Lyft'
];

export default function PricingPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentCompanyIndex, setCurrentCompanyIndex] = useState(0);

  const nextCompanies = () => {
    setCurrentCompanyIndex((prev) =>
      prev + 3 >= companies.length ? 0 : prev + 3
    );
  };

  const prevCompanies = () => {
    setCurrentCompanyIndex((prev) =>
      prev - 3 < 0 ? companies.length - 3 : prev - 3
    );
  };

  const visibleCompanies = [
    companies[currentCompanyIndex],
    companies[(currentCompanyIndex + 1) % companies.length],
    companies[(currentCompanyIndex + 2) % companies.length]
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-6 py-12 text-center lg:px-8">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Land Jobs Faster. Stay Organized Effortlessly.
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          From auto-applying to interviews to syncing your calendar, Workmate keeps
          every part of your job journey on track.
        </p>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Panel - Plan Selection */}
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative w-full overflow-hidden rounded-lg border-2 transition-all ${selectedPlan === plan.id ? 'border-black' : 'border-gray-200'}`}
              >
                {/* Header with checkbox */}
                <button
                  onClick={() => setSelectedPlan(plan.id === selectedPlan ? null : plan.id)}
                  className={`flex w-full items-center justify-between p-4 hover:bg-gray-50 ${selectedPlan === plan.id ? 'bg-gray-50' : ''}`}
                >
                  <div className="flex items-center">
                    <div
                      className={`mr-3 flex h-5 w-5 items-center justify-center rounded border transition-colors ${selectedPlan === plan.id ? 'border-black bg-black text-white' : 'border-gray-300'}`}
                    >
                      {selectedPlan === plan.id && <CheckIcon className="h-3 w-3" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {plan.title}
                      </h3>
                      <div className="mt-1">
                        <span className="text-2xl font-bold text-gray-900">
                          {plan.price}
                        </span>
                        <span className="text-gray-500">{plan.period}</span>
                      </div>
                    </div>
                  </div>
                  {plan.recommended && (
                    <span className="ml-4 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      RECOMMENDED
                    </span>
                  )}
                </button>

                {/* Expandable content */}
                <div
                  className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${selectedPlan === plan.id ? 'max-h-96 border-t border-gray-200 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-4">
                    <ul className="mb-4 space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-600">
                          <CheckCircleIcon className="mr-2 h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-gray-500">{plan.summary}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
                      <span>Money-back guarantee</span>
                      <span>•</span>
                      <span>Cancel anytime</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Panel - Features */}
          <div className="rounded-lg bg-gray-50 p-8">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              All subscription features
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start">
                  <feature.icon className="mr-3 h-6 w-6 text-blue-500" />
                  <div>
                    <h3 className="font-medium text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push('/onboarding/next-step')}
              disabled={!selectedPlan}
              className="mt-8 w-full rounded-lg bg-black px-8 py-3 font-medium text-white transition-colors hover:bg-black/80 disabled:bg-gray-300"
            >
              Next
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Got questions? Contact our 24/7 customer support
              </p>
            </div>
          </div>
        </div>

        {/* Company Logos Carousel */}
        <div className="mt-16 border-t border-gray-200 py-12">
          <div className="flex items-center justify-between">
            <button
              onClick={prevCompanies}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <ChevronLeftIcon className="h-6 w-6 text-gray-400" />
            </button>
            <div className="flex items-center justify-center space-x-12">
              {visibleCompanies.map((company) => (
                <div
                  key={company}
                  className="text-lg font-medium text-gray-400"
                >
                  {company}
                </div>
              ))}
            </div>
            <button
              onClick={nextCompanies}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <ChevronRightIcon className="h-6 w-6 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
