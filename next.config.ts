import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true, // Partial Prerendering を有効化 (Next.js 16+)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;
