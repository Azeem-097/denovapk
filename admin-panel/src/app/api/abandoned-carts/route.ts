import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { getAbandonedCarts, getAbandonedCartStats } from "@/lib/db/repositories/abandonedCart";

export async function GET(req: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const filter = (searchParams.get("filter") as "all" | "guest" | "registered" | "checkout" | "recovered") ?? "all";
  const search = searchParams.get("search") ?? undefined;

  const [carts, stats] = await Promise.all([
    getAbandonedCarts({ filter, search, limit: 200 }),
    getAbandonedCartStats(),
  ]);

  return NextResponse.json({ carts, stats });
}