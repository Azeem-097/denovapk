import { NextResponse } from "next/server";
import { loginAdmin, setAdminCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const result = await loginAdmin(email, password);
    if (!result) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await setAdminCookie(result.token);

    return NextResponse.json({
      admin: {
        id:    result.admin.id,
        name:  result.admin.name,
        email: result.admin.email,
        role:  result.admin.role,
        passwordChangeRequired: result.admin.passwordChangeRequired === 1,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
