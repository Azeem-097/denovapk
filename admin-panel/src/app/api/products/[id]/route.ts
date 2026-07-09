import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { updateProduct, deleteProduct } from "@/lib/db/repositories/products";
import { rupeesToPaisa } from "@/lib/priceUtils";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await req.json();

    const updates: Record<string, unknown> = {};
    if (body.name         !== undefined) updates.name         = body.name;
    if (body.slug         !== undefined) updates.slug         = body.slug;
    if (body.sku          !== undefined) updates.sku          = body.sku;
    if (body.description  !== undefined) updates.description  = body.description;
    if (body.price        !== undefined) updates.price        = rupeesToPaisa(body.price);
    if (body.comparePrice !== undefined) updates.comparePrice = body.comparePrice ? rupeesToPaisa(body.comparePrice) : null;
    if (body.collectionId !== undefined) updates.collectionId = body.collectionId;
    if (body.status       !== undefined) updates.status       = body.status.toUpperCase();
    if (body.isNew        !== undefined) updates.isNew        = body.isNew;
    if (body.isFeatured   !== undefined) updates.isFeatured   = body.isFeatured;
    if (body.isBestSeller !== undefined) updates.isBestSeller = body.isBestSeller;
    if (body.tags         !== undefined) updates.tags         = Array.isArray(body.tags) ? body.tags : body.tags.split(",");

    await updateProduct(id, updates);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    await deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}