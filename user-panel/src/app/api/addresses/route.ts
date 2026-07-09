import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserAddresses, createAddress } from "@/lib/db/repositories/users";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addresses = await getUserAddresses(user.id);
  return NextResponse.json({ addresses });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const addr = await createAddress({ ...body, userId: user.id });
    return NextResponse.json({ address: addr }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }
}