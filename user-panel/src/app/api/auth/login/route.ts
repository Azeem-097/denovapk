import { NextResponse } from "next/server";
import { verifyUserPassword } from "@/lib/db/repositories/users";
import { generateUserToken, setUserCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await verifyUserPassword(email, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.isActive !== 1) {
      return NextResponse.json({ error: "Account is inactive" }, { status: 403 });
    }

    const token = generateUserToken({ id: user.id, email: user.email });
    await setUserCookie(token);

    return NextResponse.json({
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}