import { NextResponse } from "next/server";
import { getSetting } from "@/lib/db/repositories/settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Public endpoint — returns only active banners, sorted by sortOrder
export async function GET() {
  try {
    const raw = await getSetting("hero_banners");
    if (!raw) return NextResponse.json({ banners: [] });

    const all: HeroBanner[] = JSON.parse(raw);
    const active = all
      .filter((b) => b.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return NextResponse.json({ banners: active });
  } catch {
    return NextResponse.json({ banners: [] });
  }
}

interface HeroBanner {
  id:                   string;
  image:                string;
  title:                string;
  subtitle:             string;
  description:          string;
  buttonLabel:          string;
  buttonHref:           string;
  buttonSecondaryLabel: string;
  buttonSecondaryHref:  string;
  isActive:             boolean;
  sortOrder:            number;
}