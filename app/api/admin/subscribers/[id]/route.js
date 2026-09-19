import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSubscriber, isValidAdminSession } from "../../../../../lib/data";

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
    return NextResponse.json({ error: "Invalid subscriber id." }, { status: 400 });
  }
  await deleteSubscriber(id);
  return NextResponse.json({ ok: true });
}
