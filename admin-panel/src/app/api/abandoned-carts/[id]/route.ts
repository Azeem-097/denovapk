import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { markCartContacted, deleteAbandonedCart } from "@/lib/db/repositories/abandonedCart";

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  await markCartContacted(id);
  return NextResponse.json({ success: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  await deleteAbandonedCart(id);
  return NextResponse.json({ success: true });
}