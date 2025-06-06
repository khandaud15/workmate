'use client';

import React, { useState } from 'react';
import {
  ArrowLeftIcon,
  InformationCircleIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
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
    id: 'basic',
    title: 'Basic Plan',
    price: '$2.95',
    period: '/month',
    features: [
      'Up to 15 job applications per day',
      'Single resume profile',
      'Basic job matching',
      'Email support'
    ],
    summary: 'Perfect for those just starting their job search.'
  },
  {
    id: 'pro',
    title: 'Pro Plan',
    price: '$13.95',
    period: '/month',
    features: [
      'Up to 150 job applications per day',
      'Up to 5 resume profiles',
      'Advanced job matching',
      'Priority email support',
      'Custom job alerts'
    ],
    summary: 'Best for active job seekers.',
    recommended: true
  },
  {
    id: 'enterprise',
    title: 'Enterprise Plan',
    price: '$10.95',
    period: '/month',
    features: [
      'Unlimited job applications',
      'Unlimited resume profiles',
      'AI-powered job matching',
      '24/7 priority support',
      'Custom job alerts',
      'Analytics dashboard'
    ],
    summary: 'For professionals seeking the ultimate job search tool.'
  },
  {
    id: 'free',
    title: 'Skip Payment',
    price: 'Free',
    period: '',
    features: [
      'Up to 3 job applications per day',
      'Single resume profile',
      'Basic job matching',
      'Community support',
      'Limited access to features'
    ],
    summary: 'Basic access with core features.'
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

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-6 py-8 text-center lg:px-8">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Land Jobs Faster. Stay Organized Effortlessly.
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          From auto-applying to interviews to syncing your calendar, Workmate keeps every part of your job journey on track.
        </p>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[400px_1fr]">
          {/* Left Panel - Plan Selection */}
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative w-full overflow-hidden rounded-2xl border-2 transition-all ${selectedPlan === plan.id ? 'border-black' : 'border-gray-200'}`}
              >
                {/* Header with checkbox */}
                <button
                  onClick={() => setSelectedPlan(plan.id === selectedPlan ? null : plan.id)}
                  className={`flex w-full items-center justify-between p-4 hover:bg-gray-50 rounded-t-2xl ${selectedPlan === plan.id ? 'bg-gray-50' : ''}`}
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
          <div className="transform rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-black/5 transition-all hover:scale-[1.01] hover:shadow-2xl">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              All subscription features
            </h2>
            <div className="relative grid gap-6 sm:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group flex items-start rounded-xl p-3 transition-colors hover:bg-gray-50"
                >
                  <div className="shrink-0">
                    <feature.icon className="mr-3 h-6 w-6 text-black transition-transform group-hover:scale-110" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-black">{feature.title}</h3>
                    <p className="text-sm text-gray-500 group-hover:text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                <ArrowLeftIcon className="mr-1 h-4 w-4" />
                Back
              </button>
              <button
                onClick={() => {
                  if (selectedPlan) {
                    // Handle plan selection
                    console.log('Selected plan:', selectedPlan);
                  }
                }}
                disabled={!selectedPlan}
                className="rounded-lg bg-black px-8 py-2.5 font-medium text-white transition-colors hover:bg-black/80 disabled:bg-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
