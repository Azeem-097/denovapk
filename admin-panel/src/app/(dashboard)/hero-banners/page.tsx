import { HeroBannersClient } from "./HeroBannersClient";
import { getSetting } from "@/lib/db/repositories/settings";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

export default async function HeroBannersPage() {
  const raw     = await getSetting("hero_banners");
  const banners = raw ? JSON.parse(raw) : [];
  return <HeroBannersClient initialBanners={banners} />;
}