import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images:{
    remotePatterns:[new URL("https://picsum.photos/800/400"),
      new URL("https://i8qy5y6gxkdgdcv9.public.blob.vercel-storage.com/storefront/**")
    ]
  }
};

export default nextConfig;
