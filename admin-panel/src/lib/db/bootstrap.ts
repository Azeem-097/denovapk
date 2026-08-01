/**
 * Safe production bootstrap.
 * Inserts missing default settings and creates the first admin from env vars.
 * This script never deletes existing data.
 */

import "dotenv/config";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const genId = () => "c" + randomBytes(12).toString("hex");
const now = () => Math.floor(Date.now() / 1000);

function requireStrongPassword(password: string) {
  const strong =
    password.length >= 12 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);
  if (!strong) {
    throw new Error("BOOTSTRAP_ADMIN_PASSWORD must be at least 12 chars and include upper, lower, number, and symbol.");
  }
}

const defaultSettings: Array<[string, string, string]> = [
  ["brand_name", "Denova PK", "brand"],
  ["brand_tagline", "Crafted for the Modern You", "brand"],
  ["brand_description", "Premium Denim Clothing - Pakistan's finest selvedge jeans", "brand"],
  ["brand_city", "", "brand"],
  ["brand_address", "", "brand"],
  ["brand_year", "2026", "brand"],
  ["business_hours", "[]", "brand"],
  ["legal_last_updated", "July 2026", "brand"],
  ["contact_phone_primary", "", "contact"],
  ["contact_phone_secondary", "", "contact"],
  ["contact_email", "", "contact"],
  ["contact_whatsapp", "", "contact"],
  ["store_location_enabled", "false", "contact"],
  ["store_latitude", "", "contact"],
  ["store_longitude", "", "contact"],
  ["map_embed_url", "", "contact"],
  ["homepage_brand_statement", "We believe premium international branded jeans should be accessible in Pakistan.", "homepage"],
  ["homepage_ticker_items", JSON.stringify(["Premium Denim", "Now in Pakistan", "Cash on Delivery", "Since 2026"]), "homepage"],
  ["tax_percentage", "0", "pricing"],
  ["currency_symbol", "Rs.", "pricing"],
  ["shipping_base_cost", "250", "shipping"],
  ["free_delivery_all", "false", "shipping"],
  ["cod_extra_fee", "0", "shipping"],
  ["payment_cod_enabled", "true", "payments"],
  ["payment_card_enabled", "false", "payments"],
  ["payment_jazzcash_enabled", "false", "payments"],
  ["payment_easypaisa_enabled", "false", "payments"],
  ["payment_bank_enabled", "false", "payments"],
  ["footer_brand_description", "", "footer"],
  ["footer_copyright", "Denova PK. All rights reserved.", "footer"],
  ["footer_payment_methods", "COD", "footer"],
  ["footer_bottom_links", JSON.stringify([
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Sitemap", href: "/sitemap.xml" },
  ]), "footer"],
];

async function bootstrap() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("Missing TURSO_DATABASE_URL in .env");

  const db = createClient({ url, authToken });
  await db.execute("UPDATE settings SET category = 'brand' WHERE category = 'restaurant'");

  for (const [key, value, category] of defaultSettings) {
    await db.execute({
      sql: `INSERT INTO settings (id, key, value, category, updatedAt)
            SELECT ?, ?, ?, ?, ?
            WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = ?)`,
      args: [genId(), key, value, category, now(), key],
    });
  }

  const adminCount = await db.execute("SELECT COUNT(*) as c FROM admins");
  if (Number(adminCount.rows[0].c) === 0) {
    const name = process.env.BOOTSTRAP_ADMIN_NAME?.trim();
    const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? "";
    if (!name || !email || !password) {
      throw new Error("No admins exist. Set BOOTSTRAP_ADMIN_NAME, BOOTSTRAP_ADMIN_EMAIL, and BOOTSTRAP_ADMIN_PASSWORD, then rerun db:bootstrap.");
    }
    requireStrongPassword(password);
    await db.execute({
      sql: `INSERT INTO admins (id, name, email, password, role, isActive, passwordChangeRequired, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, 'SUPER_ADMIN', 1, 1, ?, ?)`,
      args: [genId(), name, email, await bcrypt.hash(password, 10), now(), now()],
    });
    console.log("Created first admin from BOOTSTRAP_ADMIN_* environment variables.");
  } else {
    console.log("Admin already exists; no admin was created.");
  }

  console.log("Bootstrap complete. No existing business data was deleted.");
}

bootstrap().catch((err) => {
  console.error("Bootstrap failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
