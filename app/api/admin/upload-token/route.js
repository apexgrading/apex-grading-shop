import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidAdminSession } from "../../../../lib/data";

export async function POST(request) {
  const token = cookies().get("apex_admin")?.value;
  if (!(await isValidAdminSession(token))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          access: "private",
          addRandomSuffix: true,
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
        };
      },
      onUploadCompleted: async () => {
        // Nothing to do server-side here — the client saves the returned URL
        // onto the card itself via the normal create-card request.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
