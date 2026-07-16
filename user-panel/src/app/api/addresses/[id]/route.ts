import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { now } from "@/lib/db/helpers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();

    // Verify address belongs to this user
    const addrResult = await db.execute({
      sql:  "SELECT id, userId FROM addresses WHERE id = ? LIMIT 1",
      args: [id],
    });

    if (addrResult.rows.length === 0) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const addr = addrResult.rows[0] as unknown as { id: string; userId: string };
    if (addr.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build update
    const sets: string[] = [];
    const args: (string | number)[] = [];

    if (body.label      !== undefined) { sets.push("label = ?");      args.push(body.label); }
    if (body.fullName   !== undefined) { sets.push("fullName = ?");   args.push(body.fullName); }
    if (body.phone      !== undefined) { sets.push("phone = ?");      args.push(body.phone); }
    if (body.street     !== undefined) { sets.push("street = ?");     args.push(body.street); }
    if (body.apartment  !== undefined) { sets.push("apartment = ?");  args.push(body.apartment ?? ""); }
    if (body.city       !== undefined) { sets.push("city = ?");       args.push(body.city); }
    if (body.province   !== undefined) { sets.push("province = ?");   args.push(body.province); }
    if (body.postalCode !== undefined) { sets.push("postalCode = ?"); args.push(body.postalCode); }

    if (body.isDefault !== undefined) {
      const isDefault = body.isDefault === true || body.isDefault === 1 || body.isDefault === "1";
      sets.push("isDefault = ?");
      args.push(isDefault ? 1 : 0);
    }

    if (sets.length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    sets.push("updatedAt = ?");
    args.push(now());
    args.push(id);

    await db.execute({
      sql:  `UPDATE addresses SET ${sets.join(", ")} WHERE id = ?`,
      args,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Address update error:", err);
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;

    // Verify ownership
    const addrResult = await db.execute({
      sql:  "SELECT userId FROM addresses WHERE id = ? LIMIT 1",
      args: [id],
    });

    if (addrResult.rows.length === 0) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const addr = addrResult.rows[0] as unknown as { userId: string };
    if (addr.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if any orders reference this address
    const orderCheck = await db.execute({
      sql:  "SELECT COUNT(*) as c FROM orders WHERE addressId = ?",
      args: [id],
    });

    const orderCount = Number(orderCheck.rows[0].c);

    if (orderCount > 0) {
      // Don't delete if orders reference it - just clear default flag
      await db.execute({
        sql:  "UPDATE addresses SET isDefault = 0, updatedAt = ? WHERE id = ?",
        args: [now(), id],
      });
      // Soft-delete approach: we could mark it as deleted but keep the data
      // For now, we'll still delete it and let orders keep their shippingAddress JSON snapshot
    }

    // Delete the address
    await db.execute({
      sql:  "DELETE FROM addresses WHERE id = ?",
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Address delete error:", err);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}