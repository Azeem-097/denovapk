/**
 * Reset script.
 * WARNING: Deletes ALL data and tables.
 * Run with: npm run db:reset
 */

import "dotenv/config";
import { createClient } from "@libsql/client";

async function reset() {
  const url       = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("❌ TURSO_DATABASE_URL missing");
    process.exit(1);
  }

  const db = createClient({ url, authToken });

  console.log("⚠️  Resetting database...\n");

  const tables = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
  );

  for (const row of tables.rows) {
    const name = row.name as string;
    await db.execute(`DROP TABLE IF EXISTS ${name};`);
    console.log(`  🗑️  Dropped: ${name}`);
  }

  console.log(`\n✅ Dropped ${tables.rows.length} tables.`);
  console.log("Run: npm run db:init  to recreate schema");
  console.log("Run: npm run db:seed  to populate with data");
}

reset().catch((err) => {
  console.error("❌ Reset failed:", err);
  process.exit(1);
});