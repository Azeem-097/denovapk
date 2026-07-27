import { NextResponse } from "next/server";
import { getProducts } from "@/lib/db/repositories/products";
import { adaptProduct } from "@/lib/adapters";

export const dynamic = "force-dynamic";

function parseLimit(value: string | null, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.floor(parsed), 24);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") ?? "").trim();
    const limit = parseLimit(searchParams.get("limit"), query ? 12 : 4);

    const products = await getProducts({
      status: "PUBLISHED",
      search: query || undefined,
      isBestSeller: query ? undefined : true,
      sortBy: query ? "newest" : "bestselling",
      limit,
    });

    const results = products.map(adaptProduct).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      image: p.images[0]?.url ?? "",
      imageAlt: p.images[0]?.alt || p.name,
      collection: p.collection,
      tags: p.tags,
      isBestSeller: p.isBestSeller,
      createdAt: p.createdAt,
    }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
