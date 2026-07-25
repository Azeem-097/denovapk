import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { updateOrderStatus, updatePaymentStatus } from "@/lib/db/repositories/orders";
import type { OrderStatus, PaymentStatus } from "@/lib/db/types";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const { status, trackingNumber, paymentStatus } = await req.json();

    if (status) {
      await updateOrderStatus(id, status as OrderStatus, trackingNumber);
    }
    if (paymentStatus) {
      await updatePaymentStatus(id, paymentStatus as PaymentStatus);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
