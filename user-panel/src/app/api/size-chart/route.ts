import { NextResponse } from "next/server";
import { getSetting } from "@/lib/db/repositories/settings";

export const dynamic   = "force-dynamic";
export const revalidate = 60;

const DEFAULT_CONFIG = {
  intro:      "All measurements are in inches. Sizes may vary slightly between brands and styles. When in doubt, size up.",
  footerNote: "How to measure: Use a soft measuring tape. For waist, measure around the narrowest part of your torso. For hip, measure around the fullest part of your hips.",
  rows: [
    { size: "28", waist: "28", hip: "35", thigh: "21", length: "30" },
    { size: "30", waist: "30", hip: "37", thigh: "22", length: "30" },
    { size: "32", waist: "32", hip: "39", thigh: "23", length: "32" },
    { size: "34", waist: "34", hip: "41", thigh: "24", length: "32" },
    { size: "36", waist: "36", hip: "43", thigh: "25", length: "32" },
    { size: "38", waist: "38", hip: "45", thigh: "26", length: "34" },
    { size: "40", waist: "40", hip: "47", thigh: "27", length: "34" },
  ],
};

export async function GET() {
  try {
    const raw = await getSetting("size_chart");
    if (!raw) return NextResponse.json({ config: DEFAULT_CONFIG });

    const parsed = JSON.parse(raw);
    return NextResponse.json({
      config: {
        intro:      typeof parsed.intro      === "string" ? parsed.intro      : DEFAULT_CONFIG.intro,
        footerNote: typeof parsed.footerNote === "string" ? parsed.footerNote : DEFAULT_CONFIG.footerNote,
        rows:       Array.isArray(parsed.rows) ? parsed.rows : DEFAULT_CONFIG.rows,
      },
    });
  } catch {
    return NextResponse.json({ config: DEFAULT_CONFIG });
  }
}