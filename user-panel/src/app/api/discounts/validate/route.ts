import { NextResponse } from "next/server";
import { validateDiscount } from "@/lib/db/repositories/discounts";
import { rupeesToPaisa } from "@/lib/priceUtils";

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();
    if (!code || subtotal === undefined) {
      return NextResponse.json({ valid: false, error: "Missing fields" }, { status: 400 });
    }

    const result = await validateDiscount(code, rupeesToPaisa(subtotal));

    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.error });
    }

    return NextResponse.json({
      valid:  true,
      code:   result.discount!.code,
      type:   result.discount!.type,
      value:  result.discount!.value,
      amount: result.amount! / 100, // paisa → rupees
      id:     result.discount!.id,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ valid: false, error: "Server error" }, { status: 500 });
  }
}