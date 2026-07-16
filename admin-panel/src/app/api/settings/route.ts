import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { getAllSettings, setMultipleSettings } from "@/lib/db/repositories/settings";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const settings = await getAllSettings();
  return NextResponse.json({ settings });
}

export async function POST(req: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { settings } = await req.json();
    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: "settings must be an array" }, { status: 400 });
    }

    await setMultipleSettings(settings);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}