import { NextResponse } from "next/server";
import { getSiteInfo } from "@/lib/siteInfo";

export const dynamic    = "force-dynamic";
export const revalidate = 0;

/**
 * Public site info endpoint.
 * Returns brand contact info + legal last-updated date.
 * Used by client components (e.g. contact page).
 */
export async function GET() {
  try {
    const info = await getSiteInfo();
    return NextResponse.json(info, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Site info API error:", err);
    return NextResponse.json({
      email:            "hello@denovapk.com",
      phone:            "+92 300 123 4567",
      whatsapp:         "+923001234567",
      address:          "Gulberg III, Lahore, Pakistan",
      brandName:        "Denova PK",
      brandTagline:     "Crafted for the Modern You",
      brandDescription: "Premium Denim Clothing - Pakistan's finest selvedge jeans",
      brandCity:        "Lahore",
      brandYear:        "2026",
      legalLastUpdated: "July 2026",
    });
  }
}
