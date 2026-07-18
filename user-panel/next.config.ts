import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "http",  hostname: "localhost" },
      { protocol: "https", hostname: "denovapk.com" },
      { protocol: "https", hostname: "*.hostonme.dev" },
    ],
  },
};

export default nextConfig;