import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";

/**
 * Helper to protect API routes. Returns null if authorized, or a Response if not.
 */
export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/**
 * Helper that returns admin OR unauthorized response
 */
export async function getAdminOrError() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return {
      admin: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }
  return { admin, error: null };
}