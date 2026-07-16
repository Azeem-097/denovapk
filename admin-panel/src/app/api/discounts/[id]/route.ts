import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db/client";
import { now } from "@/lib/db/helpers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await req.json();

    const sets: string[] = [];
    const args: (string | number)[] = [];

    if (body.code      !== undefined) { sets.push("code = ?");      args.push(body.code.toUpperCase()); }
    if (body.type      !== undefined) { sets.push("type = ?");      args.push(body.type.toUpperCase()); }
    if (body.value     !== undefined) { sets.push("value = ?");     args.push(Number(body.value)); }
    if (body.minOrder  !== undefined) { sets.push("minOrder = ?");  args.push(Number(body.minOrder)); }
    if (body.maxUses   !== undefined) { sets.push("maxUses = ?");   args.push(Number(body.maxUses)); }
    if (body.status    !== undefined) { sets.push("status = ?");    args.push(body.status.toUpperCase()); }
    if (body.expiresAt !== undefined) {
      sets.push("expiresAt = ?");
      args.push(Math.floor(new Date(body.expiresAt).getTime() / 1000));
    }

    if (sets.length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    sets.push("updatedAt = ?");
    args.push(now());
    args.push(id);

    await db.execute({
      sql: `UPDATE discounts SET ${sets.join(", ")} WHERE id = ?`,
      args,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update discount error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    await db.execute({ sql: "DELETE FROM discounts WHERE id = ?", args: [id] });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete discount error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}