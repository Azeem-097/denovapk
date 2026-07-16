/**
 * One-time script: rename current admin.
 * Run with:  npx tsx scripts/rename-admin.ts
 * Or from admin-panel:  npx tsx ../scripts/rename-admin.ts
 */

import "dotenv/config";
import { createClient } from "@libsql/client";

async function main() {
  const url       = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("Missing TURSO_DATABASE_URL in .env");
    process.exit(1);
  }

  const db = createClient({ url, authToken });

  const NEW_NAME = "Jamal Ahmad";
  const EMAIL    = "admin@denovapk.com";

  console.log(`\nUpdating admin ${EMAIL} name to "${NEW_NAME}"...\n`);

  const result = await db.execute({
    sql:  "UPDATE admins SET name = ?, updatedAt = ? WHERE email = ?",
    args: [NEW_NAME, Math.floor(Date.now() / 1000), EMAIL],
  });

  console.log(`Rows updated: ${result.rowsAffected}`);

  const check = await db.execute({
    sql:  "SELECT id, name, email, role FROM admins WHERE email = ? LIMIT 1",
    args: [EMAIL],
  });

  if (check.rows.length === 0) {
    console.log(`\nNo admin found with email ${EMAIL}`);
  } else {
    const admin = check.rows[0];
    console.log(`\nVerified admin now stored as:`);
    console.log(`  Name:  ${admin.name}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Role:  ${admin.role}`);
  }

  console.log("\nDone. Sign out and back in (or just refresh) to see the new name.\n");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});