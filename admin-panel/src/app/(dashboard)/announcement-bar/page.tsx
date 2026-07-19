import { getSetting } from "@/lib/db/repositories/settings";
import { AnnouncementBarClient } from "./AnnouncementBarClient";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

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

export default async function AnnouncementBarPage() {
  const raw = await getSetting("announcement_bar");
  let config = DEFAULT_CONFIG;

  if (raw) {
    try {
      config = { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {}
  }

  return <AnnouncementBarClient initialConfig={config} />;
}