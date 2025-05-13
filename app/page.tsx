import Hero3DImage from './components/Hero3DImage';
import CompanyCarousel from './components/CompanyCarousel';
import ApplicationProcess from './components/ApplicationProcess';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ backgroundColor: '#fefcf9' }}>
      <main>
        {/* Hero Section */}
        <div className="py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center md:items-center md:grid md:grid-cols-2 gap-16 lg:gap-20">
              {/* Hero Text */}
              <div className="text-center md:text-left max-w-2xl md:max-w-xl order-1 md:order-2 md:self-center">
                <h1 className="text-[32px] md:text-[40px] leading-[1.15] tracking-tight text-[#1A1A1A]" style={{ fontFamily: 'Helvetica Neue Bold, Helvetica Neue, Helvetica, Arial, sans-serif', fontWeight: 700 }}>
                  <span className="block md:inline">Land Jobs Faster.</span>{' '}
                  <span className="block md:inline">Stay Organized Effortlessly.</span>
                </h1>
                <p className="mt-6 text-xl leading-normal text-[#1A1A1A] max-w-xl mx-auto md:mx-0">
                  From <span style={{ fontFamily: 'Helvetica Neue Bold, Helvetica Neue, Helvetica, Arial, sans-serif', fontWeight: 700, color: '#0A0F1C' }}>AI-powered applications</span> to interview scheduling and calendar syncing, Talexus streamlines every step of your job journey.
                </p>
                <div className="mt-8">
                  <Link
                    href="/signup"
                    className="inline-flex items-center px-5 py-2.5 text-[15px] font-medium rounded-[8px] text-white bg-[#0e3a68] hover:bg-[#0c3156] transition-colors"
                  >
                    Get Started →
                  </Link>
                </div>
              </div>

              {/* Hero Image */}
              <Hero3DImage />
            </div>
          </div>
        </div>

        {/* Company Carousel */}
        <div style={{ backgroundColor: '#fefcf9', paddingBottom: '2rem' }}>
          <CompanyCarousel />
        </div>

        {/* Application Process Section */}
        <div style={{ backgroundColor: '#fefcf9' }}>
          <ApplicationProcess />
        </div>

        {/* Feature Cards Section */}
        <div className="py-4 sm:py-8 -mt-8 sm:-mt-12" style={{ backgroundColor: '#fefcf9' }}>
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-center text-[24px] sm:text-[32px] text-[#1A1A1A] mb-6 sm:mb-8" style={{ fontFamily: 'Helvetica Neue Bold, Helvetica Neue, Helvetica, Arial, sans-serif', fontWeight: 700 }}>
              We don't stop until you're hired
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {/* Card 1 */}
              <div className="bg-white rounded-[20px] p-6 lg:py-8 shadow-lg hover:shadow-xl transition-shadow lg:h-[260px] flex flex-col">
                <div className="text-[#4292FF] text-3xl mb-4">→</div>
                <h3 className="text-lg font-semibold mb-2">Automate your job search</h3>
                <p className="text-gray-800 text-sm text-left">
                  We continuously scan millions of openings to find your top matches.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-[20px] p-6 lg:py-8 shadow-lg hover:shadow-xl transition-shadow lg:h-[260px] flex flex-col">
                <div className="text-[#FF69B4] text-3xl mb-4">⭕</div>
                <h3 className="text-lg font-semibold mb-2">Wake up to your best matches</h3>
                <p className="text-gray-800 text-sm text-left">
                  Start each day with a list of new roles matched to your skills and preferences.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-[20px] p-6 lg:py-8 shadow-lg hover:shadow-xl transition-shadow lg:h-[260px] flex flex-col">
                <div className="text-[#00FF00] text-3xl mb-4">⚡</div>
                <h3 className="text-lg font-semibold mb-2">10x your job applications</h3>
                <p className="text-gray-800 text-sm text-left">
                  Submit 10x as many applications with less effort than one manual application.
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-[20px] p-6 lg:py-8 shadow-lg hover:shadow-xl transition-shadow lg:h-[260px] flex flex-col">
                <div className="text-gray-700 text-3xl mb-4">⏰</div>
                <h3 className="text-lg font-semibold mb-2">Reclaim valuable hours every week</h3>
                <p className="text-gray-800 text-sm text-left">
                  Reclaim your time by letting our AI handle the grunt work of job searching.
                </p>
              </div>

              {/* Card 5 */}
              <div className="bg-white rounded-[20px] p-6 lg:py-8 shadow-lg hover:shadow-xl transition-shadow lg:h-[260px] flex flex-col">
                <div className="text-[#9370DB] text-3xl mb-4">💬</div>
                <h3 className="text-lg font-semibold mb-2">Mock interview preparation</h3>
                <p className="text-gray-800 text-sm text-left">
                  Practice with AI-powered mock interviews tailored to your target roles.
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="mt-16 bg-[#0A0F1C] rounded-[24px] p-6 sm:p-8 md:p-12 text-center">
              <h2 className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-white mb-4 sm:mb-6 md:mb-8">
                Ready to automate your job search?
              </h2>
              <Link
                href="/signup"
                className="inline-flex items-center px-5 py-2.5 sm:px-6 sm:py-3 text-[15px] sm:text-[16px] font-medium rounded-[8px] text-white bg-black hover:bg-gray-800 transition-colors outline outline-2 outline-[#39FF14]"
              >
                Find jobs →
              </Link>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: '#fefcf9' }} className="h-16"></div>
      </main>
    </div>
  );
}
