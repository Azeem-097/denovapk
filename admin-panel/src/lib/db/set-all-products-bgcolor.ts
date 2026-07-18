/**
 * One-time bulk update: sets bgColor = "#eeeeee" (Soft Gray) on ALL products.
 * Safe to re-run — will overwrite any existing bgColor values.
 *
 * Usage:  npx tsx src/lib/db/set-all-products-bgcolor.ts
 */
import "dotenv/config";
import { createClient } from "@libsql/client";

const TARGET_COLOR = "#eeeeee";  // Soft Gray

async function run() {
  const url       = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("Missing TURSO_DATABASE_URL");
    process.exit(1);
  }

  const db = createClient({ url, authToken });
  console.log("Connecting to Turso...");

  // Verify bgColor column exists first
  const info = await db.execute("PRAGMA table_info(products);");
  const hasColumn = info.rows.some((r) => (r.name as string) === "bgColor");

  if (!hasColumn) {
    console.error("");
    console.error("ERROR: The 'bgColor' column does not exist on the products table.");
    console.error("Run this first:   npx tsx src/lib/db/add-bgcolor-column.ts");
    console.error("");
    process.exit(1);
  }

  // Count products first
  const countResult = await db.execute("SELECT COUNT(*) as c FROM products;");
  const total = Number(countResult.rows[0].c);
  console.log(`Found ${total} products in database.`);

  if (total === 0) {
    console.log("No products to update. Exiting.");
    return;
  }

  // Bulk update
  console.log(`Setting bgColor = "${TARGET_COLOR}" (Soft Gray) on all products...`);
  const result = await db.execute({
    sql:  "UPDATE products SET bgColor = ?, updatedAt = unixepoch();",
    args: [TARGET_COLOR],
  });

  console.log("");
  console.log("SUCCESS!");
  console.log(`  Rows affected:   ${result.rowsAffected}`);
  console.log(`  Background:      ${TARGET_COLOR} (Soft Gray)`);
  console.log("");
  console.log("Refresh your browser to see the change.");
}

run().catch((err) => {
  console.error("Bulk update failed:", err);
  process.exit(1);
});