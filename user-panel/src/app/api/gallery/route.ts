import { NextResponse } from "next/server";
import { getSetting } from "@/lib/db/repositories/settings";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

const DEFAULT_CONFIG = {
  enabled:            true,
  sectionLabel:       "@denovapk",
  sectionTitle:       "Style in Action",
  sectionDescription: "Follow us for daily style inspiration and behind-the-scenes moments",
  slots: [] as GallerySlot[],
};

interface GallerySlot {
  id:       string;
  image:    string;
  link:     string;
  isActive: boolean;
}

export async function GET() {
  try {
    const raw = await getSetting("gallery");
    if (!raw) return NextResponse.json({ config: DEFAULT_CONFIG });

    const all = JSON.parse(raw);
    return NextResponse.json({
      config: {
        enabled:            all.enabled !== false,
        sectionLabel:       all.sectionLabel       || "@denovapk",
        sectionTitle:       all.sectionTitle       || "Style in Action",
        sectionDescription: all.sectionDescription || "Follow us for daily style inspiration and behind-the-scenes moments",
        slots:              Array.isArray(all.slots) ? all.slots : [],
      },
    });
  } catch {
    return NextResponse.json({ config: DEFAULT_CONFIG });
  }
}