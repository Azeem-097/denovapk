/**
 * Adds `bgColor` column to products table.
 * Safe to re-run — checks if column exists first.
 *
 * Usage:  npx tsx src/lib/db/add-bgcolor-column.ts
 */
import "dotenv/config";
import { createClient } from "@libsql/client";

async function run() {
  const url       = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("Missing TURSO_DATABASE_URL");
    process.exit(1);
  }

  const db = createClient({ url, authToken });
  console.log("Connecting to Turso...");

  // Check if column already exists
  const info = await db.execute("PRAGMA table_info(products);");
  const hasColumn = info.rows.some((r) => (r.name as string) === "bgColor");

  if (hasColumn) {
    console.log("Column `bgColor` already exists on products. Nothing to do.");
    process.exit(0);
  }

  console.log("Adding `bgColor` column to products table...");
  await db.execute("ALTER TABLE products ADD COLUMN bgColor TEXT;");
  console.log("Done. Column added successfully.");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});