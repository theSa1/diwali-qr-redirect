import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  const { code } = await request.json();

  if (code !== process.env.AUTH_CODE) {
    return NextResponse.json(
      { message: "Invalid authentication code" },
      { status: 401 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: "auth-code",
    value: code,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  return NextResponse.json({ message: "Authenticated successfully" });
};
