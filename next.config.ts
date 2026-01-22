import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@prisma/client", 
    "prisma", 
    "@prisma/adapter-pg", // Include this since you use the pool adapter
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', }
    ],
  },
  output:"standalone"
};

export default nextConfig;
