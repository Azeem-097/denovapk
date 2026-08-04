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
  hasSortOrder: boolean;
  hasIsSoldOut: boolean;
};

type VariantColumnInfo = {
  hasLength: boolean;
  hasBottom: boolean;
};

let productColumnInfoPromise: Promise<ProductColumnInfo> | null = null;
let variantColumnInfoPromise: Promise<VariantColumnInfo> | null = null;

async function getProductColumnInfo(): Promise<ProductColumnInfo> {
  if (!productColumnInfoPromise) {
    productColumnInfoPromise = (async () => {
      const result = await db.execute({ sql: "PRAGMA table_info(products);", args: [] });
      const hasMeasurementsJson = result.rows.some((row) => (row.name as string) === "measurementsJson");
      const hasSortOrder = result.rows.some((row) => (row.name as string) === "sortOrder");
      const hasIsSoldOut = result.rows.some((row) => (row.name as string) === "isSoldOut");

      if (!hasMeasurementsJson) {
        try {
          await db.execute({ sql: "ALTER TABLE products ADD COLUMN measurementsJson TEXT;", args: [] });
        } catch (error) {
          if (!(error instanceof Error) || !error.message.includes("duplicate column name: measurementsJson")) {
            throw error;
          }
        }
      }

      if (!hasSortOrder) {
        try {
          await db.execute({ sql: "ALTER TABLE products ADD COLUMN sortOrder INTEGER NOT NULL DEFAULT 0;", args: [] });
        } catch (error) {
          if (!(error instanceof Error) || !error.message.includes("duplicate column name: sortOrder")) {
            throw error;
          }
        }
      }

      if (!hasIsSoldOut) {
        try {
          await db.execute({ sql: "ALTER TABLE products ADD COLUMN isSoldOut INTEGER NOT NULL DEFAULT 0;", args: [] });
        } catch (error) {
          if (!(error instanceof Error) || !error.message.includes("duplicate column name: isSoldOut")) {
            throw error;
          }
        }
      }

      return { hasMeasurementsJson: true, hasSortOrder: true, hasIsSoldOut: true };
    })().catch((error) => {
      productColumnInfoPromise = null;
      throw error;
    });
  }

  return productColumnInfoPromise;
}

async function getVariantColumnInfo(): Promise<VariantColumnInfo> {
  if (!variantColumnInfoPromise) {
    variantColumnInfoPromise = (async () => {
      const result = await db.execute({ sql: "PRAGMA table_info(product_variants);", args: [] });
      return {
        hasLength: result.rows.some((row) => (row.name as string) === "length"),
        hasBottom: result.rows.some((row) => (row.name as string) === "bottom"),
      };
    })().catch((error) => {
      variantColumnInfoPromise = null;
      throw error;
    });
  }

  return variantColumnInfoPromise;
}

async function getVariantCols(): Promise<string> {
  const { hasLength, hasBottom } = await getVariantColumnInfo();
  return `id, productId, size, ${hasLength ? '"length"' : "NULL"} as length, ${hasBottom ? "bottom" : "NULL"} as bottom, color, colorHex, sku, stock, price, compareAtPrice, weight, createdAt, updatedAt`;
}

async function getProductCols(): Promise<string> {
  const { hasMeasurementsJson, hasSortOrder, hasIsSoldOut } = await getProductColumnInfo();
  return `
  p.id, p.name, p.slug, p.sku, p.description, p.shortDescription,
  p.price, p.comparePrice, p.costPerItem, p.taxRate, p.status,
  p.collectionId, p.isNew, p.isFeatured, p.isBestSeller, ${hasIsSoldOut ? "p.isSoldOut" : "0 as isSoldOut"},
  p.metaTitle, p.metaDescription, p.tags, p.rating, p.reviewCount, p.soldCount,
  p.waist, p."length" as lengthInches, p.bottom${hasMeasurementsJson ? ", p.measurementsJson" : ""}, p.bgColor, p.brand,
  ${hasSortOrder ? "p.sortOrder" : "0 as sortOrder"}, p.createdAt, p.updatedAt
`;
}

function remapLength<T extends { lengthInches?: number | null }>(row: T): T & { length: number | null } {
  const { lengthInches, ...rest } = row as { lengthInches?: number | null } & Record<string, unknown>;
  return { ...rest, length: lengthInches ?? null } as T & { length: number | null };
}

async function getNextProductSortOrder(): Promise<number> {
  await getProductColumnInfo();
  const result = await db.execute({ sql: "SELECT COALESCE(MAX(sortOrder), -1) + 1 as nextSortOrder FROM products", args: [] });
  return Number(result.rows[0]?.nextSortOrder ?? 0);
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

  if (opts.status && opts.status !== "ALL") {
    conditions.push("p.status = ?");
    args.push(opts.status);
  } else if (!opts.status) {
    conditions.push("p.status = ?");
    args.push("PUBLISHED");
  }

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
  let   orderBy = "p.sortOrder ASC, p.createdAt DESC";
  switch (opts.sortBy) {
    case "newest":      orderBy = "p.sortOrder ASC, p.createdAt DESC"; break;
    case "price-asc":   orderBy = "p.price ASC";                        break;
    case "price-desc":  orderBy = "p.price DESC";                       break;
    case "bestselling": orderBy = "p.soldCount DESC";                   break;
    case "rating":      orderBy = "p.rating DESC";                      break;
  }

  const limit  = opts.limit  ? `LIMIT ${opts.limit}`   : "";
  const offset = opts.offset ? `OFFSET ${opts.offset}` : "";

  const productCols = await getProductCols();
  const result = await db.execute({
    sql: `SELECT ${productCols}, c.id as col_id, c.name as col_name, c.slug as col_slug
          FROM products p
          LEFT JOIN collections c ON c.id = p.collectionId
          ${where} ORDER BY ${orderBy} ${limit} ${offset}`,
    args,
  });

  const rawProducts = (result.rows as unknown[]).map((r) => remapLength(r as { lengthInches?: number | null } & Record<string, unknown>)) as unknown as (DbProduct & {
    col_id: string | null; col_name: string | null; col_slug: string | null;
  })[];

  if (rawProducts.length === 0) return [];

  const productIds   = rawProducts.map((p) => p.id);
  const placeholders = productIds.map(() => "?").join(",");

  const variantCols = await getVariantCols();
  const [imgResult, varResult] = await Promise.all([
    db.execute({ sql: `SELECT * FROM product_images   WHERE productId IN (${placeholders}) ORDER BY isPrimary DESC, sortOrder ASC`, args: productIds }),
    db.execute({ sql: `SELECT ${variantCols} FROM product_variants WHERE productId IN (${placeholders})`, args: productIds }),
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
  const variantCols = await getVariantCols();
  const [imgResult, varResult] = await Promise.all([
    db.execute({ sql: "SELECT * FROM product_images   WHERE productId = ? ORDER BY isPrimary DESC, sortOrder ASC", args: [p.id] }),
    db.execute({ sql: `SELECT ${variantCols} FROM product_variants WHERE productId = ?`, args: [p.id] }),
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
    sql: `SELECT ${productCols}, c.id as col_id, c.name as col_name, c.slug as col_slug
          FROM products p LEFT JOIN collections c ON c.id = p.collectionId
          WHERE p.id = ? LIMIT 1`,
    args: [id],
  });
  if (result.rows.length === 0) return null;

  const p = remapLength(result.rows[0] as unknown as DbProduct & {
    lengthInches?: number | null;
    col_id: string | null; col_name: string | null; col_slug: string | null;
  });
  const variantCols = await getVariantCols();
  const [imgResult, varResult] = await Promise.all([
    db.execute({ sql: "SELECT * FROM product_images   WHERE productId = ? ORDER BY isPrimary DESC, sortOrder ASC", args: [p.id] }),
    db.execute({ sql: `SELECT ${variantCols} FROM product_variants WHERE productId = ?`, args: [p.id] }),
  ]);
  return {
    ...p,
    images:     imgResult.rows as unknown as DbProductImage[],
    variants:   varResult.rows as unknown as DbProductVariant[],
    collection: p.col_id ? { id: p.col_id, name: p.col_name!, slug: p.col_slug! } : null,
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
  const imgResult    = await db.execute({
    sql:  `SELECT * FROM product_images WHERE productId IN (${placeholders}) AND isPrimary = 1`,
    args: productIds,
  });
  const images = imgResult.rows as unknown as DbProductImage[];
  return products.map((p) => ({ ...p, images: images.filter((i) => i.productId === p.id), variants: [] }));
}

// ═══════════════════════════════════════════════════════
//  ADMIN CRUD
// ═══════════════════════════════════════════════════════

import { now as nowTs, tagsToArray as tagsToArr } from "@/lib/db/helpers";

export interface CreateProductInput {
  name:             string;
  slug:             string;
  sku:              string;
  description:      string;
  price:            number;
  comparePrice?:    number | null;
  costPerItem?:     number;
  collectionId?:    string | null;
  status?:          ProductStatus;
  isNew?:           boolean;
  isFeatured?:      boolean;
  isBestSeller?:    boolean;
  isSoldOut?:       boolean;
  tags?:            string[];
    metaTitle?:       string;
    metaDescription?: string;
    imageUrl?:        string;
    imageUrls?:       string[];
  waist?:           number | null;
  length?:          number | null;
  bottom?:          number | null;
  measurementsJson?: string | null;
  bgColor?:         string | null;
  brand?:           string | null;   // new — free-text brand name
  sortOrder?:       number;
  variants?: Array<{
    size:     string;
    length?:  number | null;
    bottom?:  number | null;
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
  const { hasMeasurementsJson } = await getProductColumnInfo();
  const sortOrder = input.sortOrder ?? await getNextProductSortOrder();

  const productColumns = [
    "id", "name", "slug", "sku", "description", "price", "comparePrice", "costPerItem",
    "collectionId", "status", "isNew", "isFeatured", "isBestSeller", "tags",
    "isSoldOut",
    "metaTitle", "metaDescription", "waist", '"length"', "bottom",
    ...(hasMeasurementsJson ? ["measurementsJson"] : []),
    "bgColor", "brand", "sortOrder", "createdAt", "updatedAt",
  ];

  const productValues = [
    id, input.name, input.slug, input.sku, input.description,
    input.price, input.comparePrice ?? null, input.costPerItem ?? null,
    input.collectionId ?? null, input.status ?? "DRAFT",
    input.isNew ? 1 : 0, input.isFeatured ? 1 : 0, input.isBestSeller ? 1 : 0,
    (input.tags ?? []).join(","),
    input.isSoldOut ? 1 : 0,
    input.metaTitle ?? null, input.metaDescription ?? null,
    input.waist ?? null, input.length ?? null, input.bottom ?? null,
    ...(hasMeasurementsJson ? [input.measurementsJson ?? null] : []),
    input.bgColor ?? null, input.brand ?? null, sortOrder,
    t, t,
  ];

  await db.execute({
    sql: `INSERT INTO products (
      ${productColumns.join(", ")}
    ) VALUES (${productColumns.map(() => "?").join(", ")})`,
    args: productValues,
  });

  const allImages = input.imageUrls && input.imageUrls.length > 0
    ? input.imageUrls
    : (input.imageUrl ? [input.imageUrl] : []);

  for (let i = 0; i < allImages.length; i++) {
    await db.execute({
      sql:  "INSERT INTO product_images (id, productId, url, alt, isPrimary, sortOrder) VALUES (?, ?, ?, ?, ?, ?)",
      args: [generateId(), id, allImages[i], input.name, i === 0 ? 1 : 0, i],
    });
  }

  if (input.variants && input.variants.length > 0) {
    const { hasLength, hasBottom } = await getVariantColumnInfo();
    for (const v of input.variants) {
      const columns = [
        "id", "productId", "size",
        ...(hasLength ? ['"length"'] : []),
        ...(hasBottom ? ["bottom"] : []),
        "color", "colorHex", "sku", "stock", "price", "createdAt", "updatedAt",
      ];
      const values = [
        generateId(), id, v.size,
        ...(hasLength ? [v.length ?? null] : []),
        ...(hasBottom ? [v.bottom ?? null] : []),
        v.color, v.colorHex, v.sku, v.stock, v.price, t, t,
      ];
      await db.execute({
        sql: `INSERT INTO product_variants (${columns.join(", ")})
              VALUES (${columns.map(() => "?").join(", ")})`,
        args: values,
      });
    }
  }

  return id;
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<CreateProductInput, "variants" | "imageUrl" | "imageUrls">>
): Promise<void> {
  const { hasMeasurementsJson } = await getProductColumnInfo();
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
    isNew:           updates.isNew        === undefined ? undefined : (updates.isNew        ? 1 : 0),
    isFeatured:      updates.isFeatured   === undefined ? undefined : (updates.isFeatured   ? 1 : 0),
    isBestSeller:    updates.isBestSeller === undefined ? undefined : (updates.isBestSeller ? 1 : 0),
    isSoldOut:       updates.isSoldOut    === undefined ? undefined : (updates.isSoldOut    ? 1 : 0),
    tags:            updates.tags ? updates.tags.join(",") : undefined,
    metaTitle:       updates.metaTitle,
    metaDescription: updates.metaDescription,
    waist:           updates.waist,
    bottom:          updates.bottom,
    ...(hasMeasurementsJson ? { measurementsJson: updates.measurementsJson } : {}),
    bgColor:         updates.bgColor,
    brand:           updates.brand,
    sortOrder:       updates.sortOrder,
  };

  Object.entries(map).forEach(([k, v]) => {
    if (v !== undefined) { sets.push(`${k} = ?`); args.push(v as string | number | null); }
  });

  if (updates.length !== undefined) {
    sets.push(`"length" = ?`);
    args.push(updates.length as number | null);
  }

  if (sets.length === 0) return;
  sets.push("updatedAt = ?");
  args.push(nowTs());
  args.push(id);

  await db.execute({ sql: `UPDATE products SET ${sets.join(", ")} WHERE id = ?`, args });
}

/**
 * Hard-delete a product and ALL references to it.
 */
export async function deleteProduct(id: string): Promise<void> {
  await db.execute({ sql: "DELETE FROM reviews    WHERE productId = ?", args: [id] });
  await db.execute({ sql: "DELETE FROM wishlists  WHERE productId = ?", args: [id] });

  await db.execute({ sql: "DELETE FROM cart_items WHERE productId = ?", args: [id] });
  await db.execute({
    sql: "DELETE FROM cart_items WHERE variantId IN (SELECT id FROM product_variants WHERE productId = ?)",
    args: [id],
  });

  await db.execute({ sql: "DELETE FROM order_items WHERE productId = ?", args: [id] });
  await db.execute({
    sql: "DELETE FROM order_items WHERE variantId IN (SELECT id FROM product_variants WHERE productId = ?)",
    args: [id],
  });

  await db.execute({ sql: "DELETE FROM product_variants WHERE productId = ?", args: [id] });
  await db.execute({ sql: "DELETE FROM product_images   WHERE productId = ?", args: [id] });

  await db.execute({ sql: "DELETE FROM products WHERE id = ?", args: [id] });
}

export async function updateVariantStock(variantId: string, stock: number): Promise<void> {
  await db.execute({
    sql:  "UPDATE product_variants SET stock = ?, updatedAt = ? WHERE id = ?",
    args: [Math.max(0, stock), nowTs(), variantId],
  });
}

// ═══════════════════════════════════════════════════════
//  IMAGE + VARIANT SYNC (for edit flow)
// ═══════════════════════════════════════════════════════

export async function replaceProductImages(
  productId: string,
  imageUrls: string[],
  altText:   string
): Promise<void> {
  await db.execute({
    sql:  "DELETE FROM product_images WHERE productId = ?",
    args: [productId],
  });

  for (let i = 0; i < imageUrls.length; i++) {
    await db.execute({
      sql:  "INSERT INTO product_images (id, productId, url, alt, isPrimary, sortOrder) VALUES (?, ?, ?, ?, ?, ?)",
      args: [generateId(), productId, imageUrls[i], altText, i === 0 ? 1 : 0, i],
    });
  }
}

export interface VariantSyncInput {
  id?:       string;
  size:      string;
  length?:   number | null;
  bottom?:   number | null;
  color:     string;
  colorHex:  string;
  sku:       string;
  stock:     number;
  price:     number;
}

export async function syncProductVariants(
  productId: string,
  variants:  VariantSyncInput[]
): Promise<void> {
  const t = nowTs();
  const { hasLength, hasBottom } = await getVariantColumnInfo();

  const existingResult = await db.execute({
    sql:  "SELECT id FROM product_variants WHERE productId = ?",
    args: [productId],
  });
  const existingIds = existingResult.rows.map((r) => r.id as string);

  const keptIds = variants.map((v) => v.id).filter(Boolean) as string[];

  const toDelete = existingIds.filter((id) => !keptIds.includes(id));
  for (const id of toDelete) {
    await db.execute({ sql: "DELETE FROM cart_items  WHERE variantId = ?", args: [id] });
    await db.execute({ sql: "DELETE FROM order_items WHERE variantId = ?", args: [id] });
    await db.execute({ sql: "DELETE FROM product_variants WHERE id = ?", args: [id] });
  }

  for (const v of variants) {
    if (v.id && existingIds.includes(v.id)) {
      await db.execute({
        sql: `UPDATE product_variants
              SET size = ?${hasLength ? ', "length" = ?' : ""}${hasBottom ? ", bottom = ?" : ""}, color = ?, colorHex = ?, sku = ?, stock = ?, price = ?, updatedAt = ?
              WHERE id = ?`,
        args: [
          v.size,
          ...(hasLength ? [v.length ?? null] : []),
          ...(hasBottom ? [v.bottom ?? null] : []),
          v.color, v.colorHex, v.sku, v.stock, v.price, t, v.id,
        ],
      });
    } else {
      const columns = [
        "id", "productId", "size",
        ...(hasLength ? ['"length"'] : []),
        ...(hasBottom ? ["bottom"] : []),
        "color", "colorHex", "sku", "stock", "price", "createdAt", "updatedAt",
      ];
      const values = [
        generateId(), productId, v.size,
        ...(hasLength ? [v.length ?? null] : []),
        ...(hasBottom ? [v.bottom ?? null] : []),
        v.color, v.colorHex, v.sku, v.stock, v.price, t, t,
      ];
      await db.execute({
        sql: `INSERT INTO product_variants (${columns.join(", ")})
              VALUES (${columns.map(() => "?").join(", ")})`,
        args: values,
      });
    }
  }
}

export async function updateProductSortOrder(productIds: string[]): Promise<void> {
  await getProductColumnInfo();
  const t = nowTs();

  for (let i = 0; i < productIds.length; i++) {
    await db.execute({
      sql:  "UPDATE products SET sortOrder = ?, updatedAt = ? WHERE id = ?",
      args: [i, t, productIds[i]],
    });
  }
}

export async function duplicateProduct(sourceId: string): Promise<string> {
  const source = await getProductById(sourceId);
  if (!source) throw new Error("Product not found");

  const newId = generateId();
  const t     = nowTs();
  const { hasMeasurementsJson } = await getProductColumnInfo();

  const newName = `${source.name} (Copy)`;
  const newSlug = `${source.slug}-copy-${newId.slice(1, 7)}`;
  const newSku  = `${source.sku}-COPY-${newId.slice(1, 5).toUpperCase()}`;

  const productColumns = [
    "id", "name", "slug", "sku", "description", "price", "comparePrice", "costPerItem",
    "collectionId", "status", "isNew", "isFeatured", "isBestSeller", "tags",
    "isSoldOut",
    "metaTitle", "metaDescription", "waist", '"length"', "bottom",
    ...(hasMeasurementsJson ? ["measurementsJson"] : []),
    "bgColor", "brand", "sortOrder", "createdAt", "updatedAt",
  ];

  const productValues = [
    newId, newName, newSlug, newSku, source.description,
    source.price, source.comparePrice, source.costPerItem,
    source.collectionId, "DRAFT",
    source.isNew, source.isFeatured, source.isBestSeller,
    source.tags,
    source.isSoldOut,
    source.metaTitle, source.metaDescription,
    source.waist, source.length, source.bottom,
    ...(hasMeasurementsJson ? [source.measurementsJson] : []),
    source.bgColor, source.brand, source.sortOrder,
    t, t,
  ];

  await db.execute({
    sql: `INSERT INTO products (
      ${productColumns.join(", ")}
    ) VALUES (${productColumns.map(() => "?").join(", ")})`,
    args: productValues,
  });

  for (const img of source.images) {
    await db.execute({
      sql:  "INSERT INTO product_images (id, productId, url, alt, isPrimary, sortOrder) VALUES (?, ?, ?, ?, ?, ?)",
      args: [generateId(), newId, img.url, img.alt, img.isPrimary, img.sortOrder],
    });
  }

  for (const v of source.variants) {
    const { hasLength, hasBottom } = await getVariantColumnInfo();
    const columns = [
      "id", "productId", "size",
      ...(hasLength ? ['"length"'] : []),
      ...(hasBottom ? ["bottom"] : []),
      "color", "colorHex", "sku", "stock", "price", "createdAt", "updatedAt",
    ];
    const values = [
      generateId(), newId, v.size,
      ...(hasLength ? [v.length ?? null] : []),
      ...(hasBottom ? [v.bottom ?? null] : []),
      v.color, v.colorHex,
      `${v.sku}-C${newId.slice(1, 4).toUpperCase()}`,
      v.stock, v.price, t, t,
    ];
    await db.execute({
      sql: `INSERT INTO product_variants (${columns.join(", ")})
            VALUES (${columns.map(() => "?").join(", ")})`,
      args: values,
    });
  }

  return newId;
}

void tagsToArr;
void now;
