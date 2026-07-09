import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { updateVariantStock } from "@/lib/db/repositories/products";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const { stock } = await req.json();
    if (typeof stock !== "number") {
      return NextResponse.json({ error: "Stock must be a number" }, { status: 400 });
    }

    await updateVariantStock(id, stock);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}