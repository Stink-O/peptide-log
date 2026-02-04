import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/peptide-log',
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
