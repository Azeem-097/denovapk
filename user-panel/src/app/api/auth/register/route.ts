import { NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/db/repositories/users";
import { generateUserToken, setUserCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, phone, password } = await req.json();

    if (!firstName || !lastName || !email || !password || !phone) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Check if user exists
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const user = await createUser({
      name:     `${firstName} ${lastName}`.trim(),
      email,
      password,
      phone,
    });

    const token = generateUserToken({ id: user.id, email: user.email });
    await setUserCookie(token);

    return NextResponse.json({
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        phone: user.phone,
      },
    }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}