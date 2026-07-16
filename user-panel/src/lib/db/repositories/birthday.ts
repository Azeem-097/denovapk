import { db } from "@/lib/db/client";
import type { DbUser } from "@/lib/db/types";

// ─── Helper: Check if date is today (ignoring year) ─────
export function isBirthdayToday(birthdayISO: string): boolean {
  const bday = new Date(birthdayISO);
  const now  = new Date();
  return bday.getMonth() === now.getMonth() && bday.getDate() === now.getDate();
}

// ─── Helper: Check if birthday is within reminder period ─
export function isBirthdayWithinDays(birthdayISO: string, days: number): boolean {
  if (days <= 0) return false;
  const bday = new Date(birthdayISO);
  const now  = new Date();

  // Set birthday to current year for comparison
  const bdayThisYear = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());

  // If birthday already passed this year, check next year
  if (bdayThisYear < now) {
    bdayThisYear.setFullYear(now.getFullYear() + 1);
  }

  const diffMs   = bdayThisYear.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
}

// ─── Helper: Check if within X days AFTER birthday ──────
export function isBirthdayWithinValidityPeriod(birthdayISO: string, validityDays: number): boolean {
  if (validityDays <= 0) return false;
  const bday = new Date(birthdayISO);
  const now  = new Date();

  const bdayThisYear = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());

  // Only look at past birthdays this year (offer applies AFTER birthday)
  if (bdayThisYear > now) {
    bdayThisYear.setFullYear(now.getFullYear() - 1);
  }

  const diffMs   = now.getTime() - bdayThisYear.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= validityDays;
}

// ─── Get users with birthday TODAY ───────────────────────
export async function getBirthdayUsersToday(): Promise<DbUser[]> {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day   = String(now.getDate()).padStart(2, "0");

  // Match YYYY-MM-DD where MM-DD matches today
  const pattern = `%-${month}-${day}`;

  const result = await db.execute({
    sql:  `SELECT * FROM users WHERE birthday LIKE ? AND isActive = 1`,
    args: [pattern],
  });

  return result.rows as unknown as DbUser[];
}

// ─── Get users with upcoming birthdays (within N days) ──
export async function getBirthdayUsersUpcoming(days = 7): Promise<DbUser[]> {
  const result = await db.execute({
    sql:  "SELECT * FROM users WHERE birthday IS NOT NULL AND isActive = 1",
    args: [],
  });

  const users = result.rows as unknown as DbUser[];

  return users.filter((user) => {
    if (!user.birthday) return false;
    if (isBirthdayToday(user.birthday)) return false; // Exclude today's
    return isBirthdayWithinDays(user.birthday, days);
  });
}

// ─── Get all users with birthday recently (for admin overview) ─
export async function getAllUsersWithBirthdays(limit = 200): Promise<DbUser[]> {
  const result = await db.execute({
    sql:  "SELECT * FROM users WHERE birthday IS NOT NULL AND isActive = 1 ORDER BY birthday DESC LIMIT ?",
    args: [limit],
  });
  return result.rows as unknown as DbUser[];
}

// ─── Days until user's next birthday ─────────────────────
export function daysUntilBirthday(birthdayISO: string): number {
  const bday = new Date(birthdayISO);
  const now  = new Date();

  const bdayThisYear = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());

  if (bdayThisYear < now) {
    bdayThisYear.setFullYear(now.getFullYear() + 1);
  }

  const diffMs = bdayThisYear.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// ─── Calculate age from birthday ─────────────────────────
export function calculateAge(birthdayISO: string): number {
  const bday = new Date(birthdayISO);
  const now  = new Date();
  let age = now.getFullYear() - bday.getFullYear();
  const m = now.getMonth() - bday.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < bday.getDate())) age--;
  return age;
}

// ─── Update user birthday ────────────────────────────────
export async function updateUserBirthday(userId: string, birthday: string | null): Promise<void> {
  const t = Math.floor(Date.now() / 1000);
  await db.execute({
    sql:  "UPDATE users SET birthday = ?, updatedAt = ? WHERE id = ?",
    args: [birthday, t, userId],
  });
}