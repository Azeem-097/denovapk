import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },

  images: {
    // ═══════════════════════════════════════════════════════
    //  Custom loader for Cloudinary images.
    //
    //  All <Image src="https://res.cloudinary.com/..."> URLs
    //  will now go DIRECTLY to Cloudinary's global CDN with
    //  auto-format, auto-quality, and proper sizing.
    //
    //  This skips /_next/image entirely for Cloudinary sources,
    //  saving 500-1500ms per image and freeing our server's CPU.
    //
    //  Non-Cloudinary URLs (Unsplash, etc.) still go through
    //  Next.js's default optimizer.
    // ═══════════════════════════════════════════════════════
    loader: "custom",
    loaderFile: "./src/lib/cloudinaryLoader.ts",

    // Kept for reference (used by non-Cloudinary sources)
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