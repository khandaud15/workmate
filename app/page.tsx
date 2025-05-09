import FeatureCards from './components/FeatureCards';
import CompanyLogos from './components/CompanyLogos';
import Hero3DImage from './components/Hero3DImage';

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
                  <span className="block md:inline">Land Jobs Faster.</span>{' '}
                  <span className="block md:inline">Stay Organized Effortlessly.</span>
                </h1>
                <p className="mt-6 text-xl leading-normal text-[#1A1A1A] max-w-xl mx-auto md:mx-0">
                  From auto-applying to interviews to syncing your calendar, WorkMate keeps every part of your job journey on track.
                </p>
                <div className="mt-8">
                  <a
                    href="/signup"
                    className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-[8px] text-white bg-[#4292FF] hover:bg-[#237DFF] transition-colors"
                  >
                    Get Started →
                  </a>
                </div>
              </div>

              {/* Hero Image */}
              <Hero3DImage />
            </div>
          </div>
        </div>

        {/* Company Logos */}
        <CompanyLogos />

        {/* Feature Cards */}
        <FeatureCards />



        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4">
          <div className="relative group">
            {/* 3D Shadow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-200"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition duration-200 -rotate-3 scale-105"></div>
            
            {/* Main Card */}
            <section className="relative py-6 sm:py-8 bg-[#111827] rounded-2xl transform transition duration-200 hover:-translate-y-1 hover:scale-[1.02]">
              <div className="mx-auto text-center px-4">
                <h2 className="text-[24px] sm:text-[32px] font-bold text-white mb-4">Ready to automate your job search?</h2>
                <a
                  href="/jobs"
                  className="inline-flex items-center px-5 py-2.5 text-base font-semibold rounded-[6px] text-white bg-[#4292FF] hover:bg-[#237DFF] transition-colors"
                >
                  Find jobs <span className="ml-2">→</span>
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
