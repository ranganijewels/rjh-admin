import { handlePATCH } from "@/lib/apiHandler";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  const authHeader = req.headers.get("authorization");
  const { is_active } = await req.json();

  if (typeof is_active !== "boolean") {
    return NextResponse.json({ error: "is_active must be boolean" }, { status: 400 });
  }

  return handlePATCH(`/api/v1/cms/pages/${(await params).id}`, { isActive: is_active }, { Authorization: authHeader });
}
