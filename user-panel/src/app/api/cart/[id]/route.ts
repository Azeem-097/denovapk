import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateCartItemQty, removeFromCart, getCartWithItems } from "@/lib/db/repositories/cart";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { id } = await params;
  const { quantity } = await req.json();

  await updateCartItemQty(user.id, id, quantity);
  const cart = await getCartWithItems(user.id);
  return NextResponse.json({ cart });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { id } = await params;
  await removeFromCart(user.id, id);
  const cart = await getCartWithItems(user.id);
  return NextResponse.json({ cart });
}