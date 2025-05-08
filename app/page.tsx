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

        {/* Process Images Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-[24px] md:text-[28px] leading-[1.3] font-semibold text-black text-center mb-12">
              AI that applies and syncs — so you don't have to
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {/* Build Image */}
              <div className="transform transition-all duration-300 hover:scale-[1.02] hover:-rotate-1">
                <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-shadow duration-300">
                  <img
                    src="https://raw.githubusercontent.com/khandaud15/files/main/1.png"
                    alt="Build your profile"
                    className="w-full h-auto max-w-[280px] mx-auto rounded-lg relative z-10"
                  />
                </div>
              </div>

              {/* Apply Image */}
              <div className="w-full transform hover:-rotate-6 transition-transform duration-300">
                <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-50 rounded-xl"></div>
                  <img
                    src="https://raw.githubusercontent.com/khandaud15/files/main/2.png"
                    alt="AI Cover Letter"
                    className="w-full h-auto max-w-[280px] mx-auto rounded-lg relative z-10"
                  />
                </div>
              </div>

              {/* Stay Organized Image */}
              <div className="w-full transform hover:-rotate-6 transition-transform duration-300">
                <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-50 rounded-xl"></div>
                  <img
                    src="https://raw.githubusercontent.com/khandaud15/files/main/3.png"
                    alt="AI Resume Builder"
                    className="w-full h-auto max-w-[280px] mx-auto rounded-lg relative z-10"
                  />
                </div>
              </div>

              {/* Mock Image */}
              <div className="w-full transform hover:-rotate-6 transition-transform duration-300">
                <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-50 rounded-xl"></div>
                  <img
                    src="https://raw.githubusercontent.com/khandaud15/files/main/4.png"
                    alt="Mock Interviews"
                    className="w-full h-auto max-w-[280px] mx-auto rounded-lg relative z-10"
                  />
                </div>
              </div>

              {/* Image 5 */}
              <div className="w-full transform hover:-rotate-6 transition-transform duration-300">
                <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-50 rounded-xl"></div>
                  <img
                    src="https://raw.githubusercontent.com/khandaud15/files/main/5.png"
                    alt="AI Job Search"
                    className="w-full h-auto max-w-[280px] mx-auto rounded-lg relative z-10"
                  />
                </div>
              </div>

              {/* Image 6 */}
              <div className="w-full transform hover:-rotate-6 transition-transform duration-300">
                <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-50 rounded-xl"></div>
                  <img
                    src="https://raw.githubusercontent.com/khandaud15/files/main/6.png"
                    alt="AI Interview Prep"
                    className="w-full h-auto max-w-[280px] mx-auto rounded-lg relative z-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <div className="mx-4 sm:mx-8 my-8">
          <div className="relative group">
            {/* 3D Shadow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-200"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition duration-200 -rotate-3 scale-105"></div>
            
            {/* Main Card */}
            <section className="relative py-16 bg-[#111827] rounded-3xl transform transition duration-200 hover:-translate-y-1 hover:scale-[1.02]">
              <div className="max-w-4xl mx-auto text-center px-4">
                <h2 className="text-[32px] sm:text-[40px] font-bold text-white mb-8">Ready to automate your job search?</h2>
                <a
                  href="/jobs"
                  className="inline-flex items-center px-6 py-3 text-base font-semibold rounded-[8px] text-white bg-[#4292FF] hover:bg-[#237DFF] transition-colors"
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
