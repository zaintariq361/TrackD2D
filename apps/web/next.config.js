/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ hostname: 'logo.clearbit.com' }, { hostname: 'api.dicebear.com' }] },
  env: { NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000' },
};
module.exports = nextConfig;
