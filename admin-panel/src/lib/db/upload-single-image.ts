/**
 * One-shot: upload a single local file to Cloudinary.
 * Usage:
 *   npx tsx src/lib/db/upload-single-image.ts <path> <folder>
 *
 * Example:
 *   npx tsx src/lib/db/upload-single-image.ts ../user-panel/public/uploads/general/AboutUs.png general
 */
import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import { readFileSync, existsSync } from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

function detectMime(buf: Buffer): string {
  if (buf[0] === 0x89 && buf[1] === 0x50) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8) return "image/jpeg";
  if (buf[0] === 0x47 && buf[1] === 0x49) return "image/gif";
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[8] === 0x57) return "image/webp";
  if (buf.slice(4, 12).toString("ascii").includes("ftyp")) return "image/avif";
  return "image/jpeg";
}

async function main() {
  const path   = process.argv[2];
  const folder = process.argv[3] ?? "general";

  if (!path) {
    console.error("Usage: tsx upload-single-image.ts <path> [folder]");
    process.exit(1);
  }

  if (!existsSync(path)) {
    console.error(`File not found: ${path}`);
    process.exit(1);
  }

  console.log(`Uploading ${path} to Cloudinary...`);
  const buffer  = readFileSync(path);
  const base64  = buffer.toString("base64");
  const mime    = detectMime(buffer);
  const dataUri = `data:${mime};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder:        `denovapk/${folder}`,
    resource_type: "image",
    transformation: [
      { width: 1200, height: 1600, crop: "limit" },
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
    overwrite:       false,
    unique_filename: true,
    use_filename:    false,
  });

  console.log("");
  console.log("SUCCESS! Cloudinary URL:");
  console.log("");
  console.log(`  ${result.secure_url}`);
  console.log("");
  console.log(`  (${result.bytes} bytes, ${result.width}x${result.height})`);
}

main().catch((e) => { console.error(e); process.exit(1); });