import { getSetting } from "@/lib/db/repositories/settings";
import { SizeChartClient } from "./SizeChartClient";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

export interface SizeChartRow {
  size:   string;
  waist:  string;
  hip:    string;
  thigh:  string;
  length: string;
}

export interface SizeChartConfig {
  intro:      string;
  footerNote: string;
  rows:       SizeChartRow[];
}

const DEFAULT_CONFIG: SizeChartConfig = {
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

export default async function SizeChartPage() {
  const raw = await getSetting("size_chart");
  let config = DEFAULT_CONFIG;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      config = {
        intro:      typeof parsed.intro      === "string" ? parsed.intro      : DEFAULT_CONFIG.intro,
        footerNote: typeof parsed.footerNote === "string" ? parsed.footerNote : DEFAULT_CONFIG.footerNote,
        rows:       Array.isArray(parsed.rows) && parsed.rows.length > 0 ? parsed.rows : DEFAULT_CONFIG.rows,
      };
    } catch {}
  }

  return <SizeChartClient initialConfig={config} />;
}