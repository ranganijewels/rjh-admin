import { NextResponse } from "next/server";
import { mapPage, nest } from "../../route";

// Set published state explicitly (the API toggle is only called when it differs).
export async function PATCH(req, { params }) {
  const { id } = await params;
  const { is_active } = await req.json().catch(() => ({}));
  if (typeof is_active !== "boolean") {
    return NextResponse.json({ error: "is_active must be boolean" }, { status: 400 });
  }
  const auth = req.headers.get("authorization");
  const { ok, status, json } = await nest("PUT", `/cms/pages/${encodeURIComponent(id)}`, auth, { isPublished: is_active });
  return NextResponse.json(ok ? { status: true, data: mapPage(json?.data || {}) } : json, { status: ok ? 200 : status });
}
