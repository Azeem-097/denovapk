import { NextResponse } from "next/server";
import {
  getBoolSetting, getNumberSetting,
} from "@/lib/db/repositories/settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Public shipping config endpoint.
 * Returns current shipping rules for use at cart / checkout.
 * No auth required — this is customer-facing.
 */
export async function GET() {
  try {
    const [
      freeDeliveryAll,
      baseCost,
      threshold,
      codEnabled,
      codFee,
    ] = await Promise.all([
      getBoolSetting("free_delivery_all",       false),
      getNumberSetting("shipping_base_cost",    250),
      getNumberSetting("free_shipping_threshold", 5000),
      getBoolSetting("cod_enabled",             true),
      getNumberSetting("cod_extra_fee",         0),
    ]);

    return NextResponse.json({
      freeDeliveryAll,
      baseCost,
      threshold,
      codEnabled,
      codFee,
    }, {
      headers: {
        // Cache for 60s at edge/CDN; browsers revalidate on nav
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("Shipping config error:", err);
    // Safe fallback so checkout never crashes
    return NextResponse.json({
      freeDeliveryAll: false,
      baseCost:        250,
      threshold:       5000,
      codEnabled:      true,
      codFee:          0,
    });
  }
}