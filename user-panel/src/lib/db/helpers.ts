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
 * Format: DNV + 8 digits
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  return `DNV${timestamp}`;
}