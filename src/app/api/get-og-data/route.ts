import { isAuthenticated } from "@/lib/is-authenticated";
import { NextRequest, NextResponse } from "next/server";
import ogs from "open-graph-scraper";

export const GET = async (req: NextRequest) => {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url).searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing 'url' query parameter" },
      { status: 400 }
    );
  }

  try {
    const ogData = await ogs({ url });
    return NextResponse.json({
      title: ogData.result.ogTitle || "",
      ogImage:
        ogData.result.ogImage && ogData.result.ogImage.length > 0
          ? ogData.result.ogImage[0].url || ""
          : "",
    });
  } catch (error) {
    console.error("Error fetching OG data:", error);
    return NextResponse.json(
      { error: "Failed to fetch the provided URL" },
      { status: 500 }
    );
  }
};
