/**
 * Migration script.
 * Uses Turso's batch API which properly handles multi-statement SQL.
 * Run with: npm run db:init
 */

import "dotenv/config";
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { join } from "path";

async function migrate() {
  const url       = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("Missing TURSO_DATABASE_URL in .env");
    process.exit(1);
  }

  console.log("Connecting to Turso...");
  const db = createClient({ url, authToken });

  const schemaPath = join(process.cwd(), "..", "shared", "db", "schema.sql");
  console.log(`Reading schema from: ${schemaPath}`);
  const schema = readFileSync(schemaPath, "utf8");

  // Better SQL splitter that handles multi-line statements and comments
  const statements = splitSqlStatements(schema);
  console.log(`Found ${statements.length} SQL statements\n`);

  // ─── Phase 1: Create all tables first ────────────────
  const createTables = statements.filter((s) => /^\s*CREATE TABLE/i.test(s));
  const createIndexes = statements.filter((s) => /^\s*CREATE INDEX/i.test(s));
  const other         = statements.filter((s) =>
    !/^\s*CREATE TABLE/i.test(s) && !/^\s*CREATE INDEX/i.test(s)
  );

  console.log(`Creating ${createTables.length} tables...`);
  let tableSuccess = 0;
  let tableFail    = 0;

  for (const stmt of createTables) {
    try {
      await db.execute(stmt);
      tableSuccess++;
      const tableName = extractTableName(stmt);
      console.log(`  OK  ${tableName}`);
    } catch (err) {
      tableFail++;
      const tableName = extractTableName(stmt);
      console.log(`  FAIL  ${tableName}: ${(err as Error).message}`);
    }
  }

  // ─── Phase 2: Create indexes ─────────────────────────
  console.log(`\nCreating ${createIndexes.length} indexes...`);
  let idxSuccess = 0;
  let idxFail    = 0;

  for (const stmt of createIndexes) {
    try {
      await db.execute(stmt);
      idxSuccess++;
    } catch (err) {
      idxFail++;
      console.log(`  FAIL  ${(err as Error).message}`);
    }
  }
  console.log(`  ${idxSuccess} indexes created`);

  // ─── Phase 3: Everything else ────────────────────────
  if (other.length > 0) {
    console.log(`\nExecuting ${other.length} other statements...`);
    for (const stmt of other) {
      try { await db.execute(stmt); } catch (err) {
        console.log(`  FAIL: ${(err as Error).message}`);
      }
    }
  }

  console.log("\n===============================================");
  console.log(`Tables:  ${tableSuccess} created, ${tableFail} failed`);
  console.log(`Indexes: ${idxSuccess} created, ${idxFail} failed`);
  console.log("===============================================\n");

  // Verify
  const tables = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
  );

  console.log("Tables in database:");
  tables.rows.forEach((r) => console.log(`   - ${r.name}`));
  console.log(`\nTotal: ${tables.rows.length} tables\n`);

  if (tableFail === 0 && idxFail === 0) {
    console.log("Migration successful! Run: npm run db:seed");
  } else {
    console.log("Some statements failed. Check errors above.");
  }
}

/**
 * Properly split SQL by semicolons.
 * Handles:
 *   - Multi-line statements
 *   - Comments (-- lines)
 *   - Empty lines
 */
function splitSqlStatements(sql: string): string[] {
  // Remove SQL comments
  const withoutComments = sql
    .split("\n")
    .map((line) => {
      const commentIdx = line.indexOf("--");
      return commentIdx >= 0 ? line.substring(0, commentIdx) : line;
    })
    .join("\n");

  // Split by semicolons and clean up
  return withoutComments
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Extract table name from CREATE TABLE statement
 */
function extractTableName(stmt: string): string {
  const match = stmt.match(/CREATE TABLE(?:\s+IF NOT EXISTS)?\s+(\w+)/i);
  return match ? match[1] : "unknown";
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});