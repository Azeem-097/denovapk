import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { duplicateProduct } from "@/lib/db/repositories/products";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const newId  = await duplicateProduct(id);
    return NextResponse.json({ success: true, productId: newId });
  } catch (err) {
    console.error("Duplicate product error:", err);
    return NextResponse.json({ error: "Failed to duplicate product" }, { status: 500 });
  }
}