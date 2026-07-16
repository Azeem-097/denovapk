import { NextResponse } from "next/server";
import { getSetting } from "@/lib/db/repositories/settings";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

const DEFAULT_CONFIG = {
  enabled:            true,
  phone:              "",         // e.g. "+923001234567"
  communityLink:      "",         // e.g. "https://chat.whatsapp.com/xxx"
  greeting:           "Hi! I'm interested in Denova PK.",
  directLabel:        "Direct Message",
  communityLabel:     "Join Community",
  directSubtext:      "Chat with our support team",
  communitySubtext:   "Join our WhatsApp community",
};

export async function GET() {
  try {
    const raw = await getSetting("whatsapp_widget");
    if (!raw) return NextResponse.json({ config: DEFAULT_CONFIG });

    const parsed = JSON.parse(raw);
    return NextResponse.json({
      config: { ...DEFAULT_CONFIG, ...parsed },
    });
  } catch {
    return NextResponse.json({ config: DEFAULT_CONFIG });
  }
}