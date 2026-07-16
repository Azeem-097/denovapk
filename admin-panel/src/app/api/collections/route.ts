import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { getCollectionsWithCounts, createCollection } from "@/lib/db/repositories/collections";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

// ─── GET /api/collections ───────────────────────────────
export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  // Admin sees ALL collections including inactive
  const collections = await getCollectionsWithCounts(false);
  return NextResponse.json({ collections });
}

// ─── POST /api/collections ──────────────────────────────
export async function POST(req: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { name, slug, description, image, isActive, sortOrder, metaTitle, metaDescription } = body;

    if (!name || String(name).trim() === "") {
      return NextResponse.json({ error: "Collection name is required" }, { status: 400 });
    }

    const finalSlug = (slug && String(slug).trim()) ? String(slug).trim() : slugify(name);

    const id = await createCollection({
      name:            String(name).trim(),
      slug:            finalSlug,
      description:     description ?? "",
      image:           image || null,
      isActive:        isActive !== false,
      sortOrder:       Number(sortOrder) || 0,
      metaTitle:       metaTitle ?? undefined,
      metaDescription: metaDescription ?? undefined,
    });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes("already exists")) {
      return NextResponse.json({ error: msg }, { status: 409 });
    }
    console.error("Create collection error:", err);
    return NextResponse.json({ error: "Failed to create collection: " + msg }, { status: 500 });
  }
}