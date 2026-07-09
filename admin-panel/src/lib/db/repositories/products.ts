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

// ═══════════════════════════════════════════════════════
//  ADMIN-ONLY CRUD OPERATIONS
// ═══════════════════════════════════════════════════════

import { now as nowTs, tagsToArray as tagsToArr } from "@/lib/db/helpers";

export interface CreateProductInput {
  name:            string;
  slug:            string;
  sku:             string;
  description:     string;
  price:           number; // in paisa
  comparePrice?:   number | null;
  costPerItem?:    number;
  collectionId?:   string | null;
  status?:         ProductStatus;
  isNew?:          boolean;
  isFeatured?:     boolean;
  isBestSeller?:   boolean;
  tags?:           string[];
  metaTitle?:      string;
  metaDescription?: string;
  imageUrl?:       string;
  variants?: Array<{
    size:     string;
    color:    string;
    colorHex: string;
    sku:      string;
    stock:    number;
    price:    number;
  }>;
}

export async function createProduct(input: CreateProductInput): Promise<string> {
  const id = generateId();
  const t  = nowTs();

  await db.execute({
    sql: `INSERT INTO products (
      id, name, slug, sku, description, price, comparePrice, costPerItem,
      collectionId, status, isNew, isFeatured, isBestSeller, tags,
      metaTitle, metaDescription, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id, input.name, input.slug, input.sku, input.description,
      input.price, input.comparePrice ?? null, input.costPerItem ?? null,
      input.collectionId ?? null, input.status ?? "DRAFT",
      input.isNew ? 1 : 0, input.isFeatured ? 1 : 0, input.isBestSeller ? 1 : 0,
      (input.tags ?? []).join(","),
      input.metaTitle ?? null, input.metaDescription ?? null,
      t, t,
    ],
  });

  // Add primary image if provided
  if (input.imageUrl) {
    await db.execute({
      sql:  "INSERT INTO product_images (id, productId, url, alt, isPrimary, sortOrder) VALUES (?, ?, ?, ?, 1, 0)",
      args: [generateId(), id, input.imageUrl, input.name],
    });
  }

  // Add variants
  if (input.variants && input.variants.length > 0) {
    for (const v of input.variants) {
      await db.execute({
        sql: `INSERT INTO product_variants (id, productId, size, color, colorHex, sku, stock, price, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [generateId(), id, v.size, v.color, v.colorHex, v.sku, v.stock, v.price, t, t],
      });
    }
  }

  return id;
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<CreateProductInput, "variants" | "imageUrl">>
): Promise<void> {
  const sets: string[] = [];
  const args: (string | number | null)[] = [];

  const map: Record<string, unknown> = {
    name:            updates.name,
    slug:            updates.slug,
    sku:             updates.sku,
    description:     updates.description,
    price:           updates.price,
    comparePrice:    updates.comparePrice,
    costPerItem:     updates.costPerItem,
    collectionId:    updates.collectionId,
    status:          updates.status,
    isNew:           updates.isNew === undefined ? undefined : (updates.isNew ? 1 : 0),
    isFeatured:      updates.isFeatured === undefined ? undefined : (updates.isFeatured ? 1 : 0),
    isBestSeller:    updates.isBestSeller === undefined ? undefined : (updates.isBestSeller ? 1 : 0),
    tags:            updates.tags ? updates.tags.join(",") : undefined,
    metaTitle:       updates.metaTitle,
    metaDescription: updates.metaDescription,
  };

  Object.entries(map).forEach(([k, v]) => {
    if (v !== undefined) { sets.push(`${k} = ?`); args.push(v as string | number | null); }
  });

  if (sets.length === 0) return;

  sets.push("updatedAt = ?");
  args.push(nowTs());
  args.push(id);

  await db.execute({
    sql:  `UPDATE products SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
}

export async function deleteProduct(id: string): Promise<void> {
  // Foreign keys cascade will handle images + variants
  await db.execute({ sql: "DELETE FROM products WHERE id = ?", args: [id] });
}

export async function updateVariantStock(variantId: string, stock: number): Promise<void> {
  await db.execute({
    sql:  "UPDATE product_variants SET stock = ?, updatedAt = ? WHERE id = ?",
    args: [Math.max(0, stock), nowTs(), variantId],
  });
}

// silence unused import
void tagsToArr;