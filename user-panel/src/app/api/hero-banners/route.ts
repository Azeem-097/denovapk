import { NextResponse } from "next/server";
import { getSetting } from "@/lib/db/repositories/settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Public endpoint - returns active banners + global rotation duration
export async function GET() {
  try {
    const [rawBanners, rawRotation] = await Promise.all([
      getSetting("hero_banners"),
      getSetting("hero_rotation_seconds"),
    ]);

    let banners: HeroBanner[] = [];
    if (rawBanners) {
      try {
        const all: HeroBanner[] = JSON.parse(rawBanners);
        banners = all
          .filter((b) => b.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder);
      } catch {}
    }

    const rotationSeconds = rawRotation ? Number(rawRotation) : 8;

    return NextResponse.json({
      banners,
      rotationSeconds: isNaN(rotationSeconds) ? 8 : rotationSeconds,
    });
  } catch {
    return NextResponse.json({ banners: [], rotationSeconds: 8 });
  }
}

interface HeroBanner {
  id:                   string;
  image:                string;
  imageMobile?:         string;
  title:                string;
  subtitle:             string;
  description:          string;
  buttonLabel:          string;
  buttonHref:           string;
  buttonSecondaryLabel: string;
  buttonSecondaryHref:  string;
  isActive:             boolean;
  sortOrder:            number;

  // ── New overlay fields ──
  brand?:            string;
  productTitle?:     string;
  currentPrice?:     string;
  originalPrice?:    string;
  discountPercent?:  string;
  contentPosition?:  string;
  textTheme?:        "light" | "dark";
  overlayDarkness?:  number;
  countdownEnabled?: boolean;
  countdownEndsAt?:  string;
}