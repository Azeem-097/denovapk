import { NextResponse } from "next/server";
import { getOrderByNumber } from "@/lib/db/repositories/orders";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";

/**
 * Public order tracking endpoint.
 * No authentication required, but:
 * - Only returns non-sensitive info by default
 * - If email is provided and matches, returns fuller details
 * - Rate-limiting should be added in production (nginx / Cloudflare)
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const rawNumber = url.searchParams.get("number")?.trim() ?? "";
  const emailInput = url.searchParams.get("email")?.trim().toLowerCase() ?? "";

  if (!rawNumber) {
    return NextResponse.json(
      { error: "Order number is required" },
      { status: 400 }
    );
  }

  // Normalize: strip #, whitespace, and uppercase
  const orderNumber = rawNumber.replace(/^#+/, "").replace(/\s+/g, "").toUpperCase();

  if (orderNumber.length < 4) {
    return NextResponse.json(
      { error: "Invalid order number format" },
      { status: 400 }
    );
  }

  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    return NextResponse.json(
      { error: "No order found with that number. Please check and try again." },
      { status: 404 }
    );
  }

  // ── Email verification (optional) ────────────────────
  // If email was provided, it must match either:
  //  - guest email on the order, OR
  //  - the account owner's email
  let emailMatches = false;
  if (emailInput) {
    const guestEmail = (order.guestEmail ?? "").toLowerCase();
    if (guestEmail && guestEmail === emailInput) {
      emailMatches = true;
    } else if (order.userId) {
      // Fetch the account owner's email
      const userResult = await db.execute({
        sql:  "SELECT email FROM users WHERE id = ? LIMIT 1",
        args: [order.userId],
      });
      const ownerEmail = (userResult.rows[0]?.email as string ?? "").toLowerCase();
      if (ownerEmail && ownerEmail === emailInput) {
        emailMatches = true;
      }
    }

    if (!emailMatches) {
      return NextResponse.json(
        { error: "Order number and email do not match. Please double-check both." },
        { status: 404 }
      );
    }
  }

  // ── Build safe response ──────────────────────────────
  // If email verified, include full items list. Otherwise, just item count.
  const safeResponse = {
    id:             order.id,
    orderNumber:    order.orderNumber,
    status:         order.status.toLowerCase(),
    paymentStatus:  order.paymentStatus.toLowerCase(),
    paymentMethod:  order.paymentMethod,
    itemCount:      order.items.reduce((sum, i) => sum + i.quantity, 0),
    total:          order.total / 100,
    createdAt:      new Date(order.createdAt * 1000).toISOString(),
    confirmedAt:    order.confirmedAt ? new Date(order.confirmedAt * 1000).toISOString() : null,
    shippedAt:      order.shippedAt   ? new Date(order.shippedAt   * 1000).toISOString() : null,
    deliveredAt:    order.deliveredAt ? new Date(order.deliveredAt * 1000).toISOString() : null,
    cancelledAt:    order.cancelledAt ? new Date(order.cancelledAt * 1000).toISOString() : null,
    trackingNumber: order.trackingNumber,
    courierName:    order.courierName,
    shippingMethod: order.shippingMethod,

    // Shipping address - only city + first name if unverified
    shippingCity: order.address?.city ?? extractCity(order.shippingAddress),
    shippingName: emailMatches
      ? (order.address?.fullName ?? order.guestName ?? "")
      : maskName(order.address?.fullName ?? order.guestName ?? ""),

    // Items - only if verified
    items: emailMatches
      ? order.items.map((item) => ({
          id:       item.id,
          name:     item.name,
          image:    item.image,
          size:     item.size,
          color:    item.color,
          price:    item.price / 100,
          quantity: item.quantity,
        }))
      : [],

    // Flag so UI knows how much to show
    verified: emailMatches,
  };

  return NextResponse.json({ order: safeResponse });
}

// ─── Helpers ─────────────────────────────────────────────
function extractCity(shippingAddressJson: string | null): string {
  if (!shippingAddressJson) return "";
  try {
    const parsed = JSON.parse(shippingAddressJson);
    return parsed?.city ?? "";
  } catch {
    return "";
  }
}

function maskName(name: string): string {
  if (!name) return "";
  const parts = name.split(" ");
  return parts
    .map((p, i) => {
      if (i === 0) return p;                        // First name visible
      if (p.length <= 1) return p;
      return p.charAt(0) + "***";                   // Rest masked
    })
    .join(" ");
}