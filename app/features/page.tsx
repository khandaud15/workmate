'use client';

import Link from 'next/link';

export default function Features() {
  const features = [
    {
      title: 'Cover Letter Generator',
      description: 'Create professional, tailored cover letters in seconds using our AI-powered generator.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      link: '/cover-letter'
    },
    {
      title: 'Resume Builder',
      description: 'Build an ATS-friendly resume that stands out to recruiters.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      link: '/resume-builder'
    },
    {
      title: 'Job Search',
      description: 'Search and apply to thousands of jobs from top companies.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      link: '/jobs'
    },
    {
      title: 'Application Tracker',
      description: 'Track all your job applications in one place.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      link: '/applications'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Core Features</h1>
        <p className="text-xl text-gray-600">Everything you need for a successful job search</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <Link 
            key={index} 
            href={feature.link}
            className="group bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 hover:border-[#4292FF]"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-[#4292FF] bg-opacity-10 rounded-lg group-hover:bg-opacity-20 transition-all duration-200">
                <div className="text-[#4292FF]">
                  {feature.icon}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#4292FF] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ready to streamline your job search?</h2>
        <Link 
          href="/signup"
          className="inline-block bg-[#4292FF] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#237DFF] transition-colors"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
