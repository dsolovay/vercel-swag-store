import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images:{
    remotePatterns:[new URL("https://picsum.photos/800/400")]
  }
};

export default nextConfig;
