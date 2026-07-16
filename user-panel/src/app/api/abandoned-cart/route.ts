import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { upsertAbandonedCart } from "@/lib/db/repositories/abandonedCart";
import { getBoolSetting } from "@/lib/db/repositories/settings";
import { rupeesToPaisa } from "@/lib/priceUtils";

export async function POST(req: Request) {
  try {
    // Check if feature is enabled
    const enabled = await getBoolSetting("abandoned_cart_enabled", true);
    if (!enabled) return NextResponse.json({ success: false, disabled: true });

    const body = await req.json();
    const { items, subtotal, checkoutData } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }

    // Get current user (if logged in)
    const user = await getCurrentUser();

    // Convert cart items to abandoned cart items format (prices in paisa)
    const abandonedItems = items.map((item: {
      productId: string; variantId: string; name: string; image: string;
      size: string; color: string; price: number; quantity: number; slug: string;
    }) => ({
      productId: item.productId,
      variantId: item.variantId,
      name:      item.name,
      image:     item.image,
      size:      item.size,
      color:     item.color,
      price:     rupeesToPaisa(item.price),
      quantity:  item.quantity,
      slug:      item.slug,
    }));

    const totalValue = abandonedItems.reduce(
      (sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity,
      0
    );

    // If user is logged in, use their info; otherwise use checkout form data
    const cartData = {
      userId:   user?.id ?? null,
      email:    checkoutData?.email    ?? user?.email ?? null,
      phone:    checkoutData?.phone    ?? user?.phone ?? null,
      fullName: checkoutData?.fullName ?? user?.name  ?? null,
      city:     checkoutData?.city     ?? null,
      items:    abandonedItems,
      subtotal: rupeesToPaisa(subtotal ?? 0),
      totalValue,
      reachedCheckout: !!checkoutData,
    };

    // Only track if we have SOME way to contact the customer
    if (!cartData.userId && !cartData.phone && !cartData.email) {
      return NextResponse.json({ success: false, reason: "no_contact_info" });
    }

    const cartId = await upsertAbandonedCart(cartData);

    return NextResponse.json({ success: true, cartId });
  } catch (err) {
    console.error("Abandoned cart tracking error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}