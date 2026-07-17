import { NextResponse } from "next/server";
import { getBoolSetting } from "@/lib/db/repositories/settings";

export const dynamic    = "force-dynamic";
export const revalidate = 0;

/**
 * Public payment methods endpoint.
 * Returns which payment options are currently enabled at checkout.
 * No auth required — customer-facing.
 */
export async function GET() {
  try {
    // Read all 5 payment method flags
    // Fallback to legacy `cod_enabled` for COD (backward compat)
    const [cod, card, jazzcash, easypaisa, bank, legacyCod] = await Promise.all([
      getBoolSetting("payment_cod_enabled",       true),
      getBoolSetting("payment_card_enabled",      true),
      getBoolSetting("payment_jazzcash_enabled",  true),
      getBoolSetting("payment_easypaisa_enabled", true),
      getBoolSetting("payment_bank_enabled",      true),
      getBoolSetting("cod_enabled",               true), // legacy
    ]);

    return NextResponse.json({
      // If new key exists it wins; else fall back to legacy `cod_enabled`
      cod:       cod && legacyCod,
      card,
      jazzcash,
      easypaisa,
      bank,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("Payment methods API error:", err);
    // Safe fallback so checkout never crashes
    return NextResponse.json({
      cod: true, card: true, jazzcash: true, easypaisa: true, bank: true,
    });
  }
}