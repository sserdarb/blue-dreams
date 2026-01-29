import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bluedreamsresort.com',
      },
    ],
  },
};

export default nextConfig;
