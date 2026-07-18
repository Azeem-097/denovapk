/**
 * FIXED: Uses upload_large + extended timeout for reliable big-file upload.
 * Uploads newsletter.png at FULL resolution to Cloudinary.
 *
 * Usage: npx tsx src/lib/db/upload-newsletter-hires.ts
 */
import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import { existsSync, statSync } from "fs";
import { join } from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
  // Bump timeout to 3 minutes for large files
  timeout:    180000,
});

async function main() {
  const sourcePath = join(process.cwd(), "..", "user-panel", "public", "uploads", "general", "newsletter.png");

  if (!existsSync(sourcePath)) {
    console.error(`File not found: ${sourcePath}`);
    process.exit(1);
  }

  const stats = statSync(sourcePath);
  console.log(`Reading source: ${sourcePath}`);
  console.log(`Source size: ${(stats.size / 1024).toFixed(1)} KB (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  console.log("");
  console.log("Uploading via upload_large (chunked, streaming)...");
  console.log("This is slower but much more reliable for big files.");
  console.log("");

  // upload_large streams the file in 20MB chunks — perfect for our 1.7MB PNG
  // and won't time out. Also uploads as raw binary (no base64 overhead).
  const result = await new Promise<{
    public_id: string; version: number; width: number; height: number;
    format: string; bytes: number; secure_url: string;
  }>((resolve, reject) => {
    cloudinary.uploader.upload_large(
      sourcePath,
      {
        folder:          "denovapk/general",
        resource_type:   "image",
        overwrite:       false,
        unique_filename: false,
        use_filename:    false,
        public_id:       `newsletter_hires_${Date.now()}`,
        chunk_size:      6000000,   // 6MB chunks
        timeout:         180000,     // 3 min per chunk
      },
      (error, result) => {
        if (error) reject(error);
        else if (result) resolve(result as {
          public_id: string; version: number; width: number; height: number;
          format: string; bytes: number; secure_url: string;
        });
        else reject(new Error("No result from Cloudinary"));
      }
    );
  });

  console.log("═══════════════════════════════════════════════════════");
  console.log("  SUCCESS!");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
  console.log(`  Public ID:  ${result.public_id}`);
  console.log(`  Version:    v${result.version}`);
  console.log(`  Dimensions: ${result.width} x ${result.height}`);
  console.log(`  Format:     ${result.format}`);
  console.log(`  File size:  ${(result.bytes / 1024).toFixed(1)} KB`);
  console.log("");
  console.log("  Full URL:");
  console.log(`  ${result.secure_url}`);
  console.log("");
  console.log("  Delivery URL template (use this in code):");
  console.log(`  https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto:best,w_XXX/v${result.version}/${result.public_id}`);
  console.log("");
}

main().catch((e) => {
  console.error("Upload failed:");
  console.error(e);
  process.exit(1);
});