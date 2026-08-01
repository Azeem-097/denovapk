import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db/client";
import { now } from "@/lib/db/helpers";
import type { DbAdmin } from "@/lib/db/types";

const JWT_SECRET     = process.env.JWT_SECRET     || "admin-fallback-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const COOKIE_NAME    = "denova-admin-token";

export interface AdminTokenPayload {
  id:    string;
  email: string;
  role:  string;
}

// ─── Password ────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── JWT ─────────────────────────────────────────────────
export function generateAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
  } catch {
    return null;
  }
}

// ─── Cookies ─────────────────────────────────────────────
export async function setAdminCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   60 * 60 * 24 * 7,
    path:     "/",
  });
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

// ─── Get current admin from cookie ───────────────────────
export async function getCurrentAdmin() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyAdminToken(token);
  if (!payload) return null;

  const result = await db.execute({
    sql:  "SELECT * FROM admins WHERE id = ? LIMIT 1",
    args: [payload.id],
  });

  const admin = result.rows[0] as unknown as DbAdmin | undefined;
  if (!admin || admin.isActive !== 1) return null;

  return {
    id:        admin.id,
    name:      admin.name,
    email:     admin.email,
    role:      admin.role,
    avatar:    admin.avatar,
    passwordChangeRequired: admin.passwordChangeRequired === 1,
    lastLogin: admin.lastLogin,
  };
}

// ─── Login admin ─────────────────────────────────────────
export async function loginAdmin(email: string, password: string): Promise<{ admin: DbAdmin; token: string } | null> {
  const result = await db.execute({
    sql:  "SELECT * FROM admins WHERE email = ? LIMIT 1",
    args: [email.toLowerCase()],
  });

  const admin = result.rows[0] as unknown as DbAdmin | undefined;
  if (!admin || admin.isActive !== 1) return null;

  const valid = await verifyPassword(password, admin.password);
  if (!valid) return null;

  // Update lastLogin
  await db.execute({
    sql:  "UPDATE admins SET lastLogin = ? WHERE id = ?",
    args: [now(), admin.id],
  });

  const token = generateAdminToken({ id: admin.id, email: admin.email, role: admin.role });
  return { admin, token };
}
