import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { setDefaultAddress } from "@/lib/db/repositories/users";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await setDefaultAddress(user.id, id);
  return NextResponse.json({ success: true });
}