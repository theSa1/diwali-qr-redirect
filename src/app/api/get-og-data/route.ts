import { isAuthenticated } from "@/lib/is-authenticated";
import { NextRequest, NextResponse } from "next/server";

const getMetadata = async (url: string) => {
  const res = await fetch(
    "https://jsonlink.io/api/extract?url=" +
      encodeURIComponent(url) +
      "&api_key=" +
      process.env.JSONLINK_API_KEY
  );

  if (!res.ok) {
    throw new Error("Failed to fetch metadata");
  }

  const data = (await res.json()) as {
    title: string;
    images: string[];
    sitename: string;
    favicon: string;
    domain: string;
  };

  console.log(data);

  return {
    title: data.title || "",
    ogImage: data.images && data.images.length > 0 ? data.images[0] : "",
  };
};

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
    const ogData = await getMetadata(url);

    return NextResponse.json({
      title: ogData.title,
      ogImage: ogData.ogImage,
    });
  } catch (error) {
    console.error("Error fetching OG data:", error);
    return NextResponse.json(
      { error: "Failed to fetch the provided URL" },
      { status: 500 }
    );
  }
};
