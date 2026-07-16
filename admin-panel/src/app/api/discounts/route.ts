import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db/client";
import { generateId, now } from "@/lib/db/helpers";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const result = await db.execute("SELECT * FROM discounts ORDER BY createdAt DESC");
  return NextResponse.json({ discounts: result.rows });
}

export async function POST(req: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { code, type, value, minOrder, maxUses, expiresAt, status } = await req.json();

    if (!code || !type || value === undefined) {
      return NextResponse.json({ error: "Code, type, and value are required" }, { status: 400 });
    }

    // Check for duplicate code
    const existing = await db.execute({
      sql: "SELECT id FROM discounts WHERE code = ? COLLATE NOCASE LIMIT 1",
      args: [code.toUpperCase()],
    });
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Discount code already exists" }, { status: 409 });
    }

    const id = generateId();
    const t  = now();

    // Parse expiry date
    let expiryTimestamp = t + (365 * 24 * 60 * 60); // Default: 1 year
    if (expiresAt) {
      expiryTimestamp = Math.floor(new Date(expiresAt).getTime() / 1000);
    }

    await db.execute({
      sql: `INSERT INTO discounts (id, code, type, value, minOrder, maxUses, usedCount, status, expiresAt, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
      args: [
        id,
        code.toUpperCase(),
        type.toUpperCase(),
        Number(value),
        Number(minOrder || 0),
        Number(maxUses || 1000),
        (status || "ACTIVE").toUpperCase(),
        expiryTimestamp,
        t, t,
      ],
    });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (err) {
    console.error("Create discount error:", err);
    return NextResponse.json({ error: "Failed to create discount" }, { status: 500 });
  }
}