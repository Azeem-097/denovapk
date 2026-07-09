import { db } from "@/lib/db/client";
import { generateId, now } from "@/lib/db/helpers";
import type { DbUser, DbAddress } from "@/lib/db/types";
import bcrypt from "bcryptjs";

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const result = await db.execute({
    sql:  "SELECT * FROM users WHERE email = ? LIMIT 1",
    args: [email.toLowerCase()],
  });
  return (result.rows[0] as unknown as DbUser) ?? null;
}

export async function getUserById(id: string): Promise<DbUser | null> {
  const result = await db.execute({
    sql:  "SELECT * FROM users WHERE id = ? LIMIT 1",
    args: [id],
  });
  return (result.rows[0] as unknown as DbUser) ?? null;
}

export async function createUser(input: {
  name:     string;
  email:    string;
  password: string;
  phone?:   string;
}): Promise<DbUser> {
  const id           = generateId();
  const hashedPw     = await bcrypt.hash(input.password, 10);
  const currentTime  = now();

  await db.execute({
    sql: `INSERT INTO users (id, name, email, password, phone, isActive, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
    args: [id, input.name, input.email.toLowerCase(), hashedPw, input.phone ?? null, currentTime, currentTime],
  });

  return (await getUserById(id))!;
}

export async function verifyUserPassword(email: string, password: string): Promise<DbUser | null> {
  const user = await getUserByEmail(email);
  if (!user || !user.password) return null;
  const valid = await bcrypt.compare(password, user.password);
  return valid ? user : null;
}

export async function updateUser(id: string, updates: {
  name?:  string;
  email?: string;
  phone?: string;
}): Promise<void> {
  const sets: string[] = [];
  const args: (string | number)[] = [];

  if (updates.name  !== undefined) { sets.push("name = ?");  args.push(updates.name); }
  if (updates.email !== undefined) { sets.push("email = ?"); args.push(updates.email.toLowerCase()); }
  if (updates.phone !== undefined) { sets.push("phone = ?"); args.push(updates.phone); }

  if (sets.length === 0) return;

  sets.push("updatedAt = ?");
  args.push(now());
  args.push(id);

  await db.execute({
    sql:  `UPDATE users SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
}

export async function changeUserPassword(id: string, newPassword: string): Promise<void> {
  const hashedPw = await bcrypt.hash(newPassword, 10);
  await db.execute({
    sql:  "UPDATE users SET password = ?, updatedAt = ? WHERE id = ?",
    args: [hashedPw, now(), id],
  });
}

// ─── Addresses ───────────────────────────────────────────
export async function getUserAddresses(userId: string): Promise<DbAddress[]> {
  const result = await db.execute({
    sql:  "SELECT * FROM addresses WHERE userId = ? ORDER BY isDefault DESC, createdAt DESC",
    args: [userId],
  });
  return result.rows as unknown as DbAddress[];
}

export async function createAddress(input: {
  userId:     string;
  label:      string;
  fullName:   string;
  phone:      string;
  street:     string;
  apartment?: string;
  city:       string;
  province:   string;
  postalCode: string;
  isDefault?: boolean;
}): Promise<DbAddress> {
  const id = generateId();
  const t  = now();

  // If setting as default, unset others
  if (input.isDefault) {
    await db.execute({
      sql:  "UPDATE addresses SET isDefault = 0 WHERE userId = ?",
      args: [input.userId],
    });
  }

  await db.execute({
    sql: `INSERT INTO addresses (id, userId, label, fullName, phone, street, apartment, city, province, postalCode, isDefault, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, input.userId, input.label, input.fullName, input.phone, input.street,
           input.apartment ?? null, input.city, input.province, input.postalCode,
           input.isDefault ? 1 : 0, t, t],
  });

  const result = await db.execute({ sql: "SELECT * FROM addresses WHERE id = ?", args: [id] });
  return result.rows[0] as unknown as DbAddress;
}

export async function updateAddress(id: string, updates: Partial<Omit<DbAddress, "id" | "userId" | "createdAt">>): Promise<void> {
  const sets: string[] = [];
  const args: (string | number)[] = [];

  Object.entries(updates).forEach(([key, val]) => {
    if (val !== undefined) {
      sets.push(`${key} = ?`);
      args.push(val as string | number);
    }
  });

  if (sets.length === 0) return;

  sets.push("updatedAt = ?");
  args.push(now());
  args.push(id);

  await db.execute({
    sql:  `UPDATE addresses SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
}

export async function deleteAddress(id: string): Promise<void> {
  await db.execute({ sql: "DELETE FROM addresses WHERE id = ?", args: [id] });
}

export async function setDefaultAddress(userId: string, addressId: string): Promise<void> {
  await db.execute({ sql: "UPDATE addresses SET isDefault = 0 WHERE userId = ?", args: [userId] });
  await db.execute({ sql: "UPDATE addresses SET isDefault = 1, updatedAt = ? WHERE id = ?", args: [now(), addressId] });
}