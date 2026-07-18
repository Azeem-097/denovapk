import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { getProducts, createProduct } from "@/lib/db/repositories/products";
import { rupeesToPaisa } from "@/lib/priceUtils";
import { slugify } from "@/lib/utils";

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
      status, isNew, isFeatured, isBestSeller, tags, variants,
      waist, length, bottom, bgColor,
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

    const waistNumber = waist !== undefined && waist !== "" ? Number(waist) : null;
    const sizeLabel   = waistNumber !== null ? String(waistNumber) : "ONE-SIZE";

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
      tags:         Array.isArray(tags) ? tags : (typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()) : []),
      imageUrl:     imageUrls[0] || undefined,
      imageUrls:    imageUrls,
      waist:        waistNumber,
      length:       length !== undefined && length !== "" ? Number(length) : null,
      bottom:       bottom !== undefined && bottom !== "" ? Number(bottom) : null,
      bgColor:      bgColorNormalized,
      variants:     variants?.map((v: {
        color: string; colorHex?: string; sku: string; stock: number; price: number;
      }) => ({
        size:     sizeLabel,
        color:    v.color,
        colorHex: v.colorHex ?? "#000000",
        sku:      v.sku,
        stock:    Number(v.stock),
        price:    rupeesToPaisa(v.price),
      })),
    });

    return NextResponse.json({ success: true, productId }, { status: 201 });
  } catch (err) {
    console.error("Create product error:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}