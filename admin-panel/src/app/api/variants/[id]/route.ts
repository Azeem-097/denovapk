import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { updateVariantStock } from "@/lib/db/repositories/products";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const body   = await req.json();

    if (body.stock === undefined) {
      return NextResponse.json({ error: "stock value required" }, { status: 400 });
    }

    await updateVariantStock(id, Number(body.stock));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update variant error:", err);
    return NextResponse.json({ error: "Failed to update variant" }, { status: 500 });
  }
}