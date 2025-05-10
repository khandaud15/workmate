'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const companies = [
  { name: 'Airbnb', logo: 'https://raw.githubusercontent.com/khandaud15/files/main/Airbnb_logo_PNG3.png' },
  { name: 'Google', logo: 'https://raw.githubusercontent.com/khandaud15/files/main/google_PNG.png' },
  { name: 'Walmart', logo: 'https://raw.githubusercontent.com/khandaud15/files/main/Walmart_logo_PNG1.png' },
  { name: 'Tesla', logo: 'https://raw.githubusercontent.com/khandaud15/files/main/Tesla_logo_PNG2.png' },
  { name: 'PayPal', logo: 'https://raw.githubusercontent.com/khandaud15/files/main/Paypal_logo_PNG3.png' },
  { name: 'OpenAI', logo: 'https://raw.githubusercontent.com/khandaud15/files/main/OpenAI-Logo-PNG_004.png' },
  { name: 'Meta', logo: 'https://raw.githubusercontent.com/khandaud15/files/main/Meta_Logo_PNG7.png' },
  { name: 'Dell', logo: 'https://raw.githubusercontent.com/khandaud15/files/main/Dell_logo_PNG1.png' },
  { name: 'Cisco', logo: 'https://raw.githubusercontent.com/khandaud15/files/main/Cisco_logo_PNG2.png' },
  { name: 'Amazon', logo: 'https://raw.githubusercontent.com/khandaud15/files/main/Amazon-Logo.png' },
  { name: 'Apple', logo: 'https://raw.githubusercontent.com/khandaud15/files/main/Apple_logo_PNG1.png' },
];

export default function CompanyCarousel() {
  return (
    <div className="bg-gray-50 pt-4 pb-6">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-semibold text-[#1A1A1A]">Top companies hiring</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 transform-gpu hover:shadow-xl transition-shadow duration-300">
          <div className="max-w-[1100px] mx-auto">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={20}
            slidesPerView={2}
            loop={true}
            centeredSlides={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            breakpoints={{
              640: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              768: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 5,
                spaceBetween: 24,
              },
            }}
            className="company-carousel"
          >
            {companies.map((company) => (
              <SwiperSlide key={company.name}>
                <div className="flex items-center justify-center px-2">
                  <div className="w-[120px] aspect-[4/3] bg-white/50 backdrop-blur-sm rounded-xl shadow-md flex items-center justify-center p-4 hover:shadow-xl hover:-translate-y-1 hover:bg-white transition-all duration-300 ease-in-out transform-gpu">
                    <img
                      src={company.logo}
                      alt={`${company.name} logo`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          </div>
        </div>
      </div>
    </div>
  );
}
