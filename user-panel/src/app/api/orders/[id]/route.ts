import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrderById } from "@/lib/db/repositories/orders";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Security: users can only see their own orders
  if (order.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    order: {
      id:            order.id,
      orderNumber:   order.orderNumber,
      status:        order.status.toLowerCase(),
      paymentStatus: order.paymentStatus.toLowerCase(),
      paymentMethod: order.paymentMethod,
      subtotal:      order.subtotal / 100,
      discount:      order.discount / 100,
      shipping:      order.shipping / 100,
      total:         order.total / 100,
      items:         order.items.map((item) => ({
        id:       item.id,
        name:     item.name,
        image:    item.image,
        size:     item.size,
        color:    item.color,
        price:    item.price / 100,
        quantity: item.quantity,
      })),
      createdAt:      new Date(order.createdAt * 1000).toISOString(),
      trackingNumber: order.trackingNumber,
      shippingMethod: order.shippingMethod,
      address:        order.address,
    },
  });
}