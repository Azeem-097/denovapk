/**
 * Generic hires uploader — uploads ANY image at full resolution to Cloudinary.
 * Uses upload_large (streaming) to handle big files reliably.
 *
 * Usage:
 *   npx tsx src/lib/db/upload-any-image-hires.ts <relativePath> <folder>
 *
 * Example:
 *   npx tsx src/lib/db/upload-any-image-hires.ts ../user-panel/public/uploads/general/logo.jpeg general
 */
import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import { existsSync, statSync } from "fs";
import { basename, extname, join } from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
  timeout:    180000,
});

async function main() {
  const relPath = process.argv[2];
  const folder  = process.argv[3] ?? "general";

  if (!relPath) {
    console.error("Usage: tsx upload-any-image-hires.ts <path> [folder]");
    process.exit(1);
  }

  const sourcePath = join(process.cwd(), relPath);
  if (!existsSync(sourcePath)) {
    console.error(`File not found: ${sourcePath}`);
    process.exit(1);
  }

  const stats = statSync(sourcePath);
  const filename = basename(sourcePath, extname(sourcePath));

  console.log(`Reading: ${sourcePath}`);
  console.log(`Size:    ${(stats.size / 1024).toFixed(1)} KB`);
  console.log(`Folder:  denovapk/${folder}`);
  console.log("");
  console.log("Uploading (chunked, streaming, no downscale)...");
  console.log("");

  const result = await new Promise<{
    public_id: string; version: number; width: number; height: number;
    format: string; bytes: number; secure_url: string;
  }>((resolve, reject) => {
    cloudinary.uploader.upload_large(
      sourcePath,
      {
        folder:          `denovapk/${folder}`,
        resource_type:   "image",
        overwrite:       false,
        unique_filename: false,
        use_filename:    false,
        public_id:       `${filename}_${Date.now()}`,
        chunk_size:      6000000,
        timeout:         180000,
      },
      (error, res) => {
        if (error) reject(error);
        else if (res) resolve(res as {
          public_id: string; version: number; width: number; height: number;
          format: string; bytes: number; secure_url: string;
        });
        else reject(new Error("No result from Cloudinary"));
      }
    );
  });

  console.log("SUCCESS!");
  console.log("");
  console.log(`  Public ID:  ${result.public_id}`);
  console.log(`  Version:    v${result.version}`);
  console.log(`  Dimensions: ${result.width} x ${result.height}`);
  console.log(`  Format:     ${result.format}`);
  console.log(`  File size:  ${(result.bytes / 1024).toFixed(1)} KB`);
  console.log("");
  console.log(`  URL: ${result.secure_url}`);
  console.log("");
}

main().catch((e) => {
  console.error("Upload failed:", e);
  process.exit(1);
});