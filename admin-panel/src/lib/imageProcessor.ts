import { v2 as cloudinary } from "cloudinary";

/**
 * Image Processing Utility — CLOUDINARY EDITION
 *
 * Uploads images to Cloudinary CDN instead of local disk.
 *
 * Benefits over local storage:
 *   - Persistent (survives Docker rebuilds and deployments)
 *   - Global CDN delivery
 *   - Auto-optimization per browser (f_auto, q_auto)
 *   - Automatic AVIF/WebP conversion
 *   - Free tier: 25 GB storage + 25 GB bandwidth/month
 *
 * Cloudinary credentials come from environment variables:
 *   - CLOUDINARY_CLOUD_NAME
 *   - CLOUDINARY_API_KEY
 *   - CLOUDINARY_API_SECRET
 */

// Configure Cloudinary once (module-level)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

// ─── Types ───────────────────────────────────────────────
export interface ProcessedImage {
  filename:      string;
  path:          string;
  url:           string;
  format:        string;
  width:         number;
  height:        number;
  originalSize:  number;
  optimizedSize: number;
  savings:       number;
}

export interface ImageOptions {
  type?:      "product" | "banner" | "thumbnail" | "og" | "gallery" | "general";
  maxWidth?:  number;
  maxHeight?: number;
  quality?:   number;
}

// Recommended max dimensions per image type (Cloudinary auto-resizes)
const DEFAULTS: Record<string, { maxWidth: number; maxHeight: number }> = {
  product:   { maxWidth: 1200, maxHeight: 1600 },
  thumbnail: { maxWidth: 600,  maxHeight: 800  },
  banner:    { maxWidth: 1920, maxHeight: 1080 },
  gallery:   { maxWidth: 1400, maxHeight: 1400 },
  og:        { maxWidth: 1200, maxHeight: 630  },
  general:   { maxWidth: 1600, maxHeight: 1600 },
};

// ─── Guard: verify Cloudinary is configured ─────────────
function assertConfigured() {
  if (!process.env.CLOUDINARY_CLOUD_NAME
   || !process.env.CLOUDINARY_API_KEY
   || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error(
      "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, " +
      "CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file."
    );
  }
}

// ─── Upload a buffer to Cloudinary ──────────────────────
export async function processImage(
  buffer:  Buffer,
  options: ImageOptions = {}
): Promise<ProcessedImage> {
  assertConfigured();

  const type     = options.type ?? "product";
  const defaults = DEFAULTS[type] ?? DEFAULTS.product;
  const maxW     = options.maxWidth  ?? defaults.maxWidth;
  const maxH     = options.maxHeight ?? defaults.maxHeight;

  const originalSize = buffer.length;

  // Folder inside your Cloudinary account
  const folder = `denovapk/${type === "product" ? "products" : type + "s"}`;

  // Convert buffer to base64 data URI (Cloudinary supports this input)
  const base64 = buffer.toString("base64");
  const mime   = detectMime(buffer);
  const dataUri = `data:${mime};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    // Server-side transformations applied at UPLOAD time
    transformation: [
      { width: maxW, height: maxH, crop: "limit" },  // resize down only, never up
      { quality: "auto:good" },                       // smart quality
      { fetch_format: "auto" },                       // best format per browser
    ],
    // Additional options
    overwrite:  false,
    unique_filename: true,
    use_filename:    false,
  });

  return {
    filename:      result.public_id.split("/").pop() ?? result.public_id,
    path:          result.public_id,
    url:           result.secure_url,
    format:        result.format,
    width:         result.width,
    height:        result.height,
    originalSize,
    optimizedSize: result.bytes,
    savings:       Math.max(0, Math.round((1 - result.bytes / originalSize) * 100)),
  };
}

// ─── Upload from a public URL to Cloudinary ─────────────
export async function processImageFromUrl(
  imageUrl: string,
  options:  ImageOptions = {}
): Promise<ProcessedImage> {
  assertConfigured();

  const type     = options.type ?? "product";
  const defaults = DEFAULTS[type] ?? DEFAULTS.product;
  const maxW     = options.maxWidth  ?? defaults.maxWidth;
  const maxH     = options.maxHeight ?? defaults.maxHeight;

  const folder = `denovapk/${type === "product" ? "products" : type + "s"}`;

  // Cloudinary can fetch remote images directly
  const result = await cloudinary.uploader.upload(imageUrl, {
    folder,
    resource_type: "image",
    transformation: [
      { width: maxW, height: maxH, crop: "limit" },
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
    overwrite:  false,
    unique_filename: true,
    use_filename:    false,
  });

  return {
    filename:      result.public_id.split("/").pop() ?? result.public_id,
    path:          result.public_id,
    url:           result.secure_url,
    format:        result.format,
    width:         result.width,
    height:        result.height,
    originalSize:  result.bytes,   // Unknown for URL uploads
    optimizedSize: result.bytes,
    savings:       0,
  };
}

// ─── Bulk upload ─────────────────────────────────────────
export async function processImages(
  buffers: Buffer[],
  options: ImageOptions = {}
): Promise<ProcessedImage[]> {
  return Promise.all(buffers.map((b) => processImage(b, options)));
}

// ─── Delete an image from Cloudinary ────────────────────
export async function deleteImage(publicIdOrUrl: string): Promise<boolean> {
  assertConfigured();
  try {
    const publicId = extractPublicId(publicIdOrUrl);
    if (!publicId) return false;
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (err) {
    console.error("Cloudinary delete failed:", err);
    return false;
  }
}

// ─── Helpers ─────────────────────────────────────────────
export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024)        return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

/**
 * Detect image MIME type from buffer magic numbers.
 * Falls back to jpeg if unknown (Cloudinary will still handle it).
 */
function detectMime(buf: Buffer): string {
  if (buf.length < 4) return "image/jpeg";

  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50) return "image/png";
  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8) return "image/jpeg";
  // GIF
  if (buf[0] === 0x47 && buf[1] === 0x49) return "image/gif";
  // WebP
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[8] === 0x57) return "image/webp";
  // AVIF (heuristic — checks for "ftypavif" around offset 4)
  if (buf.slice(4, 12).toString("ascii").includes("ftyp")) return "image/avif";

  return "image/jpeg";
}

/**
 * Extract Cloudinary public_id from either a full URL or a bare public_id.
 * Examples:
 *   https://res.cloudinary.com/xxx/image/upload/v123/denovapk/products/abc.jpg -> denovapk/products/abc
 *   denovapk/products/abc -> denovapk/products/abc
 */
function extractPublicId(input: string): string | null {
  if (!input) return null;

  // Bare public_id (no URL)
  if (!input.startsWith("http")) return input.replace(/\.[^/.]+$/, "");

  // Full URL — extract everything after /upload/(vNNN/)?
  const match = input.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/i);
  return match ? match[1] : null;
}