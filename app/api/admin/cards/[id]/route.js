import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteCard, getCardById, updateCardQuantity, isValidAdminSession } from "../../../../../lib/data";

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

export async function PATCH(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid card id." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const quantity = parseInt(body?.quantity, 10);
  if (Number.isNaN(quantity) || quantity < 0) {
    return NextResponse.json({ error: "Quantity must be 0 or more." }, { status: 400 });
  }

  const card = await getCardById(id);
  if (!card) {
    return NextResponse.json({ error: "Card not found." }, { status: 404 });
  }

  await updateCardQuantity(id, quantity);
  return NextResponse.json({ ok: true });
}
