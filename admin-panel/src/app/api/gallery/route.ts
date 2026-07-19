import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { getSetting, setSetting } from "@/lib/db/repositories/settings";

export const dynamic = "force-dynamic";

const DEFAULT_CONFIG = {
  enabled:            true,
  sectionLabel:       "@denovapk",
  sectionTitle:       "Style in Action",
  sectionDescription: "Follow us for daily style inspiration and behind-the-scenes moments",
  items:              [] as unknown[],
};

// ─── GET /api/gallery ───────────────────────────────────
export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const raw = await getSetting("gallery");
  if (!raw) return NextResponse.json({ config: DEFAULT_CONFIG });

  try {
    const parsed = JSON.parse(raw);
    return NextResponse.json({ config: { ...DEFAULT_CONFIG, ...parsed } });
  } catch {
    return NextResponse.json({ config: DEFAULT_CONFIG });
  }
}

// ─── POST /api/gallery ──────────────────────────────────
export async function POST(req: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { config } = await req.json();

    if (!config || typeof config !== "object") {
      return NextResponse.json({ error: "Invalid config" }, { status: 400 });
    }

    if (!Array.isArray(config.items)) {
      return NextResponse.json({ error: "items must be an array" }, { status: 400 });
    }

    // Validate each item
    const validLayouts = ["square", "portrait", "landscape", "wide"];
    for (const it of config.items) {
      if (!it.id || typeof it.id !== "string") {
        return NextResponse.json({ error: "Each item must have an id" }, { status: 400 });
      }
      if (it.layout && !validLayouts.includes(it.layout)) {
        return NextResponse.json({ error: `Invalid layout: ${it.layout}` }, { status: 400 });
      }
    }

    await setSetting("gallery", JSON.stringify(config), "gallery");
    return NextResponse.json({ success: true, count: config.items.length });
  } catch (err) {
    console.error("Gallery save error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}