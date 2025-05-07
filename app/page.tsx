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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {/* Build Image */}
              <div className="transform transition-all duration-300 hover:scale-[1.02] hover:-rotate-1">
                <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-shadow duration-300">
                  <img
                    src="https://raw.githubusercontent.com/khandaud15/files/main/build.png"
                    alt="Build your profile"
                    className="w-full rounded-lg"
                  />
                </div>
              </div>

              {/* Apply Image */}
              <div className="transform transition-all duration-300 hover:scale-[1.02] hover:-rotate-1">
                <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-shadow duration-300">
                  <img
                    src="https://raw.githubusercontent.com/khandaud15/files/main/apply.png"
                    alt="Apply to jobs"
                    className="w-full rounded-lg"
                  />
                </div>
              </div>

              {/* Stay Organized Image */}
              <div className="transform transition-all duration-300 hover:scale-[1.02] hover:-rotate-1">
                <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-shadow duration-300">
                  <img
                    src="https://raw.githubusercontent.com/khandaud15/files/main/stay_organized.png"
                    alt="Stay organized"
                    className="w-full rounded-lg"
                  />
                </div>
              </div>

              {/* Mock Image */}
              <div className="transform transition-all duration-300 hover:scale-[1.02] hover:-rotate-1">
                <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-shadow duration-300">
                  <img
                    src="https://raw.githubusercontent.com/khandaud15/files/main/mock.png"
                    alt="Mock interviews"
                    className="w-full rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
