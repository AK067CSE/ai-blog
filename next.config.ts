import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
    dirs: [],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
    unoptimized: true,
  },
  // Disable strict mode for faster builds
  reactStrictMode: false,
  // Optimize for production
  swcMinify: true,
  // Disable source maps for faster builds
  productionBrowserSourceMaps: false,
  // Skip static generation for dynamic pages
  output: 'standalone',
};

export default nextConfig;
