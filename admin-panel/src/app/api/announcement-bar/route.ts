import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { getSetting, setSetting } from "@/lib/db/repositories/settings";

export const dynamic = "force-dynamic";

// Default config (used if setting doesn't exist yet)
const DEFAULT_CONFIG = {
  enabled:           true,
  autoRotateSeconds: 5,
  dismissible:       true,
  bgColor:           "#1a1a1a",
  textColor:         "#ffffff",
  accentColor:       "#3b5f8f",
  messages: [
    { id: "m1", text: "Free shipping on orders above PKR 5,000",   link: "",      isActive: true, sortOrder: 0 },
    { id: "m2", text: "New Summer Collection is now live",         link: "/shop", isActive: true, sortOrder: 1 },
    { id: "m3", text: "Use code DENOVA10 for 10% off first order", link: "",      isActive: true, sortOrder: 2 },
  ],
};

// ─── GET /api/announcement-bar ──────────────────────────
export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const raw = await getSetting("announcement_bar");
  if (!raw) return NextResponse.json({ config: DEFAULT_CONFIG });

  try {
    const config = JSON.parse(raw);
    return NextResponse.json({ config });
  } catch {
    return NextResponse.json({ config: DEFAULT_CONFIG });
  }
}

// ─── POST /api/announcement-bar ─────────────────────────
export async function POST(req: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { config } = await req.json();

    if (!config || typeof config !== "object") {
      return NextResponse.json({ error: "Invalid config" }, { status: 400 });
    }

    if (!Array.isArray(config.messages)) {
      return NextResponse.json({ error: "messages must be an array" }, { status: 400 });
    }

    // Validate each message
    for (const m of config.messages) {
      if (!m.id || typeof m.id !== "string") {
        return NextResponse.json({ error: "Each message must have an id" }, { status: 400 });
      }
      if (!m.text || typeof m.text !== "string") {
        return NextResponse.json({ error: "Each message must have text" }, { status: 400 });
      }
    }

    await setSetting("announcement_bar", JSON.stringify(config), "announcement");
    return NextResponse.json({ success: true, count: config.messages.length });
  } catch (err) {
    console.error("Announcement bar save error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}