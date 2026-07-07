import { handlePATCH } from "@/lib/apiHandler";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  const authHeader = req.headers.get("authorization");
  const body = await req.json();
  const { is_active } = body;

  if (typeof is_active !== "boolean") {
    return NextResponse.json({ error: "is_active must be boolean" }, { status: 400 });
  }

  return handlePATCH(`/api/v1/coupons/${(await params).id}`, { isActive: is_active }, { Authorization: authHeader });
}
