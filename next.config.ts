import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  basePath: isProd ? '/ross1000-validator' : '',
  assetPrefix: isProd ? '/ross1000-validator/' : '',
  typescript: {
    ignoreBuildErrors: true,
  },
  // React Strict Mode is generally good for development
  reactStrictMode: true,
  eslint: {
    // Ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
