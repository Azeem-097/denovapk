import { db } from "@/lib/db/client";
import { generateId, now, tagsToArray } from "@/lib/db/helpers";
import type {
  DbProduct, DbProductImage, DbProductVariant, ProductStatus,
} from "@/lib/db/types";

// ─── Extended types with relations ───────────────────────
export interface ProductWithRelations extends DbProduct {
  images:      DbProductImage[];
  variants:    DbProductVariant[];
  collection?: { id: string; name: string; slug: string } | null;
}

// ─── Get all products (with optional filters) ────────────
export interface GetProductsOptions {
  status?:       ProductStatus | "ALL";
  collectionId?: string;
  featured?:     boolean;
  isNew?:        boolean;
  isBestSeller?: boolean;
  search?:       string;
  sortBy?:       "newest" | "price-asc" | "price-desc" | "bestselling" | "rating";
  limit?:        number;
  offset?:       number;
}

export async function getProducts(opts: GetProductsOptions = {}): Promise<ProductWithRelations[]> {
  const conditions: string[] = [];
  const args: (string | number)[] = [];

  // Default: only PUBLISHED products
  if (opts.status && opts.status !== "ALL") {
    conditions.push("p.status = ?");
    args.push(opts.status);
  } else if (!opts.status) {
    conditions.push("p.status = ?");
    args.push("PUBLISHED");
  }

  if (opts.collectionId) {
    conditions.push("p.collectionId = ?");
    args.push(opts.collectionId);
  }
  if (opts.featured) {
    conditions.push("p.isFeatured = 1");
  }
  if (opts.isNew) {
    conditions.push("p.isNew = 1");
  }
  if (opts.isBestSeller) {
    conditions.push("p.isBestSeller = 1");
  }
  if (opts.search) {
    conditions.push("(p.name LIKE ? OR p.description LIKE ? OR p.tags LIKE ?)");
    const term = `%${opts.search}%`;
    args.push(term, term, term);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  let orderBy = "p.createdAt DESC";
  switch (opts.sortBy) {
    case "price-asc":   orderBy = "p.price ASC";        break;
    case "price-desc":  orderBy = "p.price DESC";       break;
    case "bestselling": orderBy = "p.soldCount DESC";   break;
    case "rating":      orderBy = "p.rating DESC";      break;
  }

  const limit  = opts.limit  ? `LIMIT ${opts.limit}`   : "";
  const offset = opts.offset ? `OFFSET ${opts.offset}` : "";

  const result = await db.execute({
    sql: `SELECT p.*, c.id as col_id, c.name as col_name, c.slug as col_slug
          FROM products p
          LEFT JOIN collections c ON c.id = p.collectionId
          ${where}
          ORDER BY ${orderBy}
          ${limit} ${offset}`,
    args,
  });

  const products = result.rows as unknown as (DbProduct & {
    col_id: string | null; col_name: string | null; col_slug: string | null;
  })[];

  if (products.length === 0) return [];

  // Fetch all images + variants in ONE query each (avoid N+1)
  const productIds = products.map((p) => p.id);
  const placeholders = productIds.map(() => "?").join(",");

  const [imgResult, varResult] = await Promise.all([
    db.execute({
      sql:  `SELECT * FROM product_images WHERE productId IN (${placeholders}) ORDER BY isPrimary DESC, sortOrder ASC`,
      args: productIds,
    }),
    db.execute({
      sql:  `SELECT * FROM product_variants WHERE productId IN (${placeholders})`,
      args: productIds,
    }),
  ]);

  const images   = imgResult.rows as unknown as DbProductImage[];
  const variants = varResult.rows as unknown as DbProductVariant[];

  return products.map((p) => ({
    ...p,
    images:     images.filter((i) => i.productId === p.id),
    variants:   variants.filter((v) => v.productId === p.id),
    collection: p.col_id ? { id: p.col_id, name: p.col_name!, slug: p.col_slug! } : null,
  }));
}

// ─── Get single product by slug ──────────────────────────
export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const result = await db.execute({
    sql: `SELECT p.*, c.id as col_id, c.name as col_name, c.slug as col_slug
          FROM products p
          LEFT JOIN collections c ON c.id = p.collectionId
          WHERE p.slug = ? LIMIT 1`,
    args: [slug],
  });

  if (result.rows.length === 0) return null;

  const p = result.rows[0] as unknown as DbProduct & {
    col_id: string | null; col_name: string | null; col_slug: string | null;
  };

  const [imgResult, varResult] = await Promise.all([
    db.execute({ sql: "SELECT * FROM product_images WHERE productId = ? ORDER BY isPrimary DESC, sortOrder ASC", args: [p.id] }),
    db.execute({ sql: "SELECT * FROM product_variants WHERE productId = ?",                                     args: [p.id] }),
  ]);

  return {
    ...p,
    images:     imgResult.rows as unknown as DbProductImage[],
    variants:   varResult.rows as unknown as DbProductVariant[],
    collection: p.col_id ? { id: p.col_id, name: p.col_name!, slug: p.col_slug! } : null,
  };
}

// ─── Get single product by ID ────────────────────────────
export async function getProductById(id: string): Promise<ProductWithRelations | null> {
  const result = await db.execute({
    sql: "SELECT * FROM products WHERE id = ? LIMIT 1",
    args: [id],
  });

  if (result.rows.length === 0) return null;

  const p = result.rows[0] as unknown as DbProduct;

  const [imgResult, varResult] = await Promise.all([
    db.execute({ sql: "SELECT * FROM product_images WHERE productId = ? ORDER BY isPrimary DESC", args: [p.id] }),
    db.execute({ sql: "SELECT * FROM product_variants WHERE productId = ?",                       args: [p.id] }),
  ]);

  return {
    ...p,
    images:   imgResult.rows as unknown as DbProductImage[],
    variants: varResult.rows as unknown as DbProductVariant[],
  };
}

// ─── Total product count (for pagination) ────────────────
export async function getProductCount(opts: GetProductsOptions = {}): Promise<number> {
  const conditions: string[] = [];
  const args: (string | number)[] = [];

  if (opts.status && opts.status !== "ALL") {
    conditions.push("status = ?");
    args.push(opts.status);
  } else if (!opts.status) {
    conditions.push("status = ?");
    args.push("PUBLISHED");
  }
  if (opts.collectionId) { conditions.push("collectionId = ?"); args.push(opts.collectionId); }
  if (opts.featured)     { conditions.push("isFeatured = 1"); }
  if (opts.isNew)        { conditions.push("isNew = 1"); }
  if (opts.isBestSeller) { conditions.push("isBestSeller = 1"); }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await db.execute({
    sql: `SELECT COUNT(*) as count FROM products ${where}`,
    args,
  });

  return Number(result.rows[0].count);
}

// ─── Get related products (same collection, exclude current) ─
export async function getRelatedProducts(
  productId: string, collectionId: string, limit = 4
): Promise<ProductWithRelations[]> {
  const result = await db.execute({
    sql:  `SELECT * FROM products
           WHERE collectionId = ? AND id != ? AND status = 'PUBLISHED'
           ORDER BY RANDOM() LIMIT ?`,
    args: [collectionId, productId, limit],
  });

  const products = result.rows as unknown as DbProduct[];
  if (products.length === 0) return [];

  const productIds   = products.map((p) => p.id);
  const placeholders = productIds.map(() => "?").join(",");

  const imgResult = await db.execute({
    sql:  `SELECT * FROM product_images WHERE productId IN (${placeholders}) AND isPrimary = 1`,
    args: productIds,
  });

  const images = imgResult.rows as unknown as DbProductImage[];

  return products.map((p) => ({
    ...p,
    images:   images.filter((i) => i.productId === p.id),
    variants: [],
  }));
}