import { db } from "@/lib/db/client";
import { generateId, now, tagsToArray } from "@/lib/db/helpers";
import type {
  DbProduct, DbProductImage, DbProductVariant, ProductStatus,
} from "@/lib/db/types";

export interface ProductWithRelations extends DbProduct {
  images:      DbProductImage[];
  variants:    DbProductVariant[];
  collection?: { id: string; name: string; slug: string } | null;
}

type ProductColumnInfo = {
  hasMeasurementsJson: boolean;
};

let productColumnInfoPromise: Promise<ProductColumnInfo> | null = null;

async function getProductColumnInfo(): Promise<ProductColumnInfo> {
  if (!productColumnInfoPromise) {
    productColumnInfoPromise = (async () => {
      const result = await db.execute({ sql: "PRAGMA table_info(products);", args: [] });
      const hasMeasurementsJson = result.rows.some((row) => (row.name as string) === "measurementsJson");

      if (hasMeasurementsJson) {
        return { hasMeasurementsJson: true };
      }

      await db.execute({ sql: "ALTER TABLE products ADD COLUMN measurementsJson TEXT;", args: [] });
      return { hasMeasurementsJson: true };
    })().catch((error) => {
      productColumnInfoPromise = null;
      throw error;
    });
  }

  return productColumnInfoPromise;
}

async function getProductCols(): Promise<string> {
  const { hasMeasurementsJson } = await getProductColumnInfo();
  return `
  p.id, p.name, p.slug, p.sku, p.description, p.shortDescription,
  p.price, p.comparePrice, p.costPerItem, p.taxRate, p.status,
  p.collectionId, p.isNew, p.isFeatured, p.isBestSeller,
  p.metaTitle, p.metaDescription, p.tags, p.rating, p.reviewCount, p.soldCount,
  p.waist, p."length" as lengthInches, p.bottom${hasMeasurementsJson ? ", p.measurementsJson" : ""}, p.bgColor, p.brand,
  p.createdAt, p.updatedAt
`;
}

// Turso strips result columns aliased "length". Alias to lengthInches and remap.
function remapLength<T extends { lengthInches?: number | null }>(row: T): T & { length: number | null } {
  const { lengthInches, ...rest } = row as { lengthInches?: number | null } & Record<string, unknown>;
  return { ...rest, length: lengthInches ?? null } as T & { length: number | null };
}

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

  if (opts.status && opts.status !== "ALL") { conditions.push("p.status = ?"); args.push(opts.status); }
  else if (!opts.status) { conditions.push("p.status = ?"); args.push("PUBLISHED"); }

  if (opts.collectionId) { conditions.push("p.collectionId = ?"); args.push(opts.collectionId); }
  if (opts.featured)     { conditions.push("p.isFeatured = 1"); }
  if (opts.isNew)        { conditions.push("p.isNew = 1"); }
  if (opts.isBestSeller) { conditions.push("p.isBestSeller = 1"); }
  if (opts.search) {
    conditions.push("(p.name LIKE ? OR p.description LIKE ? OR p.tags LIKE ?)");
    const term = `%${opts.search}%`;
    args.push(term, term, term);
  }

  const where   = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  let   orderBy = "p.createdAt DESC";
  switch (opts.sortBy) {
    case "price-asc":   orderBy = "p.price ASC";      break;
    case "price-desc":  orderBy = "p.price DESC";     break;
    case "bestselling": orderBy = "p.soldCount DESC"; break;
    case "rating":      orderBy = "p.rating DESC";    break;
  }

  const limit  = opts.limit  ? `LIMIT ${opts.limit}`   : "";
  const offset = opts.offset ? `OFFSET ${opts.offset}` : "";

  const productCols = await getProductCols();
  const result = await db.execute({
    sql: `SELECT ${productCols}, c.id as col_id, c.name as col_name, c.slug as col_slug
          FROM products p LEFT JOIN collections c ON c.id = p.collectionId
          ${where} ORDER BY ${orderBy} ${limit} ${offset}`,
    args,
  });

  const rawProducts = (result.rows as unknown[]).map((r) => remapLength(r as { lengthInches?: number | null } & Record<string, unknown>)) as unknown as (DbProduct & {
    col_id: string | null; col_name: string | null; col_slug: string | null;
  })[];

  if (rawProducts.length === 0) return [];

  const productIds   = rawProducts.map((p) => p.id);
  const placeholders = productIds.map(() => "?").join(",");

  const [imgResult, varResult] = await Promise.all([
    db.execute({ sql: `SELECT * FROM product_images   WHERE productId IN (${placeholders}) ORDER BY isPrimary DESC, sortOrder ASC`, args: productIds }),
    db.execute({ sql: `SELECT * FROM product_variants WHERE productId IN (${placeholders})`, args: productIds }),
  ]);

  const images   = imgResult.rows as unknown as DbProductImage[];
  const variants = varResult.rows as unknown as DbProductVariant[];

  return rawProducts.map((p) => ({
    ...p,
    images:     images.filter((i) => i.productId === p.id),
    variants:   variants.filter((v) => v.productId === p.id),
    collection: p.col_id ? { id: p.col_id, name: p.col_name!, slug: p.col_slug! } : null,
  }));
}

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const productCols = await getProductCols();
  const result = await db.execute({
    sql: `SELECT ${productCols}, c.id as col_id, c.name as col_name, c.slug as col_slug
          FROM products p LEFT JOIN collections c ON c.id = p.collectionId
          WHERE p.slug = ? LIMIT 1`,
    args: [slug],
  });
  if (result.rows.length === 0) return null;

  const p = remapLength(result.rows[0] as unknown as DbProduct & {
    lengthInches?: number | null;
    col_id: string | null; col_name: string | null; col_slug: string | null;
  });
  const [imgResult, varResult] = await Promise.all([
    db.execute({ sql: "SELECT * FROM product_images   WHERE productId = ? ORDER BY isPrimary DESC, sortOrder ASC", args: [p.id] }),
    db.execute({ sql: "SELECT * FROM product_variants WHERE productId = ?", args: [p.id] }),
  ]);
  return {
    ...p,
    images:     imgResult.rows as unknown as DbProductImage[],
    variants:   varResult.rows as unknown as DbProductVariant[],
    collection: p.col_id ? { id: p.col_id, name: p.col_name!, slug: p.col_slug! } : null,
  };
}

export async function getProductById(id: string): Promise<ProductWithRelations | null> {
  const productCols = await getProductCols();
  const result = await db.execute({
    sql: `SELECT ${productCols} FROM products p WHERE p.id = ? LIMIT 1`,
    args: [id],
  });
  if (result.rows.length === 0) return null;

  const p = remapLength(result.rows[0] as unknown as DbProduct & { lengthInches?: number | null });
  const [imgResult, varResult] = await Promise.all([
    db.execute({ sql: "SELECT * FROM product_images   WHERE productId = ? ORDER BY isPrimary DESC", args: [p.id] }),
    db.execute({ sql: "SELECT * FROM product_variants WHERE productId = ?", args: [p.id] }),
  ]);
  return {
    ...p,
    images:   imgResult.rows as unknown as DbProductImage[],
    variants: varResult.rows as unknown as DbProductVariant[],
  };
}

export async function getProductCount(opts: GetProductsOptions = {}): Promise<number> {
  const conditions: string[] = [];
  const args: (string | number)[] = [];

  if (opts.status && opts.status !== "ALL") { conditions.push("status = ?"); args.push(opts.status); }
  else if (!opts.status) { conditions.push("status = ?"); args.push("PUBLISHED"); }
  if (opts.collectionId) { conditions.push("collectionId = ?"); args.push(opts.collectionId); }
  if (opts.featured)     { conditions.push("isFeatured = 1"); }
  if (opts.isNew)        { conditions.push("isNew = 1"); }
  if (opts.isBestSeller) { conditions.push("isBestSeller = 1"); }

  const where  = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await db.execute({ sql: `SELECT COUNT(*) as count FROM products ${where}`, args });
  return Number(result.rows[0].count);
}

/**
 * Fetch related products in the same collection.
 * Includes ALL images (sorted primary first) + variants so the ProductCard
 * hover-swap effect works properly.
 */
export async function getRelatedProducts(
  productId: string, collectionId: string, limit = 4
): Promise<ProductWithRelations[]> {
  const productCols = await getProductCols();
  const result = await db.execute({
    sql:  `SELECT ${productCols} FROM products p WHERE p.collectionId = ? AND p.id != ? AND p.status = 'PUBLISHED' ORDER BY RANDOM() LIMIT ?`,
    args: [collectionId, productId, limit],
  });
  const products = (result.rows as unknown[]).map((r) => remapLength(r as { lengthInches?: number | null } & Record<string, unknown>)) as unknown as DbProduct[];
  if (products.length === 0) return [];

  const productIds   = products.map((p) => p.id);
  const placeholders = productIds.map(() => "?").join(",");

  const [imgResult, varResult] = await Promise.all([
    db.execute({
      sql:  `SELECT * FROM product_images   WHERE productId IN (${placeholders}) ORDER BY isPrimary DESC, sortOrder ASC`,
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
    images:   images.filter((i) => i.productId === p.id),
    variants: variants.filter((v) => v.productId === p.id),
  }));
}

void generateId; void now; void tagsToArray;
