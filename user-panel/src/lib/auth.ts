import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getUserById } from "@/lib/db/repositories/users";

const JWT_SECRET  = process.env.NEXTAUTH_SECRET || "user-fallback-secret";
const COOKIE_NAME = "denova-user-token";

export interface UserTokenPayload {
  id:    string;
  email: string;
}

export function generateUserToken(payload: UserTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyUserToken(token: string): UserTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserTokenPayload;
  } catch {
    return null;
  }
}

export async function setUserCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   60 * 60 * 24 * 30, // 30 days
    path:     "/",
  });
}

export async function clearUserCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyUserToken(token);
  if (!payload) return null;

  const user = await getUserById(payload.id);
  if (!user || !user.isActive) return null;

  return {
    id:     user.id,
    name:   user.name,
    email:  user.email,
    phone:  user.phone,
    avatar: user.avatar,
  };
}