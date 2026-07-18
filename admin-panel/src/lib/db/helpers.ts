import { randomBytes } from "crypto";

/**
 * Generate a unique ID (like cuid).
 * Format: c + 24 chars of random hex
 */
export function generateId(): string {
  return "c" + randomBytes(12).toString("hex");
}

/**
 * Get current Unix timestamp (seconds)
 */
export function now(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Convert Unix timestamp to Date
 */
export function toDate(timestamp: number | null): Date | null {
  if (!timestamp) return null;
  return new Date(timestamp * 1000);
}

/**
 * SQLite stores booleans as 0/1
 */
export function toBool(value: number | null): boolean {
  return value === 1;
}

export function fromBool(value: boolean): number {
  return value ? 1 : 0;
}

/**
 * Parse comma-separated tags to array
 */
export function tagsToArray(tags: string): string[] {
  if (!tags || tags.trim() === "") return [];
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
}

export function arrayToTags(tags: string[]): string {
  return tags.join(",");
}

/**
 * Safely parse JSON, return null on failure
 */
export function safeJsonParse<T>(json: string | null): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/**
 * Generate a unique order number
 * Format: DN-XXXX (e.g. DN-4837)
 *
 * NOTE: This uses 4 random digits (1000-9999). With ~9000 combinations,
 * collisions become likely after ~50-100 orders exist. If you expect
 * more than a few dozen orders, the createOrder function should check
 * for duplicates and regenerate on collision (see repositories/orders.ts).
 */
export function generateOrderNumber(): string {
  const digits = Math.floor(1000 + Math.random() * 9000); // 1000-9999
  return `DN-${digits}`;
}