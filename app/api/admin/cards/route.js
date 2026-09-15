import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";
import { put } from "@vercel/blob";
import { createCard, certExists, isValidAdminSession, listCards } from "../../../../lib/data";

const isServerless = !!process.env.VERCEL;

function requireAdmin() {
  const token = cookies().get("apex_admin")?.value;
  return isValidAdminSession(token);
}

export async function GET(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const result = await listCards({ page, search, includeSold: true, sort: "newest" });
  return NextResponse.json(result);
}

// Resolves one photo field (file upload or pasted URL) into a final image URL.
// Returns { imageUrl, errorResponse } — errorResponse is a NextResponse to
// return immediately if something went wrong, else null.
async function resolveImage(file, pastedUrl) {
  if (pastedUrl) {
    return { imageUrl: pastedUrl, errorResponse: null };
  }
  if (!file || typeof file !== "object" || file.size === 0) {
    return { imageUrl: null, errorResponse: null };
  }

  if (isServerless) {
    if (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN) {
      return {
        imageUrl: null,
        errorResponse: NextResponse.json(
          {
            error:
              "Photo upload needs a Vercel Blob store connected to this project first (Vercel dashboard → Storage → Create Database → Blob, then connect it to apex-shop). " +
              "Until then, use the Image URL field instead.",
          },
          { status: 400 }
        ),
      };
    }
    const ext = (file.name?.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const filename = `cards/${randomUUID()}.${ext || "jpg"}`;
    let blob;
    try {
      blob = await put(filename, file, { access: "private" });
    } catch (err) {
      return {
        imageUrl: null,
        errorResponse: NextResponse.json({ error: `Photo upload failed: ${err.message}` }, { status: 500 }),
      };
    }
    // Store our own proxy URL, not the direct (private) blob URL — the blob
    // store's access is private, but /api/images serves it publicly.
    return { imageUrl: `/api/images/${filename}`, errorResponse: null };
  }

  const ext = (file.name?.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const filename = `${randomUUID()}.${ext || "jpg"}`;
  const uploadsDir = path.join(process.cwd(), "public", "assets", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(uploadsDir, filename), bytes);
  return { imageUrl: `/assets/uploads/${filename}`, errorResponse: null };
}

export async function POST(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const title = formData.get("title")?.toString().trim();
  const category = formData.get("category")?.toString().trim();
  const isGraded = formData.get("isGraded")?.toString() !== "false"; // default true
  const grade = parseInt(formData.get("grade"), 10);
  const cert = formData.get("cert")?.toString().trim();
  const condition = formData.get("condition")?.toString().trim();
  const isPreorder = formData.get("isPreorder")?.toString() === "true";
  const expectedDate = formData.get("expectedDate")?.toString().trim();
  const priceDollars = parseFloat(formData.get("price"));
  const file = formData.get("image");
  const pastedImageUrl = formData.get("imageUrl")?.toString().trim();
  const fileBack = formData.get("imageBack");
  const pastedImageUrlBack = formData.get("imageUrlBack")?.toString().trim();

  if (!title || !category || Number.isNaN(priceDollars)) {
    return NextResponse.json({ error: "Fill in title, category, and price." }, { status: 400 });
  }

  if (isGraded) {
    if (!cert || Number.isNaN(grade)) {
      return NextResponse.json({ error: "Graded listings need a grade and cert number." }, { status: 400 });
    }
    if (grade < 1 || grade > 10) {
      return NextResponse.json({ error: "Grade must be between 1 and 10." }, { status: 400 });
    }
    if (await certExists(cert)) {
      return NextResponse.json({ error: `Cert ${cert} is already on the site.` }, { status: 409 });
    }
  } else if (!condition) {
    return NextResponse.json({ error: "Raw singles need a condition selected." }, { status: 400 });
  }

  const front = await resolveImage(file, pastedImageUrl);
  if (front.errorResponse) return front.errorResponse;

  const back = await resolveImage(fileBack, pastedImageUrlBack);
  if (back.errorResponse) return back.errorResponse;

  const card = await createCard({
    title,
    category,
    grade,
    cert,
    price: Math.round(priceDollars * 100),
    imageUrl: front.imageUrl,
    imageUrlBack: back.imageUrl,
    isGraded,
    condition,
    isPreorder,
    expectedDate,
  });

  return NextResponse.json({ card });
}
