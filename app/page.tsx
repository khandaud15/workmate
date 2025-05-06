import Pricing from './components/Pricing';

import FeatureCards from './components/FeatureCards';

export default function Home() {
  return (
    <div>
      <main>
        {/* Hero Section */}
        <div className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center md:items-center md:grid md:grid-cols-2 gap-16 lg:gap-20">
              {/* Hero Text */}
              <div className="text-center md:text-left max-w-2xl md:max-w-xl order-1 md:order-2 md:self-center">
                <h1 className="text-[40px] md:text-[52px] leading-[1.15] tracking-tight font-extrabold text-black">
                  <span className="block">Cast a wider net — 10x</span>
                  <span className="block">your job applications<span className="text-sm align-top ml-0.5">1</span></span>
                </h1>
                <p className="mt-6 text-xl leading-normal text-[#1A1A1A] max-w-xl mx-auto md:mx-0">
                  Our AI-powered job search automation platform continuously finds and
                  applies to relevant job openings until you're hired
                </p>
                <div className="mt-8">
                  <a
                    href="/signup"
                    className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-full text-white bg-[#0066F5] hover:bg-[#0052CC] transition-colors"
                  >
                    Get Started →
                  </a>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative order-2 md:order-1 w-full max-w-xl md:max-w-none">
                <div className="aspect-[4/3] relative rounded-2xl overflow-hidden bg-[#F5F5F5]">
                  <img
                    src="https://raw.githubusercontent.com/khandaud15/files/main/main1.png"
                    alt="Job Applications"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <FeatureCards />

        {/* Pricing Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-100 pointer-events-none" />
          <div className="relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-4 text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
                Choose Your Plan
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Start automating your job search today
              </p>
            </div>
            <Pricing />
          </div>
        </section>
      </main>
    </div>
  );
}
