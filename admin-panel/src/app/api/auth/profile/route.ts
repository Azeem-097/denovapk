import { NextResponse } from "next/server";
import { getCurrentAdmin, verifyPassword, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { now } from "@/lib/db/helpers";
import type { DbAdmin } from "@/lib/db/types";

export async function PATCH(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      email,
      currentPassword,
      newPassword,
    } = body as {
      name?:            string;
      email?:           string;
      currentPassword?: string;
      newPassword?:     string;
    };

    // ─── Validate ────────────────────────────────────────
    if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }
    if (email !== undefined) {
      if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
      }
      // Check email not already used by another admin
      const dup = await db.execute({
        sql:  "SELECT id FROM admins WHERE email = ? AND id != ? LIMIT 1",
        args: [email.toLowerCase(), admin.id],
      });
      if (dup.rows.length > 0) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }

    // ─── Password change requires currentPassword ────────
    let newPasswordHash: string | undefined;
    if (newPassword) {
      const strong =
        newPassword.length >= 12 &&
        /[a-z]/.test(newPassword) &&
        /[A-Z]/.test(newPassword) &&
        /[0-9]/.test(newPassword) &&
        /[^A-Za-z0-9]/.test(newPassword);
      if (!strong) {
        return NextResponse.json({ error: "Use at least 12 characters with upper, lower, number, and symbol." }, { status: 400 });
      }
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password required to set a new one" }, { status: 400 });
      }
      // Fetch current hash
      const result = await db.execute({
        sql:  "SELECT * FROM admins WHERE id = ? LIMIT 1",
        args: [admin.id],
      });
      const dbAdmin = result.rows[0] as unknown as DbAdmin | undefined;
      if (!dbAdmin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

      const valid = await verifyPassword(currentPassword, dbAdmin.password);
      if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

      newPasswordHash = await hashPassword(newPassword);
    }

    // ─── Build update ───────────────────────────────────
    const sets: string[] = [];
    const args: (string | number)[] = [];

    if (name  !== undefined) { sets.push("name = ?");  args.push(name.trim()); }
    if (email !== undefined) { sets.push("email = ?"); args.push(email.toLowerCase()); }
    if (newPasswordHash) {
      sets.push("password = ?");
      args.push(newPasswordHash);
      sets.push("passwordChangeRequired = 0");
    }

    if (sets.length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    sets.push("updatedAt = ?");
    args.push(now());
    args.push(admin.id);

    await db.execute({
      sql:  `UPDATE admins SET ${sets.join(", ")} WHERE id = ?`,
      args,
    });

    // Return fresh profile
    const updated = await getCurrentAdmin();
    return NextResponse.json({ admin: updated });
  } catch (err) {
    console.error("Update admin profile error:", err);
    return NextResponse.json(
      { error: "Failed to update profile: " + (err as Error).message },
      { status: 500 }
    );
  }
}
