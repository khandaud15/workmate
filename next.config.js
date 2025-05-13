/** @type {import('next').NextConfig} */
const nextConfig = {
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  images: {
    domains: ['raw.githubusercontent.com'],
  },
};

module.exports = nextConfig;
