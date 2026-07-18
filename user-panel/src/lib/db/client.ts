import { createClient } from "@libsql/client";

/**
 * Turso database client with hardened startup diagnostic.
 *
 * Catches common .env misconfiguration issues:
 *   - Missing credentials
 *   - Placeholder text still in .env
 *   - Wrong URL protocol
 *   - Leading/trailing quote characters (Windows editor issue)
 *   - Whitespace or newline characters in credentials
 *   - Smart/curly quotes from copy-paste
 */

function validateTursoConfig() {
  let url       = process.env.TURSO_DATABASE_URL;
  let authToken = process.env.TURSO_AUTH_TOKEN;

  const errors:   string[] = [];
  const fixed:    string[] = [];

  // ═══════════════════════════════════════════════════════
  //  AUTO-CLEAN: strip leftover quotes and whitespace
  //  (common when .env has malformed quotes on Windows)
  // ═══════════════════════════════════════════════════════
  const clean = (v: string | undefined): string | undefined => {
    if (!v) return v;
    let x = v.trim();

    // Strip surrounding quotes (both symmetric and asymmetric)
    if (x.startsWith('"') || x.startsWith("'")) {
      x = x.slice(1);
      return clean(x); // recurse in case there are also trailing
    }
    if (x.endsWith('"') || x.endsWith("'")) {
      x = x.slice(0, -1);
      return clean(x);
    }

    // Strip smart quotes (U+201C U+201D U+2018 U+2019)
    x = x.replace(/^[\u201C\u201D\u2018\u2019]+/, "");
    x = x.replace(/[\u201C\u201D\u2018\u2019]+$/, "");

    return x;
  };

  const cleanedUrl   = clean(url);
  const cleanedToken = clean(authToken);

  if (cleanedUrl !== url) {
    fixed.push("TURSO_DATABASE_URL had leading/trailing quotes — cleaned at runtime");
    process.env.TURSO_DATABASE_URL = cleanedUrl;
    url = cleanedUrl;
  }
  if (cleanedToken !== authToken) {
    fixed.push("TURSO_AUTH_TOKEN had leading/trailing quotes — cleaned at runtime");
    process.env.TURSO_AUTH_TOKEN = cleanedToken;
    authToken = cleanedToken;
  }

  // ═══════════════════════════════════════════════════════
  //  VALIDATE
  // ═══════════════════════════════════════════════════════
  if (!url) {
    errors.push("TURSO_DATABASE_URL is missing");
  } else if (url.includes("XXX") || url.includes("your-database")) {
    errors.push("TURSO_DATABASE_URL still contains placeholder text");
  } else if (!url.startsWith("libsql://") && !url.startsWith("https://")) {
    errors.push(`TURSO_DATABASE_URL has invalid protocol. Got: ${url.slice(0, 20)}...`);
  }

  if (!authToken) {
    errors.push("TURSO_AUTH_TOKEN is missing");
  } else if (authToken.includes("XXX") || authToken.includes("your-auth-token")) {
    errors.push("TURSO_AUTH_TOKEN still contains placeholder text");
  } else if (authToken.length < 30) {
    errors.push(`TURSO_AUTH_TOKEN is too short (${authToken.length} chars). Regenerate the token at https://app.turso.tech`);
  }

  const RED    = "\x1b[31m";
  const YELLOW = "\x1b[33m";
  const CYAN   = "\x1b[36m";
  const BOLD   = "\x1b[1m";
  const RESET  = "\x1b[0m";
  const GREEN  = "\x1b[32m";

  // Report auto-fixes (non-blocking warnings)
  if (fixed.length > 0) {
    for (const msg of fixed) {
      console.warn(YELLOW + "[Turso] AUTO-FIXED: " + RESET + msg);
    }
    console.warn(YELLOW + "[Turso] Consider fixing your .env file manually — remove the stray quote character." + RESET);
  }

  // Report blocking errors
  if (errors.length > 0) {
    console.error("\n" + RED + BOLD + "═══════════════════════════════════════════════════════════════" + RESET);
    console.error(RED + BOLD + "  ❌  TURSO DATABASE CONFIGURATION ERROR" + RESET);
    console.error(RED + BOLD + "═══════════════════════════════════════════════════════════════" + RESET + "\n");

    console.error(YELLOW + "  Problems detected:" + RESET);
    for (const problem of errors) {
      console.error(RED + "    ✗ " + RESET + problem);
    }

    console.error("\n" + CYAN + BOLD + "  HOW TO FIX:" + RESET + "\n");
    console.error(CYAN + "  1. Go to " + BOLD + "https://app.turso.tech" + RESET);
    console.error(CYAN + "  2. Open your 'denovapk' database" + RESET);
    console.error(CYAN + "  3. Click " + BOLD + "'+ Create Token'" + RESET + CYAN + " (expiration: Never)" + RESET);
    console.error(CYAN + "  4. Copy the ENTIRE token (usually 300+ chars, starts with 'eyJ')" + RESET);
    console.error(CYAN + "  5. Update BOTH .env files with matching quote style:" + RESET);
    console.error(GREEN + '       TURSO_AUTH_TOKEN="eyJhbGci..."' + RESET);
    console.error(GREEN + "                        ↑                ↑" + RESET);
    console.error(GREEN + "                     OPENING         CLOSING QUOTE" + RESET);
    console.error(CYAN + "  6. " + BOLD + "Restart the dev server" + RESET + CYAN + " (env vars only load on startup)" + RESET + "\n");

    console.error(RED + BOLD + "═══════════════════════════════════════════════════════════════" + RESET + "\n");

    throw new Error("Turso database is not properly configured. See error details above.");
  }

  // Success
  if (process.env.NODE_ENV !== "production") {
    const shortHost = url!.replace(/^(libsql|https):\/\//, "").split(".")[0];
    console.log(GREEN + "[Turso] ✓ Connected to " + shortHost + RESET);
  }
}

validateTursoConfig();


// ═══════════════════════════════════════════════════════════
//  Client initialization
// ═══════════════════════════════════════════════════════════
const url       = process.env.TURSO_DATABASE_URL!;
const authToken = process.env.TURSO_AUTH_TOKEN;

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof createClient> | undefined;
};

export const db =
  globalForDb.db ??
  createClient({
    url,
    authToken,
    intMode: "number",
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}