import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserOrders } from "@/lib/db/repositories/orders";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ orders: [], stats: null }, { status: 200 });

  const dbOrders = await getUserOrders(user.id);

  // Convert to frontend-friendly format
  const orders = dbOrders.map((o) => ({
    id:            o.id,
    orderNumber:   o.orderNumber,
    status:        o.status.toLowerCase(),
    paymentStatus: o.paymentStatus.toLowerCase(),
    paymentMethod: o.paymentMethod,
    subtotal:      o.subtotal / 100,     // paisa → rupees
    discount:      o.discount / 100,
    shipping:      o.shipping / 100,
    total:         o.total / 100,
    itemCount:     o.items.reduce((s, i) => s + i.quantity, 0),
    items:         o.items.map((item) => ({
      id:       item.id,
      name:     item.name,
      image:    item.image,
      size:     item.size,
      color:    item.color,
      price:    item.price / 100,
      quantity: item.quantity,
    })),
    createdAt:     new Date(o.createdAt * 1000).toISOString(),
    trackingNumber: o.trackingNumber,
  }));

  // Calculate stats
  const stats = {
    totalOrders:  orders.length,
    totalSpent:   orders.reduce((sum, o) => sum + o.total, 0),
    lastOrderAt:  orders[0]?.createdAt ?? null,
  };

  return NextResponse.json({ orders, stats });
}