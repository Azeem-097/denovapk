import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { updateCollection, deleteCollection, getCollectionProductCount } from "@/lib/db/repositories/collections";

// ─── PATCH /api/collections/[id] ────────────────────────
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await req.json();

    const updates: Record<string, unknown> = {};
    if (body.name            !== undefined) updates.name            = String(body.name).trim();
    if (body.slug            !== undefined) updates.slug            = String(body.slug).trim();
    if (body.description     !== undefined) updates.description     = body.description;
    if (body.image           !== undefined) updates.image           = body.image || null;
    if (body.isActive        !== undefined) updates.isActive        = !!body.isActive;
    if (body.sortOrder       !== undefined) updates.sortOrder       = Number(body.sortOrder);
    if (body.metaTitle       !== undefined) updates.metaTitle       = body.metaTitle;
    if (body.metaDescription !== undefined) updates.metaDescription = body.metaDescription;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    await updateCollection(id, updates);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes("already exists")) {
      return NextResponse.json({ error: msg }, { status: 409 });
    }
    console.error("Update collection error:", err);
    return NextResponse.json({ error: "Update failed: " + msg }, { status: 500 });
  }
}

// ─── DELETE /api/collections/[id] ───────────────────────
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const productCount = await getCollectionProductCount(id);

    await deleteCollection(id);

    return NextResponse.json({
      success: true,
      unlinkedProducts: productCount,
    });
  } catch (err) {
    console.error("Delete collection error:", err);
    return NextResponse.json(
      { error: "Delete failed: " + (err as Error).message },
      { status: 500 }
    );
  }
}