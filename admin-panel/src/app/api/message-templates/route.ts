import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { getSetting, getSettingsByCategory } from "@/lib/db/repositories/settings";

/**
 * GET /api/message-templates
 *   → returns all message templates as an object
 *
 * GET /api/message-templates?key=template_order_confirmation
 *   → returns a specific template as { value: string }
 */
export async function GET(req: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (key) {
    const value = await getSetting(key);
    return NextResponse.json({ value });
  }

  const templates = await getSettingsByCategory("templates");
  return NextResponse.json({ templates });
}