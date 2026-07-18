import { NextResponse } from "next/server";

/**
 * DEPRECATED: This route was misnamed and confusing.
 * Inventory is now tracked per-variant. Use PATCH /api/variants/[id] instead.
 */
export async function PATCH() {
  return NextResponse.json(
    {
      error: "This endpoint is deprecated. Use PATCH /api/variants/[variantId] instead. " +
             "Inventory is tracked per variant (size + color), not per product.",
    },
    { status: 410 }  // 410 Gone
  );
}