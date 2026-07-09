import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { generateId, now } from "@/lib/db/helpers";

export async function POST(req: Request) {
  try {
    const { name, email, phone, subject, message } = await req.json();
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await db.execute({
      sql:  "INSERT INTO contact_messages (id, name, email, phone, subject, message, isRead, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)",
      args: [generateId(), name, email, phone ?? null, subject, message, now(), now()],
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}