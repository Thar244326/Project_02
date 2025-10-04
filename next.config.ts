import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  basePath: '/app/Project_02',
  assetPrefix: '/app/Project_02',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
  },
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
