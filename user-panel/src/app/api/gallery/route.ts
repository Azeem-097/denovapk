import { NextResponse } from "next/server";
import { getSetting } from "@/lib/db/repositories/settings";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

type GalleryLayout = "square" | "portrait" | "landscape" | "wide";

interface GalleryItem {
  id:        string;
  image:     string;
  name:      string;
  link:      string;
  layout:    GalleryLayout;
  isActive:  boolean;
  sortOrder: number;
}

const DEFAULT_CONFIG = {
  enabled:            true,
  sectionLabel:       "@denovapk",
  sectionTitle:       "Style in Action",
  sectionDescription: "Follow us for daily style inspiration and behind-the-scenes moments",
  items:              [] as GalleryItem[],
};

const VALID_LAYOUTS: GalleryLayout[] = ["square", "portrait", "landscape", "wide"];

function normalizeItem(raw: unknown, index: number, fallbackLayout: GalleryLayout = "square"): GalleryItem | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;

  const image = typeof r.image === "string" ? r.image : "";
  if (!image) return null;

  const layout: GalleryLayout = (typeof r.layout === "string" && VALID_LAYOUTS.includes(r.layout as GalleryLayout))
    ? (r.layout as GalleryLayout)
    : fallbackLayout;

  return {
    id:        typeof r.id === "string" && r.id.length > 0 ? r.id : `g${index + 1}`,
    image,
    name:      typeof r.name === "string" ? r.name : "",
    link:      typeof r.link === "string" ? r.link : "",
    layout,
    isActive:  r.isActive !== false,
    sortOrder: typeof r.sortOrder === "number" ? r.sortOrder : index,
  };
}

function migrateOldSlots(oldSlots: unknown[]): GalleryItem[] {
  const layouts: GalleryLayout[] = ["square", "square", "portrait", "square", "square"];
  const items: GalleryItem[] = [];
  oldSlots.forEach((s, i) => {
    const item = normalizeItem(s, i, layouts[i] ?? "square");
    if (item) items.push({ ...item, sortOrder: i });
  });
  return items;
}

export async function GET() {
  try {
    const raw = await getSetting("gallery");
    if (!raw) return NextResponse.json({ config: DEFAULT_CONFIG });

    const all = JSON.parse(raw) as Record<string, unknown>;

    // Build items[] from either new or old format, always normalized
    let items: GalleryItem[];
    if (Array.isArray(all.items)) {
      items = all.items
        .map((it, i) => normalizeItem(it, i))
        .filter((it): it is GalleryItem => it !== null);
    } else if (Array.isArray(all.slots)) {
      items = migrateOldSlots(all.slots);
    } else {
      items = [];
    }

    // Only active items, sorted
    items = items
      .filter((it) => it.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return NextResponse.json({
      config: {
        enabled:            all.enabled !== false,
        sectionLabel:       typeof all.sectionLabel       === "string" ? all.sectionLabel       : "@denovapk",
        sectionTitle:       typeof all.sectionTitle       === "string" ? all.sectionTitle       : "Style in Action",
        sectionDescription: typeof all.sectionDescription === "string" ? all.sectionDescription : "Follow us for daily style inspiration and behind-the-scenes moments",
        items,
      },
    });
  } catch {
    return NextResponse.json({ config: DEFAULT_CONFIG });
  }
}