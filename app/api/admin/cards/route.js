import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";
import { createCard, certExists, isValidAdminSession } from "../../../../lib/data";

const isServerless = !!process.env.VERCEL;

function requireAdmin() {
  const token = cookies().get("apex_admin")?.value;
  return isValidAdminSession(token);
}

export async function POST(request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const title = formData.get("title")?.toString().trim();
  const category = formData.get("category")?.toString().trim();
  const grade = parseInt(formData.get("grade"), 10);
  const cert = formData.get("cert")?.toString().trim();
  const priceDollars = parseFloat(formData.get("price"));
  const file = formData.get("image");
  const pastedImageUrl = formData.get("imageUrl")?.toString().trim();

  if (!title || !category || !cert || Number.isNaN(grade) || Number.isNaN(priceDollars)) {
    return NextResponse.json({ error: "Fill in title, category, grade, cert, and price." }, { status: 400 });
  }
  if (grade < 1 || grade > 10) {
    return NextResponse.json({ error: "Grade must be between 1 and 10." }, { status: 400 });
  }
  if (certExists(cert)) {
    return NextResponse.json({ error: `Cert ${cert} is already on the site.` }, { status: 409 });
  }

  let imageUrl = null;

  if (pastedImageUrl) {
    // Works on any host, including serverless — paste a URL already hosted
    // elsewhere (e.g. a Vercel Blob URL, or any public image link).
    imageUrl = pastedImageUrl;
  } else if (file && typeof file === "object" && file.size > 0) {
    if (isServerless) {
      return NextResponse.json(
        {
          error:
            "Direct file upload isn't available on this host's read-only filesystem. " +
            "Use the 'Image URL' field instead (e.g. a Vercel Blob or other hosted image link), " +
            "or run this admin page on a host with persistent storage.",
        },
        { status: 400 }
      );
    }
    const ext = (file.name?.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const filename = `${randomUUID()}.${ext || "jpg"}`;
    const uploadsDir = path.join(process.cwd(), "public", "assets", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadsDir, filename), bytes);
    imageUrl = `/assets/uploads/${filename}`;
  }

  const card = createCard({
    title,
    category,
    grade,
    cert,
    price: Math.round(priceDollars * 100),
    imageUrl,
  });

  return NextResponse.json({ card });
}
