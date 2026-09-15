import { NextResponse } from "next/server";
import { get } from "@vercel/blob";

export async function GET(request, { params }) {
  const pathname = params.path.join("/");

  let result;
  try {
    result = await get(pathname, { access: "private" });
  } catch (err) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (!result) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType || "image/jpeg",
      "X-Content-Type-Options": "nosniff",
      // Card photos never change once uploaded — safe to cache aggressively,
      // unlike the private/per-user case this pattern is normally used for.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
