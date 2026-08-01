import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { generateId, now } from "@/lib/db/helpers";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254).transform((v) => v.toLowerCase()),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(4000),
  company: z.string().trim().max(200).optional(),
});

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const submissions = new Map<string, number[]>();

function getClientKey(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || req.headers.get("x-real-ip") || "unknown";
  return `${ip}:${req.headers.get("user-agent") ?? "unknown"}`;
}

function isRateLimited(key: string) {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
  const recent = (submissions.get(key) ?? []).filter((ts) => ts > cutoff);
  if (recent.length >= RATE_LIMIT_MAX) {
    submissions.set(key, recent);
    return true;
  }
  recent.push(Date.now());
  submissions.set(key, recent);
  return false;
}

export async function POST(req: Request) {
  try {
    if (isRateLimited(getClientKey(req))) {
      return NextResponse.json(
        { error: "Too many contact requests. Please try again later." },
        { status: 429 }
      );
    }

    const parsed = contactSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Please check the highlighted fields.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, phone, subject, message, company } = parsed.data;
    if (company) {
      return NextResponse.json({ success: true }, { status: 202 });
    }

    await db.execute({
      sql:  "INSERT INTO contact_messages (id, name, email, phone, subject, message, isRead, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)",
      args: [generateId(), name, email, phone || null, subject, message, now(), now()],
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Contact message insert failed:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
