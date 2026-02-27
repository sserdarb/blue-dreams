import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // output: 'standalone', // Disabled for Nixpacks compatibility (fixes 400 Bad Request on _next/static)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bluedreamsresort.com',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(process.cwd()),
    };
    return config;
  },
};

export default nextConfig;
