import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      // Your existing Cloudinary config (Keep this)
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  output:"standalone"
};

export default nextConfig;
