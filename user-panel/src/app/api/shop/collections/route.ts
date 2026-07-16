import { NextResponse } from "next/server";
import { getAllCollections } from "@/lib/db/repositories/collections";

export const revalidate = 60;

export async function GET() {
  try {
    const collections = await getAllCollections(true);
    return NextResponse.json({
      collections: collections.map((c) => ({
        id:   c.id,
        name: c.name,
        slug: c.slug,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ collections: [] });
  }
}