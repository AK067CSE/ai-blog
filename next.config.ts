import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
  },
  // Disable strict mode for faster builds
  reactStrictMode: false,
  // Optimize for production
  swcMinify: true,
};

export default nextConfig;
