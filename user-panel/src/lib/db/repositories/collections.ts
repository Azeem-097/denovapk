import { db } from "@/lib/db/client";
import type { DbCollection } from "@/lib/db/types";

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
 * Get collections with product counts AND price ranges.
 * Price ranges are in PAISA (integer). Convert to rupees in the adapter.
 * Only counts PUBLISHED products (customer-facing).
 */
export async function getCollectionsWithCounts(): Promise<
  Array<DbCollection & { productCount: number; minPrice: number | null; maxPrice: number | null }>
> {
  const result = await db.execute(`
    SELECT
      c.*,
      COUNT(p.id) as productCount,
      MIN(p.price) as minPrice,
      MAX(p.price) as maxPrice
    FROM collections c
    LEFT JOIN products p ON p.collectionId = c.id AND p.status = 'PUBLISHED'
    WHERE c.isActive = 1
    GROUP BY c.id
    ORDER BY c.sortOrder ASC, c.name ASC
  `);

  return result.rows.map((r) => ({
    id:              r.id as string,
    name:            r.name as string,
    slug:            r.slug as string,
    description:     r.description as string,
    image:           r.image as string | null,
    isActive:        Number(r.isActive),
    sortOrder:       Number(r.sortOrder),
    metaTitle:       r.metaTitle as string | null,
    metaDescription: r.metaDescription as string | null,
    createdAt:       Number(r.createdAt),
    updatedAt:       Number(r.updatedAt),
    productCount:    Number(r.productCount),
    minPrice:        r.minPrice !== null ? Number(r.minPrice) : null,
    maxPrice:        r.maxPrice !== null ? Number(r.maxPrice) : null,
  }));
}