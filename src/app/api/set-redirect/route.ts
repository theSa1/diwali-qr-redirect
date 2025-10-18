import { NextRequest, NextResponse } from "next/server";
import { Dub } from "dub";
import { isAuthenticated } from "@/lib/is-authenticated";

const dub = new Dub({
  token: process.env.DUB_API_KEY,
});

export const POST = async (req: NextRequest) => {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { link } = await req.json();

  if (!link || typeof link !== "string") {
    return NextResponse.json({
      success: false,
      error: "Missing or invalid 'link' in request body",
    });
  }

  try {
    new URL(link);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid URL format" });
  }

  try {
    const update = await dub.links.update(process.env.DUB_LINK_ID!, {
      url: link,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting redirect:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to set redirect",
    });
  }
};
