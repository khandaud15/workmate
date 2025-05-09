import Hero3DImage from './components/Hero3DImage';
import Link from 'next/link';

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
                  <Link
                    href="/signup"
                    className="inline-flex items-center px-5 py-2.5 text-[15px] font-medium rounded-[8px] text-white bg-[#4292FF] hover:bg-[#237DFF] transition-colors"
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


      </main>
    </div>
  );
}
