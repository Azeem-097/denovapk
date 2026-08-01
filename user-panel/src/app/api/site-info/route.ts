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
    return NextResponse.json({ error: "Site information is unavailable." }, { status: 503 });
  }
}
