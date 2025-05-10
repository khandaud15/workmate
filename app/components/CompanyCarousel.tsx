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
    <div className="bg-gray-50 py-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-[#1A1A1A]">Top companies hiring</h2>
        </div>
        <div className="overflow-hidden">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={20}
            slidesPerView={3}
            loop={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            breakpoints={{
              640: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
              768: {
                slidesPerView: 5,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 6,
                spaceBetween: 24,
              },
            }}
            className="company-carousel"
          >
            {companies.map((company) => (
              <SwiperSlide key={company.name}>
                <div className="flex items-center justify-center px-4">
                  <div className="w-[140px] h-[90px] bg-white rounded-lg shadow-sm flex items-center justify-center p-6 hover:shadow-md transition-shadow">
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
  );
}
