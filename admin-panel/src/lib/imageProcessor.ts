import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";

/**
 * Image Processing Utility
 *
 * Automatically converts uploaded images to optimized AVIF or WebP format.
 *
 * IMPORTANT: Writes the same file to BOTH panels' public/uploads folders
 * so that either the user panel (port 3000) or admin panel (port 3001)
 * can serve it from a relative /uploads/... URL.
 */

export interface ProcessedImage {
  filename:     string;
  path:         string;
  url:          string;
  format:       "avif" | "webp";
  width:        number;
  height:       number;
  originalSize: number;
  optimizedSize: number;
  savings:      number;
}

export interface ImageOptions {
  type?:      "product" | "banner" | "thumbnail" | "og";
  maxWidth?:  number;
  maxHeight?: number;
  quality?:   number;
  format?:    "avif" | "webp" | "auto";
}

const DEFAULTS: Record<string, ImageOptions> = {
  product:   { maxWidth: 1200, maxHeight: 1600, quality: 80 },
  thumbnail: { maxWidth: 600,  maxHeight: 800,  quality: 70 },
  banner:    { maxWidth: 1920, maxHeight: 1080, quality: 85 },
  og:        { maxWidth: 1200, maxHeight: 630,  quality: 85 },
};

// Both destinations — admin panel needs its own copy to display in admin UI
const USER_UPLOAD_DIR  = join(process.cwd(), "..", "user-panel",  "public", "uploads");
const ADMIN_UPLOAD_DIR = join(process.cwd(),                       "public", "uploads");

async function writeToBothPanels(subDir: string, filename: string, buffer: Buffer): Promise<string> {
  // Write to user panel
  const userDir  = join(USER_UPLOAD_DIR, subDir);
  await mkdir(userDir, { recursive: true });
  await writeFile(join(userDir, filename), buffer);

  // Write to admin panel too
  const adminDir = join(ADMIN_UPLOAD_DIR, subDir);
  await mkdir(adminDir, { recursive: true });
  await writeFile(join(adminDir, filename), buffer);

  return join(userDir, filename);
}

export async function processImage(
  buffer:  Buffer,
  options: ImageOptions = {}
): Promise<ProcessedImage> {
  const type     = options.type ?? "product";
  const defaults = DEFAULTS[type] ?? DEFAULTS.product;
  const maxW     = options.maxWidth  ?? defaults.maxWidth!;
  const maxH     = options.maxHeight ?? defaults.maxHeight!;
  const quality  = options.quality   ?? defaults.quality!;
  const format   = options.format    ?? "auto";

  const originalSize = buffer.length;

  const pipeline = sharp(buffer)
    .rotate()
    .resize(maxW, maxH, { fit: "inside", withoutEnlargement: true });

  let outputFormat: "avif" | "webp" = "avif";
  let outputBuffer: Buffer;

  if (format === "webp") {
    outputFormat = "webp";
    outputBuffer = await pipeline.webp({ quality, effort: 4 }).toBuffer();
  } else {
    try {
      outputBuffer = await pipeline.avif({ quality, effort: 4 }).toBuffer();
      outputFormat = "avif";
    } catch {
      outputBuffer = await pipeline.webp({ quality, effort: 4 }).toBuffer();
      outputFormat = "webp";
    }
  }

  const metadata = await sharp(outputBuffer).metadata();

  const id       = randomBytes(8).toString("hex");
  const prefix   = type === "product" ? "prod" : type === "banner" ? "banner" : type === "og" ? "og" : "img";
  const filename = `${prefix}_${id}.${outputFormat}`;

  const subDir   = type === "product" ? "products" : type === "banner" ? "banners" : "general";
  const filePath = await writeToBothPanels(subDir, filename, outputBuffer);

  const optimizedSize = outputBuffer.length;
  const savings       = Math.round((1 - optimizedSize / originalSize) * 100);
  const url           = `/uploads/${subDir}/${filename}`;

  return {
    filename,
    path:   filePath,
    url,
    format: outputFormat,
    width:  metadata.width  ?? 0,
    height: metadata.height ?? 0,
    originalSize,
    optimizedSize,
    savings: Math.max(0, savings),
  };
}

export async function processImageFromUrl(
  imageUrl: string,
  options:  ImageOptions = {}
): Promise<ProcessedImage> {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  return processImage(buffer, options);
}

export async function processImages(
  buffers: Buffer[],
  options: ImageOptions = {}
): Promise<ProcessedImage[]> {
  return Promise.all(buffers.map((b) => processImage(b, options)));
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}