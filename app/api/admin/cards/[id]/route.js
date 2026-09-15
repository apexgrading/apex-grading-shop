import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteCard, getCardById, isValidAdminSession } from "../../../../../lib/data";

async function requireAdmin() {
  const token = cookies().get("apex_admin")?.value;
  return isValidAdminSession(token);
}

export async function DELETE(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid card id." }, { status: 400 });
  }

  const card = await getCardById(id);
  if (!card) {
    return NextResponse.json({ error: "Card not found." }, { status: 404 });
  }

  await deleteCard(id);
  return NextResponse.json({ ok: true });
}
