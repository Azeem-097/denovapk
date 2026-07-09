import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCartWithItems, addToCart, clearCart, mergeGuestCart } from "@/lib/db/repositories/cart";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [] });

  const cart = await getCartWithItems(user.id);
  return NextResponse.json({ cart });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  try {
    const { productId, variantId, quantity, merge } = await req.json();

    // Merge mode: sync entire local cart
    if (merge && Array.isArray(merge)) {
      await mergeGuestCart(user.id, merge);
      const cart = await getCartWithItems(user.id);
      return NextResponse.json({ cart });
    }

    // Single add
    if (!productId || !variantId || !quantity) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    await addToCart(user.id, productId, variantId, quantity);
    const cart = await getCartWithItems(user.id);
    return NextResponse.json({ cart });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  await clearCart(user.id);
  return NextResponse.json({ success: true });
}