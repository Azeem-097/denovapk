import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { getSetting, setSetting } from "@/lib/db/repositories/settings";

export const dynamic = "force-dynamic";

// ── GET /api/hero-banners ────────────────────────────────
export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const raw     = await getSetting("hero_banners");
  const banners = raw ? JSON.parse(raw) : [];
  return NextResponse.json({ banners });
}

// ── POST /api/hero-banners ───────────────────────────────
// Body: { banners: HeroBanner[] }
export async function POST(req: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { banners } = await req.json();

    if (!Array.isArray(banners)) {
      return NextResponse.json({ error: "banners must be an array" }, { status: 400 });
    }

    // Validate each banner
    for (const b of banners) {
      if (!b.id || typeof b.id !== "string") {
        return NextResponse.json({ error: "Each banner must have an id" }, { status: 400 });
      }
    }

    await setSetting("hero_banners", JSON.stringify(banners), "hero");
    return NextResponse.json({ success: true, count: banners.length });
  } catch (err) {
    console.error("Hero banners save error:", err);
    return NextResponse.json({ error: "Failed to save banners" }, { status: 500 });
  }
}