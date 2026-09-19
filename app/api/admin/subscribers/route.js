import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { listSubscribers, isValidAdminSession } from "../../../../lib/data";

async function requireAdmin() {
  const token = cookies().get("apex_admin")?.value;
  return isValidAdminSession(token);
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const subscribers = await listSubscribers();
  return NextResponse.json({ subscribers });
}
