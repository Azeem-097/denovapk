import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { generateId, now } from "@/lib/db/helpers";

export async function POST(req: Request) {
  try {
    const { email, source } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const existing = await db.execute({
      sql: "SELECT id FROM newsletter WHERE email = ?",
      args: [email.toLowerCase()],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json({ message: "Already subscribed" });
    }

    await db.execute({
      sql:  "INSERT INTO newsletter (id, email, isSubscribed, source, createdAt, updatedAt) VALUES (?, ?, 1, ?, ?, ?)",
      args: [generateId(), email.toLowerCase(), source ?? "footer", now(), now()],
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}