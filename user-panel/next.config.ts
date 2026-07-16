import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Explicit turbopack root to silence multi-lockfile warning
  turbopack: {
    root: path.join(__dirname),
  },

  // Optimized images with modern formats
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },

  // Note: Removed experimental.optimizeCss because it requires the
  // 'critters' package which is broken/deprecated in Next.js 16
};

export default nextConfig;