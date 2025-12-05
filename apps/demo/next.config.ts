import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@indxsearch/intrface', '@indxsearch/systm', '@indxsearch/pixl'],
  eslint: {
    // Allow production builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to complete even with TypeScript errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
