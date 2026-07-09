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
      status, isNew, isFeatured, isBestSeller, tags, imageUrl, variants,
    } = body;

    if (!name || !description || !sku || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slug = body.slug || slugify(name);

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
      imageUrl:     imageUrl || undefined,
      variants:     variants?.map((v: {
        size: string; color: string; colorHex?: string; sku: string; stock: number; price: number;
      }) => ({
        size:     v.size,
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