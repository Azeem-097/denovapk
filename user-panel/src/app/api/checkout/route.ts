import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createOrder } from "@/lib/db/repositories/orders";
import { clearCart } from "@/lib/db/repositories/cart";
import { validateDiscount } from "@/lib/db/repositories/discounts";
import { createAddress } from "@/lib/db/repositories/users";
import { rupeesToPaisa } from "@/lib/priceUtils";
import type { PaymentMethod } from "@/lib/db/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      shipping,       // { firstName, lastName, email, phone, address, apartment, city, province, postalCode, notes }
      shippingMethod, // { id, name, time, price }
      paymentMethod,  // "cod" | "card" | etc
      items,          // cart items
      discountCode,   // optional
      saveAddress,    // bool - save address for logged-in user
    } = body;

    if (!shipping || !items || items.length === 0 || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await getCurrentUser();

    // Convert items: rupees → paisa
    const orderItems = items.map((item: {
      productId: string; variantId: string; name: string; image: string;
      size: string; color: string; price: number; quantity: number;
    }) => ({
      productId: item.productId,
      variantId: item.variantId,
      name:      item.name,
      image:     item.image,
      size:      item.size,
      color:     item.color,
      sku:       "", // Will be filled from variant if needed
      price:     rupeesToPaisa(item.price),
      quantity:  item.quantity,
    }));

    // Calculate totals
    const subtotal = orderItems.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0);
    const shippingCost = rupeesToPaisa(shippingMethod?.price ?? 0);

    // Validate discount if provided
    let discountAmount = 0;
    let discountId: string | undefined;
    if (discountCode) {
      const validation = await validateDiscount(discountCode, subtotal);
      if (validation.valid) {
        discountAmount = validation.amount!;
        discountId     = validation.discount!.id;
      }
    }

    const total = subtotal - discountAmount + shippingCost;

    // Save address if logged in and requested
    let addressId: string | null = null;
    if (user && saveAddress) {
      const addr = await createAddress({
        userId:     user.id,
        label:      "Checkout Address",
        fullName:   `${shipping.firstName} ${shipping.lastName}`,
        phone:      shipping.phone,
        street:     shipping.address,
        apartment:  shipping.apartment,
        city:       shipping.city,
        province:   shipping.province,
        postalCode: shipping.postalCode,
        isDefault:  false,
      });
      addressId = addr.id;
    }

    // Create the order
    const order = await createOrder({
      userId:       user?.id ?? null,
      guestEmail:   user ? undefined : shipping.email,
      guestName:    user ? undefined : `${shipping.firstName} ${shipping.lastName}`,
      guestPhone:   user ? undefined : shipping.phone,
      items:        orderItems,
      subtotal,
      discount:     discountAmount,
      shipping:     shippingCost,
      total,
      paymentMethod: paymentMethod.toUpperCase() as PaymentMethod,
      addressId,
      shippingAddress: {
        fullName:   `${shipping.firstName} ${shipping.lastName}`,
        phone:      shipping.phone,
        email:      shipping.email,
        street:     shipping.address,
        apartment:  shipping.apartment,
        city:       shipping.city,
        province:   shipping.province,
        postalCode: shipping.postalCode,
      },
      shippingMethod: shippingMethod?.name ?? "Standard Delivery",
      customerNote:   shipping.notes,
      discountCode:   discountCode || undefined,
      discountId,
    });

    // Clear cart if logged in
    if (user) {
      await clearCart(user.id);
    }

    return NextResponse.json({
      success:     true,
      orderId:     order.id,
      orderNumber: order.orderNumber,
      total:       order.total / 100,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}