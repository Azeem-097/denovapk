import { getSetting } from "@/lib/db/repositories/settings";
import { GalleryClient } from "./GalleryClient";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

// ─── New dynamic gallery schema ─────────────────────────
export type GalleryLayout = "square" | "portrait" | "landscape" | "wide";

export interface GalleryItem {
  id:        string;
  image:     string;
  name:      string;
  link:      string;
  layout:    GalleryLayout;
  isActive:  boolean;
  sortOrder: number;
}

export interface GalleryConfig {
  enabled:            boolean;
  sectionLabel:       string;
  sectionTitle:       string;
  sectionDescription: string;
  items:              GalleryItem[];
}

const DEFAULT_CONFIG: GalleryConfig = {
  enabled:            true,
  sectionLabel:       "@denovapk",
  sectionTitle:       "Style in Action",
  sectionDescription: "Follow us for daily style inspiration and behind-the-scenes moments",
  items:              [],
};

/**
 * Guarantees every item has all required fields with valid values.
 * Handles both old format (slots[]) and new format (items[]) plus any
 * partial/corrupt data.
 */
function normalizeItem(raw: unknown, index: number, fallbackLayout: GalleryLayout = "square"): GalleryItem | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;

  const image = typeof r.image === "string" ? r.image : "";
  if (!image) return null; // Skip empty items

  const validLayouts: GalleryLayout[] = ["square", "portrait", "landscape", "wide"];
  const layout: GalleryLayout = (typeof r.layout === "string" && validLayouts.includes(r.layout as GalleryLayout))
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

/**
 * Migrates old 5-slot format to new items[].
 */
function migrateOldSlots(oldSlots: unknown[]): GalleryItem[] {
  const layouts: GalleryLayout[] = ["square", "square", "portrait", "square", "square"];
  const items: GalleryItem[] = [];

  oldSlots.forEach((s, i) => {
    const item = normalizeItem(s, i, layouts[i] ?? "square");
    if (item) items.push({ ...item, sortOrder: i });
  });

  return items;
}

export default async function GalleryPage() {
  const raw = await getSetting("gallery");
  let config: GalleryConfig = DEFAULT_CONFIG;

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;

      // Detect format and build items array
      let items: GalleryItem[];

      if (Array.isArray(parsed.items)) {
        // New format — normalize each item defensively
        items = parsed.items
          .map((it, i) => normalizeItem(it, i))
          .filter((it): it is GalleryItem => it !== null);
      } else if (Array.isArray(parsed.slots)) {
        // Old 5-slot format — migrate
        items = migrateOldSlots(parsed.slots);
      } else {
        items = [];
      }

      config = {
        enabled:            parsed.enabled !== false,
        sectionLabel:       typeof parsed.sectionLabel       === "string" ? parsed.sectionLabel       : DEFAULT_CONFIG.sectionLabel,
        sectionTitle:       typeof parsed.sectionTitle       === "string" ? parsed.sectionTitle       : DEFAULT_CONFIG.sectionTitle,
        sectionDescription: typeof parsed.sectionDescription === "string" ? parsed.sectionDescription : DEFAULT_CONFIG.sectionDescription,
        items,
      };
    } catch (err) {
      console.error("Failed to parse gallery config:", err);
    }
  }

  return <GalleryClient initialConfig={config} />;
}