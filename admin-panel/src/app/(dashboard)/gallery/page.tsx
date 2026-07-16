import { getSetting } from "@/lib/db/repositories/settings";
import { GalleryClient } from "./GalleryClient";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

const DEFAULT_CONFIG = {
  enabled:            true,
  sectionLabel:       "@denovapk",
  sectionTitle:       "Style in Action",
  sectionDescription: "Follow us for daily style inspiration and behind-the-scenes moments",
  slots: [
    { id: "s1", image: "", link: "", isActive: true },
    { id: "s2", image: "", link: "", isActive: true },
    { id: "s3", image: "", link: "", isActive: true },
    { id: "s4", image: "", link: "", isActive: true },
    { id: "s5", image: "", link: "", isActive: true },
  ],
};

export default async function GalleryPage() {
  const raw = await getSetting("gallery");
  let config = DEFAULT_CONFIG;

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      config = { ...DEFAULT_CONFIG, ...parsed };
      // Ensure 5 slots always
      if (!Array.isArray(config.slots) || config.slots.length !== 5) {
        config.slots = DEFAULT_CONFIG.slots;
      }
    } catch {}
  }

  return <GalleryClient initialConfig={config} />;
}