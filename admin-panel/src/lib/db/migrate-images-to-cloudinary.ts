/**
 * Migration: Local /uploads/ images  ->  Cloudinary CDN
 *
 * Usage:
 *   npm run db:migrate-images -- --dry-run    (preview only, no changes)
 *   npm run db:migrate-images                 (apply for real)
 *
 * What it does:
 *   1. Scans DB tables + settings for /uploads/... URLs
 *   2. Reads each local file from user-panel/public/uploads/
 *   3. Uploads to Cloudinary in matching folders (products/banners/etc.)
 *   4. Updates DB rows and JSON settings with new Cloudinary URLs
 *   5. Idempotent: skips URLs that are already Cloudinary or external
 *
 * Safe to re-run — only migrates /uploads/... URLs, leaves everything else alone.
 */

import "dotenv/config";
import { createClient } from "@libsql/client";
import { v2 as cloudinary } from "cloudinary";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// ══════════════════════════════════════════════════════════
//  SETUP
// ══════════════════════════════════════════════════════════
const DRY_RUN = process.argv.includes("--dry-run");

// Colors for console output
const RESET  = "\x1b[0m";
const BOLD   = "\x1b[1m";
const GREEN  = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED    = "\x1b[31m";
const CYAN   = "\x1b[36m";
const DIM    = "\x1b[2m";

function log(msg: string)  { console.log(msg); }
function ok(msg: string)   { console.log(`${GREEN}[OK]${RESET}  ${msg}`); }
function warn(msg: string) { console.log(`${YELLOW}[!!]${RESET}  ${msg}`); }
function err(msg: string)  { console.log(`${RED}[XX]${RESET}  ${msg}`); }
function info(msg: string) { console.log(`${CYAN}[--]${RESET}  ${msg}`); }
function dim(msg: string)  { console.log(`${DIM}${msg}${RESET}`); }

// ─── Verify environment ──────────────────────────────────
function verifyEnv() {
  const required = [
    "TURSO_DATABASE_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    err("Missing environment variables:");
    missing.forEach((k) => err(`   - ${k}`));
    process.exit(1);
  }
}

verifyEnv();

// ─── Configure clients ───────────────────────────────────
const db = createClient({
  url:       process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

// ─── Path to user-panel's public/uploads folder ─────────
const UPLOADS_ROOT = join(process.cwd(), "..", "user-panel", "public", "uploads");

// ══════════════════════════════════════════════════════════
//  UPLOAD HELPER — with retry + folder mapping
// ══════════════════════════════════════════════════════════
interface UploadCache {
  [localUrl: string]: string;   // /uploads/products/x.avif -> https://res.cloudinary.com/...
}

const uploadCache: UploadCache = {};
const failedFiles: string[] = [];

/**
 * Convert a local /uploads/ URL into a Cloudinary URL.
 * Returns null if the local file is missing.
 * Caches results so the same file is uploaded only once.
 */
async function migrateOne(localUrl: string): Promise<string | null> {
  // Already migrated in this run
  if (uploadCache[localUrl]) return uploadCache[localUrl];

  // Not a local URL - skip
  if (!localUrl || !localUrl.startsWith("/uploads/")) {
    return localUrl || null;
  }

  // Determine sub-folder (products, banners, generals, etc.)
  const parts = localUrl.split("/").filter(Boolean);
  // e.g. ["uploads", "products", "prod_xxx.avif"]
  if (parts.length < 3) {
    warn(`Malformed URL, skipping: ${localUrl}`);
    return null;
  }

  const subDir  = parts[1];  // products / banners / general
  const filename = parts[2];
  const localPath = join(UPLOADS_ROOT, subDir, filename);

  if (!existsSync(localPath)) {
    warn(`Local file missing: ${localPath}`);
    failedFiles.push(localUrl);
    return null;
  }

  if (DRY_RUN) {
    // Just simulate
    const fakeUrl = `https://res.cloudinary.com/[CLOUD]/image/upload/denovapk/${subDir}/${filename}`;
    uploadCache[localUrl] = fakeUrl;
    ok(`[DRY-RUN]  ${localUrl}  ->  ${fakeUrl}`);
    return fakeUrl;
  }

  try {
    const buffer  = readFileSync(localPath);
    const base64  = buffer.toString("base64");
    const mime    = detectMime(buffer);
    const dataUri = `data:${mime};base64,${base64}`;

    // Map subDir to Cloudinary folder (match our upload API convention)
    const cloudFolder = `denovapk/${subDir}`;

    // Recommended dimensions per type
    const dims = subDir === "products" ? { w: 1200, h: 1600 } :
                 subDir === "banners"  ? { w: 1920, h: 1080 } :
                                          { w: 1600, h: 1600 };

    const result = await cloudinary.uploader.upload(dataUri, {
      folder:        cloudFolder,
      resource_type: "image",
      transformation: [
        { width: dims.w, height: dims.h, crop: "limit" },
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
      overwrite:       false,
      unique_filename: true,
      use_filename:    false,
    });

    uploadCache[localUrl] = result.secure_url;
    ok(`Uploaded  ${localUrl}  ->  ${result.secure_url}`);
    return result.secure_url;
  } catch (e) {
    err(`Upload failed for ${localUrl}: ${(e as Error).message}`);
    failedFiles.push(localUrl);
    return null;
  }
}

function detectMime(buf: Buffer): string {
  if (buf.length < 4) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8) return "image/jpeg";
  if (buf[0] === 0x47 && buf[1] === 0x49) return "image/gif";
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[8] === 0x57) return "image/webp";
  if (buf.slice(4, 12).toString("ascii").includes("ftyp")) return "image/avif";
  return "image/jpeg";
}

// ══════════════════════════════════════════════════════════
//  MIGRATE: product_images.url
// ══════════════════════════════════════════════════════════
async function migrateProductImages() {
  info("");
  info(`${BOLD}Scanning product_images...${RESET}`);
  const result = await db.execute("SELECT id, url FROM product_images");
  const rows = result.rows as unknown as Array<{ id: string; url: string }>;

  const localRows = rows.filter((r) => r.url?.startsWith("/uploads/"));
  info(`Found ${rows.length} images, ${localRows.length} need migration`);

  let updated = 0;
  for (const row of localRows) {
    const newUrl = await migrateOne(row.url);
    if (newUrl && newUrl !== row.url) {
      if (!DRY_RUN) {
        await db.execute({
          sql:  "UPDATE product_images SET url = ? WHERE id = ?",
          args: [newUrl, row.id],
        });
      }
      updated++;
    }
  }
  ok(`product_images: ${updated} rows updated`);
}

// ══════════════════════════════════════════════════════════
//  MIGRATE: collections.image
// ══════════════════════════════════════════════════════════
async function migrateCollections() {
  info("");
  info(`${BOLD}Scanning collections...${RESET}`);
  const result = await db.execute("SELECT id, name, image FROM collections");
  const rows = result.rows as unknown as Array<{ id: string; name: string; image: string | null }>;

  const localRows = rows.filter((r) => r.image?.startsWith("/uploads/"));
  info(`Found ${rows.length} collections, ${localRows.length} need migration`);

  let updated = 0;
  for (const row of localRows) {
    const newUrl = await migrateOne(row.image!);
    if (newUrl && newUrl !== row.image) {
      if (!DRY_RUN) {
        await db.execute({
          sql:  "UPDATE collections SET image = ?, updatedAt = unixepoch() WHERE id = ?",
          args: [newUrl, row.id],
        });
      }
      updated++;
    }
  }
  ok(`collections: ${updated} rows updated`);
}

// ══════════════════════════════════════════════════════════
//  MIGRATE: settings (JSON blobs — hero_banners, gallery, etc.)
// ══════════════════════════════════════════════════════════
async function migrateJsonSettings() {
  info("");
  info(`${BOLD}Scanning JSON settings...${RESET}`);

  // Keys that contain image references as JSON
  const KEYS_WITH_IMAGES = ["hero_banners", "gallery", "announcement_bar"];

  for (const key of KEYS_WITH_IMAGES) {
    const result = await db.execute({
      sql:  "SELECT value FROM settings WHERE key = ? LIMIT 1",
      args: [key],
    });

    if (result.rows.length === 0) {
      dim(`   (no setting for '${key}' — skipping)`);
      continue;
    }

    const raw = result.rows[0].value as string;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      warn(`Could not parse '${key}' as JSON — skipping`);
      continue;
    }

    let changed = false;
    const processed = await deepReplaceImages(parsed, () => { changed = true; });

    if (changed) {
      const newJson = JSON.stringify(processed);
      if (!DRY_RUN) {
        await db.execute({
          sql:  "UPDATE settings SET value = ?, updatedAt = unixepoch() WHERE key = ?",
          args: [newJson, key],
        });
      }
      ok(`settings.${key}: JSON updated`);
    } else {
      dim(`   settings.${key}: no local URLs found`);
    }
  }
}

/**
 * Recursively walks a value (object/array/primitive) and replaces
 * any string that starts with "/uploads/" with its Cloudinary URL.
 * Calls onChange() at least once if any replacement happens.
 */
async function deepReplaceImages(value: unknown, onChange: () => void): Promise<unknown> {
  if (typeof value === "string") {
    if (value.startsWith("/uploads/")) {
      const newUrl = await migrateOne(value);
      if (newUrl && newUrl !== value) {
        onChange();
        return newUrl;
      }
    }
    return value;
  }

  if (Array.isArray(value)) {
    const out: unknown[] = [];
    for (const item of value) {
      out.push(await deepReplaceImages(item, onChange));
    }
    return out;
  }

  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = await deepReplaceImages(v, onChange);
    }
    return out;
  }

  return value;
}

// ══════════════════════════════════════════════════════════
//  MIGRATE: order_items.image (historical snapshots)
// ══════════════════════════════════════════════════════════
async function migrateOrderItems() {
  info("");
  info(`${BOLD}Scanning order_items...${RESET}`);
  const result = await db.execute("SELECT id, image FROM order_items WHERE image LIKE '/uploads/%'");
  const rows = result.rows as unknown as Array<{ id: string; image: string }>;
  info(`Found ${rows.length} order items with local images`);

  let updated = 0;
  for (const row of rows) {
    const newUrl = await migrateOne(row.image);
    if (newUrl && newUrl !== row.image) {
      if (!DRY_RUN) {
        await db.execute({
          sql:  "UPDATE order_items SET image = ? WHERE id = ?",
          args: [newUrl, row.id],
        });
      }
      updated++;
    }
  }
  ok(`order_items: ${updated} rows updated`);
}

// ══════════════════════════════════════════════════════════
//  MIGRATE: cart_items (not needed — no image col, references product)
// ══════════════════════════════════════════════════════════
// Skipped — cart_items has no direct image column

// ══════════════════════════════════════════════════════════
//  MAIN
// ══════════════════════════════════════════════════════════
async function main() {
  console.log("");
  console.log(`${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}  DENOVA PK  --  Migrate local images to Cloudinary${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================${RESET}`);

  if (DRY_RUN) {
    console.log(`${YELLOW}${BOLD}  MODE: DRY-RUN  (no changes will be written)${RESET}`);
  } else {
    console.log(`${GREEN}${BOLD}  MODE: LIVE  (changes WILL be applied)${RESET}`);
  }

  console.log(`${DIM}  Uploads folder: ${UPLOADS_ROOT}${RESET}`);
  console.log(`${DIM}  Cloudinary:     ${process.env.CLOUDINARY_CLOUD_NAME}${RESET}`);
  console.log("");

  if (!existsSync(UPLOADS_ROOT)) {
    err(`Uploads folder does not exist: ${UPLOADS_ROOT}`);
    err("Make sure you run this from the admin-panel directory.");
    process.exit(1);
  }

  const startTime = Date.now();

  try {
    await migrateProductImages();
    await migrateCollections();
    await migrateJsonSettings();
    await migrateOrderItems();
  } catch (e) {
    console.log("");
    err("Migration crashed:");
    console.error(e);
    process.exit(1);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("");
  console.log(`${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}  SUMMARY${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`  Unique files uploaded: ${Object.keys(uploadCache).length}`);
  console.log(`  Failed files:          ${failedFiles.length}`);
  console.log(`  Elapsed:               ${elapsed}s`);

  if (failedFiles.length > 0) {
    console.log("");
    warn("Failed files:");
    failedFiles.forEach((f) => warn(`   - ${f}`));
  }

  if (DRY_RUN) {
    console.log("");
    console.log(`${YELLOW}${BOLD}This was a DRY-RUN. No changes were saved.${RESET}`);
    console.log(`${YELLOW}To apply for real, run: npm run db:migrate-images${RESET}`);
  } else {
    console.log("");
    console.log(`${GREEN}${BOLD}Migration complete!${RESET}`);
    console.log(`${GREEN}Your site now uses Cloudinary URLs. Refresh your browser to verify.${RESET}`);
  }
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    err("Uncaught error:");
    console.error(e);
    process.exit(1);
  });