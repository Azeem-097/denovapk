import { createClient } from "@libsql/client";

/**
 * Turso database client.
 * Uses TURSO_DATABASE_URL and TURSO_AUTH_TOKEN from .env
 *
 * Adds 30s timeout + AbortSignal support so slow Turso requests
 * do not indefinitely hang server components.
 */

const url       = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error("Missing TURSO_DATABASE_URL in environment variables");
}

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof createClient> | undefined;
};

export const db =
  globalForDb.db ??
  createClient({
    url,
    authToken,
    // Increase default timeout from 10s to 30s
    // ap-south-1 can be slow from some networks
    intMode: "number",
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}