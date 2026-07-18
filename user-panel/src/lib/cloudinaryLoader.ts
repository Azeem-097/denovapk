/**
 * Cloudinary loader for next/image.
 *
 * Bypasses Next.js's built-in image optimizer (which runs on our
 * hostonme.dev server and adds latency). Instead, Cloudinary handles
 * everything — resizing, format conversion, quality — at their global CDN.
 *
 * How it works:
 *   Any <Image src="https://res.cloudinary.com/..." /> gets rewritten
 *   to include Cloudinary transforms based on the width Next.js requests.
 *
 * If a src is NOT a Cloudinary URL (Unsplash, localhost, etc.), we pass
 * it through unchanged.
 *
 * Transforms applied to Cloudinary URLs:
 *   f_auto        → AVIF for modern browsers, WebP fallback, JPG for old
 *   q_auto        → Cloudinary picks the best quality/size ratio
 *   c_limit       → never upscales beyond source resolution
 *   w_<width>     → matches the width Next.js requests based on `sizes`
 *   dpr_auto      → respects device pixel ratio (crisp on Retina)
 */

interface LoaderProps {
  src:     string;
  width:   number;
  quality?: number;
}

export default function cloudinaryLoader({ src, width, quality }: LoaderProps): string {
  // Non-Cloudinary URLs (Unsplash, local, etc.) — return as-is.
  // Next.js will still try to optimize them via /_next/image but
  // that's fine because they're not our main product images.
  if (!src.includes("res.cloudinary.com")) {
    return src;
  }

  // Parse Cloudinary URL: split into base + version/publicId
  // Example:
  //   https://res.cloudinary.com/djy5qqco7/image/upload/v123/folder/name.jpg
  //   base = https://res.cloudinary.com/djy5qqco7/image/upload
  //   rest = v123/folder/name.jpg
  const uploadIdx = src.indexOf("/upload/");
  if (uploadIdx === -1) return src; // Malformed URL — don't touch it

  const base = src.substring(0, uploadIdx + 8); // includes "/upload/"
  let rest   = src.substring(uploadIdx + 8);

  // If the URL already has transforms (starts with letters like "f_", "w_",
  // "e_trim", etc. before the version "v..."), remove them so we can
  // apply our own. Our transforms take precedence and produce the
  // right size for the requested `width` prop.
  //
  // A transform section always ends before a "/vNUMBER/" segment.
  const versionMatch = rest.match(/^([^/]+)\/(v\d+\/.+)$/);
  if (versionMatch && !versionMatch[1].startsWith("v")) {
    // First segment is transforms (e.g. "f_auto,q_auto:best,c_limit,w_1600")
    // Drop it. Keep everything from "v..." onwards.
    rest = versionMatch[2];
  }

  // Build our transforms
  const q = quality ?? 75;
  const transforms = [
    "f_auto",         // Best format per browser
    `q_auto:good`,    // Smart quality (or use quality prop if provided)
    "c_limit",        // Don't upscale
    `w_${width}`,     // Match Next.js's requested width
    "dpr_auto",       // Retina support
  ];

  // If a specific quality is requested (e.g. quality={90}), use it
  if (quality && quality !== 75) {
    transforms[1] = `q_${quality}`;
  }

  return `${base}${transforms.join(",")}/${rest}`;
}