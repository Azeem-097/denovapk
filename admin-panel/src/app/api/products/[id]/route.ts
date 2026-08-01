import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import {
  updateProduct, deleteProduct,
  replaceProductImages, syncProductVariants,
  getProductById,
} from "@/lib/db/repositories/products";
import { rupeesToPaisa } from "@/lib/priceUtils";

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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await req.json();

    const updates: Record<string, unknown> = {};
    if (body.name         !== undefined) updates.name         = body.name;
    if (body.slug         !== undefined) updates.slug         = body.slug;
    if (body.sku          !== undefined) updates.sku          = body.sku;
    if (body.description  !== undefined) updates.description  = body.description;
    if (body.price        !== undefined) updates.price        = rupeesToPaisa(body.price);
    if (body.comparePrice !== undefined) updates.comparePrice = body.comparePrice ? rupeesToPaisa(body.comparePrice) : null;
    if (body.collectionId !== undefined) updates.collectionId = body.collectionId;
    if (body.status       !== undefined) updates.status       = body.status.toUpperCase();
    if (body.isNew        !== undefined) updates.isNew        = body.isNew;
    if (body.isFeatured   !== undefined) updates.isFeatured   = body.isFeatured;
    if (body.isBestSeller !== undefined) updates.isBestSeller = body.isBestSeller;
    if (body.isSoldOut    !== undefined) updates.isSoldOut    = body.isSoldOut;
    if (body.tags         !== undefined) updates.tags         = Array.isArray(body.tags) ? body.tags : body.tags.split(",");
    const normalizedMeasurements = normalizeMeasurements(body.measurements, { waist: body.waist, length: body.length, bottom: body.bottom });
    const firstMeasurement = normalizedMeasurements[0] ?? null;
    if (body.measurements !== undefined || body.waist !== undefined || body.length !== undefined || body.bottom !== undefined) {
      updates.measurementsJson = JSON.stringify(normalizedMeasurements);
      updates.waist = firstMeasurement ? Number(firstMeasurement.waist) : null;
      updates.length = firstMeasurement && firstMeasurement.length !== "" ? Number(firstMeasurement.length) : null;
      updates.bottom = firstMeasurement && firstMeasurement.bottom !== "" ? Number(firstMeasurement.bottom) : null;
    }

    if (body.brand !== undefined) {
      updates.brand = typeof body.brand === "string" && body.brand.trim().length > 0 ? body.brand.trim() : null;
    }

    // bgColor: empty string or null => clear
    if (body.bgColor !== undefined) {
      updates.bgColor =
        typeof body.bgColor === "string" && body.bgColor.trim().length > 0
          ? body.bgColor.trim()
          : null;
    }

    if (Object.keys(updates).length > 0) {
      await updateProduct(id, updates);
    }

    if (Array.isArray(body.images)) {
      const productForAlt = await getProductById(id);
      const alt = body.name ?? productForAlt?.name ?? "Product";
      await replaceProductImages(id, body.images, alt);
    }

    if (Array.isArray(body.variants)) {
      const waistNumber = firstMeasurement ? Number(firstMeasurement.waist) : (body.waist !== undefined && body.waist !== "" && body.waist !== null ? Number(body.waist) : null);
      const sizeLabel = waistNumber !== null ? String(waistNumber) : "ONE-SIZE";

      const variantsForSync = body.variants.map((v: {
        id?: string; color: string; colorHex?: string; sku: string; stock: number; price: number; size?: string;
      }) => ({
        id:       v.id,
        size:     v.size ?? sizeLabel,
        color:    v.color,
        colorHex: v.colorHex ?? "#000000",
        sku:      v.sku,
        stock:    Number(v.stock),
        price:    rupeesToPaisa(v.price),
      }));

      await syncProductVariants(id, variantsForSync);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update product error:", err);
    return NextResponse.json({ error: "Update failed: " + (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    await deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete product error:", err);
    return NextResponse.json(
      { error: "Delete failed: " + (err as Error).message },
      { status: 500 }
    );
  }
}
