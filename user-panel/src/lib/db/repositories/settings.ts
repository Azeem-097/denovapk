import { db } from "@/lib/db/client";
import { generateId, now } from "@/lib/db/helpers";
import type { DbSetting } from "@/lib/db/types";

// ─── Get single setting by key ───────────────────────────
export async function getSetting(key: string): Promise<string | null> {
  const result = await db.execute({
    sql:  "SELECT value FROM settings WHERE key = ? LIMIT 1",
    args: [key],
  });
  if (result.rows.length === 0) return null;
  return result.rows[0].value as string;
}

// ─── Get typed setting values ────────────────────────────
export async function getBoolSetting(key: string, defaultValue = false): Promise<boolean> {
  const val = await getSetting(key);
  if (val === null) return defaultValue;
  return val === "true" || val === "1";
}

export async function getNumberSetting(key: string, defaultValue = 0): Promise<number> {
  const val = await getSetting(key);
  if (val === null) return defaultValue;
  const num = Number(val);
  return isNaN(num) ? defaultValue : num;
}

export async function getStringSetting(key: string, defaultValue = ""): Promise<string> {
  const val = await getSetting(key);
  return val ?? defaultValue;
}

// ─── Get all settings by category ────────────────────────
export async function getSettingsByCategory(category: string): Promise<Record<string, string>> {
  const categories = category === "brand" ? ["brand", "restaurant"] : [category];
  const result = await db.execute({
    sql:  `SELECT key, value FROM settings WHERE category IN (${categories.map(() => "?").join(",")})`,
    args: categories,
  });

  const map: Record<string, string> = {};
  for (const row of result.rows) {
    map[row.key as string] = row.value as string;
  }
  return map;
}

// ─── Get ALL settings (grouped by category) ──────────────
export async function getAllSettings(): Promise<Record<string, Record<string, string>>> {
  const result = await db.execute("SELECT key, value, category FROM settings ORDER BY category, key");

  const grouped: Record<string, Record<string, string>> = {};
  for (const row of result.rows) {
    const cat = (row.category as string) === "restaurant" ? "brand" : row.category as string;
    if (!grouped[cat]) grouped[cat] = {};
    grouped[cat][row.key as string] = row.value as string;
  }
  return grouped;
}

// ─── Update or insert a setting ──────────────────────────
export async function setSetting(key: string, value: string, category = "general"): Promise<void> {
  const existing = await db.execute({
    sql:  "SELECT id FROM settings WHERE key = ? LIMIT 1",
    args: [key],
  });

  if (existing.rows.length > 0) {
    await db.execute({
      sql:  "UPDATE settings SET value = ?, category = ?, updatedAt = ? WHERE key = ?",
      args: [value, category, now(), key],
    });
  } else {
    await db.execute({
      sql:  "INSERT INTO settings (id, key, value, category, updatedAt) VALUES (?, ?, ?, ?, ?)",
      args: [generateId(), key, value, category, now()],
    });
  }
}

// ─── Bulk update multiple settings ───────────────────────
export async function setMultipleSettings(
  settings: Array<{ key: string; value: string; category?: string }>
): Promise<void> {
  for (const s of settings) {
    await setSetting(s.key, s.value, s.category ?? "general");
  }
}

// ─── Helper: Get common feature flags ────────────────────
export async function getFeatureFlags() {
  const [abandonedCart, loyalty, birthday] = await Promise.all([
    getBoolSetting("abandoned_cart_enabled", true),
    getBoolSetting("loyalty_enabled",        true),
    getBoolSetting("birthday_enabled",       true),
  ]);

  return {
    abandonedCartEnabled: abandonedCart,
    loyaltyEnabled:       loyalty,
    birthdayEnabled:      birthday,
  };
}
