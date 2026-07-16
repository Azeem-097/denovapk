import { db } from "@/lib/db/client";
import { generateId, now } from "@/lib/db/helpers";
import type { DbCollection } from "@/lib/db/types";

// ─── Read ────────────────────────────────────────────────
export async function getAllCollections(activeOnly = true): Promise<DbCollection[]> {
  const sql = activeOnly
    ? "SELECT * FROM collections WHERE isActive = 1 ORDER BY sortOrder ASC, name ASC"
    : "SELECT * FROM collections ORDER BY sortOrder ASC, name ASC";
  const result = await db.execute(sql);
  return result.rows as unknown as DbCollection[];
}

export async function getCollectionBySlug(slug: string): Promise<DbCollection | null> {
  const result = await db.execute({
    sql:  "SELECT * FROM collections WHERE slug = ? LIMIT 1",
    args: [slug],
  });
  return (result.rows[0] as unknown as DbCollection) ?? null;
}

export async function getCollectionById(id: string): Promise<DbCollection | null> {
  const result = await db.execute({
    sql:  "SELECT * FROM collections WHERE id = ? LIMIT 1",
    args: [id],
  });
  return (result.rows[0] as unknown as DbCollection) ?? null;
}

/**
 * Get collections with product counts.
 * By default (activeOnly=true) returns only active collections + only PUBLISHED product counts.
 * Pass activeOnly=false to get ALL collections + ALL product counts (for admin panel).
 */
export async function getCollectionsWithCounts(
  activeOnly = true
): Promise<Array<DbCollection & { productCount: number }>> {
  if (activeOnly) {
    const result = await db.execute(`
      SELECT c.*, COUNT(p.id) as productCount
      FROM collections c
      LEFT JOIN products p ON p.collectionId = c.id AND p.status = 'PUBLISHED'
      WHERE c.isActive = 1
      GROUP BY c.id
      ORDER BY c.sortOrder ASC, c.name ASC
    `);
    return result.rows as unknown as Array<DbCollection & { productCount: number }>;
  }

  // Admin view - all collections, all product counts
  const result = await db.execute(`
    SELECT c.*, COUNT(p.id) as productCount
    FROM collections c
    LEFT JOIN products p ON p.collectionId = c.id
    GROUP BY c.id
    ORDER BY c.sortOrder ASC, c.name ASC
  `);
  return result.rows as unknown as Array<DbCollection & { productCount: number }>;
}

// ═══════════════════════════════════════════════════════
//  ADMIN CRUD
// ═══════════════════════════════════════════════════════

export interface CreateCollectionInput {
  name:             string;
  slug:             string;
  description?:     string;
  image?:           string | null;
  isActive?:        boolean;
  sortOrder?:       number;
  metaTitle?:       string;
  metaDescription?: string;
}

export async function createCollection(input: CreateCollectionInput): Promise<string> {
  const id = generateId();
  const t  = now();

  // Check for duplicate slug
  const existing = await getCollectionBySlug(input.slug);
  if (existing) {
    throw new Error(`Slug "${input.slug}" already exists`);
  }

  await db.execute({
    sql: `INSERT INTO collections (
      id, name, slug, description, image, isActive, sortOrder,
      metaTitle, metaDescription, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.name,
      input.slug,
      input.description ?? "",
      input.image ?? null,
      input.isActive === false ? 0 : 1,
      input.sortOrder ?? 0,
      input.metaTitle ?? null,
      input.metaDescription ?? null,
      t, t,
    ],
  });

  return id;
}

export async function updateCollection(
  id: string,
  updates: Partial<CreateCollectionInput>
): Promise<void> {
  const sets: string[] = [];
  const args: (string | number | null)[] = [];

  // If slug is changing, ensure uniqueness
  if (updates.slug !== undefined) {
    const existing = await getCollectionBySlug(updates.slug);
    if (existing && existing.id !== id) {
      throw new Error(`Slug "${updates.slug}" already exists`);
    }
  }

  if (updates.name            !== undefined) { sets.push("name = ?");            args.push(updates.name); }
  if (updates.slug            !== undefined) { sets.push("slug = ?");            args.push(updates.slug); }
  if (updates.description     !== undefined) { sets.push("description = ?");     args.push(updates.description); }
  if (updates.image           !== undefined) { sets.push("image = ?");           args.push(updates.image); }
  if (updates.isActive        !== undefined) { sets.push("isActive = ?");        args.push(updates.isActive ? 1 : 0); }
  if (updates.sortOrder       !== undefined) { sets.push("sortOrder = ?");       args.push(updates.sortOrder); }
  if (updates.metaTitle       !== undefined) { sets.push("metaTitle = ?");       args.push(updates.metaTitle); }
  if (updates.metaDescription !== undefined) { sets.push("metaDescription = ?"); args.push(updates.metaDescription); }

  if (sets.length === 0) return;

  sets.push("updatedAt = ?");
  args.push(now());
  args.push(id);

  await db.execute({
    sql:  `UPDATE collections SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
}

/**
 * Delete a collection.
 * Sets collectionId = NULL on any products assigned to it (does NOT delete products).
 */
export async function deleteCollection(id: string): Promise<void> {
  // Unlink products first
  await db.execute({
    sql:  "UPDATE products SET collectionId = NULL, updatedAt = ? WHERE collectionId = ?",
    args: [now(), id],
  });

  // Delete the collection
  await db.execute({
    sql:  "DELETE FROM collections WHERE id = ?",
    args: [id],
  });
}

/**
 * Count products in a collection (all statuses).
 */
export async function getCollectionProductCount(id: string): Promise<number> {
  const result = await db.execute({
    sql:  "SELECT COUNT(*) as c FROM products WHERE collectionId = ?",
    args: [id],
  });
  return Number(result.rows[0].c);
}