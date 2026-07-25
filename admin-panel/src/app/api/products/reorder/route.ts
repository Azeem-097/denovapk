import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { updateProductSortOrder } from "@/lib/db/repositories/products";

export async function PATCH(req: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    const productIds = Array.isArray(body.productIds)
      ? body.productIds.filter((id: unknown): id is string => typeof id === "string" && id.length > 0)
      : [];

    if (productIds.length === 0) {
      return NextResponse.json({ error: "No products provided" }, { status: 400 });
    }

    await updateProductSortOrder(productIds);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reorder products error:", err);
    return NextResponse.json({ error: "Failed to reorder products" }, { status: 500 });
  }
}
