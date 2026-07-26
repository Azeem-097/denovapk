import { NextResponse } from "next/server";
import { getSetting } from "@/lib/db/repositories/settings";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

const BRAND_ACCENT = "#E10600"; // Denova Oxblood — always used as accent

const DEFAULT_CONFIG = {
  enabled:           true,
  autoRotateSeconds: 5,
  dismissible:       true,
  bgColor:           "#1a1a1a",
  textColor:         "#ffffff",
  accentColor:       BRAND_ACCENT,
  messages: [] as AnnouncementMessage[],
};

interface AnnouncementMessage {
  id:        string;
  text:      string;
  link:      string;
  isActive:  boolean;
  sortOrder: number;
}

export async function GET() {
  try {
    const raw = await getSetting("announcement_bar");
    if (!raw) return NextResponse.json({ config: DEFAULT_CONFIG });

    const all = JSON.parse(raw);
    const activeMessages = (Array.isArray(all.messages) ? all.messages : [])
      .filter((m: AnnouncementMessage) => m.isActive)
      .sort((a: AnnouncementMessage, b: AnnouncementMessage) => a.sortOrder - b.sortOrder);

    return NextResponse.json({
      config: {
        enabled:           all.enabled !== false,
        autoRotateSeconds: Number(all.autoRotateSeconds) || 5,
        dismissible:       all.dismissible !== false,
        bgColor:           all.bgColor     || "#1a1a1a",
        textColor:         all.textColor   || "#ffffff",
        accentColor:       BRAND_ACCENT, // Always blue, ignore DB value
        messages:          activeMessages,
      },
    });
  } catch {
    return NextResponse.json({ config: DEFAULT_CONFIG });
  }
}