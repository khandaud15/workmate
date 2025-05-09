'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const companies = [
  { name: 'Microsoft', logo: 'https://raw.githubusercontent.com/khandaud15/files/main/microsoft.png' },
  { name: 'Amazon', logo: 'https://raw.githubusercontent.com/khandaud15/files/main/amazon.png' },
  { name: 'Meta', logo: 'https://raw.githubusercontent.com/khandaud15/files/main/meta.png' },
  { name: 'Netflix', logo: 'https://raw.githubusercontent.com/khandaud15/files/main/netflix.png' },
  { name: 'Uber', logo: 'https://raw.githubusercontent.com/khandaud15/files/main/uber.png' },
  { name: 'Apple', logo: 'https://raw.githubusercontent.com/khandaud15/files/main/apple.png' },
  { name: 'Google', logo: 'https://raw.githubusercontent.com/khandaud15/files/main/google.png' },
];

export default function CompanyCarousel() {
  return (
    <div className="py-4 sm:py-16 bg-white overflow-hidden">
      <div className="max-w-[300px] sm:max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <h2 className="text-base sm:text-2xl font-bold text-center mb-3 sm:mb-12 text-[#1A1A1A]">
          Top companies hiring
        </h2>
        <Swiper
          modules={[Autoplay]}
          spaceBetween={8}
          slidesPerView={1.2}
          loop={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
            768: {
              slidesPerView: 4,
              spaceBetween: 30,
            },
            1024: {
              slidesPerView: 5,
              spaceBetween: 30,
            },
          }}
          className="company-carousel"
        >
          {companies.map((company) => (
            <SwiperSlide key={company.name}>
              <div className="flex items-center justify-center h-8 sm:h-20 px-1 sm:px-6">
                <img
                  src={company.logo}
                  alt={`${company.name} logo`}
                  className="h-3 sm:h-6 md:h-8 object-contain opacity-60 hover:opacity-100 transition-all duration-300"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
