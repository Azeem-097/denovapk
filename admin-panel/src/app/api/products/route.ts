import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { getProducts, createProduct } from "@/lib/db/repositories/products";
import { rupeesToPaisa } from "@/lib/priceUtils";
import { slugify } from "@/lib/utils";

function normalizeInventoryVariants(input: unknown) {
  const rows = Array.isArray(input)
    ? input.map((row) => {
        const v = row as {
          id?: unknown; size?: unknown; waist?: unknown; length?: unknown; bottom?: unknown;
          color?: unknown; colorHex?: unknown; sku?: unknown; stock?: unknown; price?: unknown;
        };
        return {
          size: String(v.size ?? v.waist ?? "").trim(),
          length: v.length === undefined || v.length === null || String(v.length).trim() === "" ? null : Number(v.length),
          bottom: v.bottom === undefined || v.bottom === null || String(v.bottom).trim() === "" ? null : Number(v.bottom),
          color: String(v.color ?? "").trim(),
          colorHex: String(v.colorHex ?? "#000000").trim() || "#000000",
          sku: String(v.sku ?? "").trim().toUpperCase(),
          stock: Math.max(0, Math.floor(Number(v.stock) || 0)),
          price: Number(v.price),
        };
      }).filter((row) => row.size && row.color && row.sku && Number.isFinite(row.price))
    : [];

  const seen = new Set<string>();
  for (const row of rows) {
    const key = `${row.size.toLowerCase()}|${row.color.toLowerCase()}`;
    if (seen.has(key)) throw new Error("Duplicate waist and colour combinations are not allowed.");
    seen.add(key);
  }

  return rows;
}

function normalizeMeasurements(input: unknown, fallback?: { waist?: unknown; length?: unknown; bottom?: unknown }) {
  const rows = Array.isArray(input)
    ? input
        .map((row) => ({
          waist: String((row as { waist?: unknown }).waist ?? "").trim(),
          length: String((row as { length?: unknown }).length ?? "").trim(),
          bottom: String((row as { bottom?: unknown }).bottom ?? "").trim(),
        }))
        .filter((row) => row.waist.length > 0)
    : [];

  if (rows.length > 0) return rows;

  const waist = fallback?.waist != null && String(fallback.waist).trim().length > 0 ? String(fallback.waist).trim() : "";
  if (!waist) return [];

  return [{
    waist,
    length: fallback?.length != null ? String(fallback.length).trim() : "",
    bottom: fallback?.bottom != null ? String(fallback.bottom).trim() : "",
  }];
}

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const products = await getProducts({ status: "ALL", limit: 500 });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    const {
      name, description, sku, price, comparePrice, collectionId,
      status, isNew, isFeatured, isBestSeller, isSoldOut, tags, variants,
      waist, length, bottom, bgColor, brand,
      measurements,
    } = body;

    if (!name || !description || !sku || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slug = body.slug || slugify(name);

    const imageUrls: string[] = [];
    if (body.images && Array.isArray(body.images) && body.images.length > 0) {
      imageUrls.push(...body.images);
    } else if (body.imageUrl) {
      imageUrls.push(body.imageUrl);
    }

    const normalizedVariants = normalizeInventoryVariants(variants);
    if (normalizedVariants.length === 0) {
      return NextResponse.json({ error: "Add at least one inventory row." }, { status: 400 });
    }

    const normalizedMeasurements = normalizeMeasurements(
      measurements,
      { waist: normalizedVariants[0]?.size ?? waist, length: normalizedVariants[0]?.length ?? length, bottom: normalizedVariants[0]?.bottom ?? bottom }
    );
    const firstMeasurement = normalizedMeasurements[0] ?? null;
    const waistNumber = firstMeasurement && firstMeasurement.waist !== ""
      ? Number(firstMeasurement.waist)
      : (waist !== undefined && waist !== "" ? Number(waist) : null);
    const sizeLabel = waistNumber !== null && !Number.isNaN(waistNumber) ? String(waistNumber) : "ONE-SIZE";

    // Normalize bgColor — treat empty string as null (means: keep original)
    const bgColorNormalized =
      bgColor !== undefined && typeof bgColor === "string" && bgColor.trim().length > 0
        ? bgColor.trim()
        : null;

    const productId = await createProduct({
      name,
      slug,
      sku,
      description,
      price:        rupeesToPaisa(price),
      comparePrice: comparePrice ? rupeesToPaisa(comparePrice) : null,
      collectionId: collectionId || null,
      status:       (status ?? "draft").toUpperCase() as "DRAFT" | "PUBLISHED" | "ARCHIVED",
      isNew:        !!isNew,
      isFeatured:   !!isFeatured,
      isBestSeller: !!isBestSeller,
      isSoldOut:    !!isSoldOut,
      tags:         Array.isArray(tags) ? tags : (typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()) : []),
      imageUrl:     imageUrls[0] || undefined,
      imageUrls:    imageUrls,
      waist:        waistNumber,
      length:       firstMeasurement && firstMeasurement.length !== ""
        ? Number(firstMeasurement.length)
        : (length !== undefined && length !== "" ? Number(length) : null),
      bottom:       firstMeasurement && firstMeasurement.bottom !== ""
        ? Number(firstMeasurement.bottom)
        : (bottom !== undefined && bottom !== "" ? Number(bottom) : null),
      measurementsJson: JSON.stringify(normalizedMeasurements),
      bgColor:      bgColorNormalized,
      brand:        typeof brand === "string" && brand.trim().length > 0 ? brand.trim() : null,
      variants:     normalizedVariants.map((v) => ({
        size:     v.size || sizeLabel,
        length:   v.length,
        bottom:   v.bottom,
        color:    v.color,
        colorHex: v.colorHex,
        sku:      v.sku,
        stock:    v.stock,
        price:    rupeesToPaisa(v.price),
      })),
    });

    return NextResponse.json({ success: true, productId }, { status: 201 });
  } catch (err) {
    console.error("Create product error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to create product" }, { status: 500 });
  }
}
