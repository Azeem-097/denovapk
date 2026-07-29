import { NextResponse } from "next/server";
import { getSetting } from "@/lib/db/repositories/settings";

// Public API to read a single setting value (safe - only for non-sensitive keys)
const PUBLIC_KEYS = [
  "abandoned_cart_timeout_minutes",
  "abandoned_cart_enabled",
  "loyalty_enabled",
  "loyalty_earning_rate",
  "loyalty_point_value",
  "loyalty_min_redemption",
  "loyalty_max_redemption_pct",
  "birthday_enabled",
  "birthday_discount_pct",
  "birthday_min_order",
  "free_shipping_threshold",
  "currency_symbol",
  "tax_percentage",
  "brand_name",
  "hero_rotation_seconds",
  "meta_pixel_enabled",
  "meta_pixel_id",
];

export async function GET(_: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;

  if (!PUBLIC_KEYS.includes(key)) {
    return NextResponse.json({ error: "Not public" }, { status: 403 });
  }

  const value = await getSetting(key);
  return NextResponse.json({ key, value });
}
