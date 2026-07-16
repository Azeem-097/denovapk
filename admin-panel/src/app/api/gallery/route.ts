import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { getSetting, setSetting } from "@/lib/db/repositories/settings";

export const dynamic = "force-dynamic";

// 5 slots, empty by default
const DEFAULT_CONFIG = {
  enabled:     true,
  sectionLabel:       "@denovapk",
  sectionTitle:       "Style in Action",
  sectionDescription: "Follow us for daily style inspiration and behind-the-scenes moments",
  slots: [
    { id: "s1", image: "", link: "", isActive: true },  // top-left square
    { id: "s2", image: "", link: "", isActive: true },  // bottom-left square
    { id: "s3", image: "", link: "", isActive: true },  // center tall
    { id: "s4", image: "", link: "", isActive: true },  // top-right square
    { id: "s5", image: "", link: "", isActive: true },  // bottom-right square
  ],
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

    if (!Array.isArray(config.slots)) {
      return NextResponse.json({ error: "slots must be an array" }, { status: 400 });
    }

    // Ensure exactly 5 slots (positions matter — layout is fixed)
    if (config.slots.length !== 5) {
      return NextResponse.json({ error: "Gallery must have exactly 5 slots" }, { status: 400 });
    }

    // Validate each slot
    for (const s of config.slots) {
      if (!s.id || typeof s.id !== "string") {
        return NextResponse.json({ error: "Each slot must have an id" }, { status: 400 });
      }
    }

    await setSetting("gallery", JSON.stringify(config), "gallery");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Gallery save error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}