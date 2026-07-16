import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/db/repositories/users";
import { updateUserBirthday } from "@/lib/db/repositories/birthday";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fullUser = await getUserById(user.id);
  if (!fullUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    user: {
      id:       fullUser.id,
      name:     fullUser.name,
      email:    fullUser.email,
      phone:    fullUser.phone,
      birthday: fullUser.birthday,
      loyaltyPoints: fullUser.loyaltyPoints,
    },
  });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, email, phone, birthday } = body;

    // Update basic info
    if (name !== undefined || email !== undefined || phone !== undefined) {
      await updateUser(user.id, { name, email, phone });
    }

    // Update birthday separately (can be set to null to clear)
    if (birthday !== undefined) {
      if (birthday === null || birthday === "") {
        await updateUserBirthday(user.id, null);
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
        await updateUserBirthday(user.id, birthday);
      } else {
        return NextResponse.json({ error: "Invalid birthday format (YYYY-MM-DD required)" }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}