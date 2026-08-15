/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['10.40.39.103:3000', 'localhost:3000', '0.0.0.0:3000'],
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'aljo-fashion.vercel.app' },
    ],
  },
};

export default nextConfig;
