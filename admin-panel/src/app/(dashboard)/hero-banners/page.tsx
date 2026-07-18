import { HeroBannersClient } from "./HeroBannersClient";
import { getSetting, getNumberSetting } from "@/lib/db/repositories/settings";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

export default async function HeroBannersPage() {
  const [raw, rotation] = await Promise.all([
    getSetting("hero_banners"),
    getNumberSetting("hero_rotation_seconds", 8),
  ]);
  const banners = raw ? JSON.parse(raw) : [];
  return <HeroBannersClient initialBanners={banners} initialRotation={rotation} />;
}