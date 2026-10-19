import { NextResponse } from "next/server";
import { mapPage, nest } from "../route";

// [id] is the page slug (see mapPage). Only title/content are sent, so the
// other fields saved from the Studio (meta title/description, status) are kept.
export async function PUT(req, { params }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const patch = {};
  if (typeof body.page_title === "string") patch.title = body.page_title;
  if (typeof body.content === "string") patch.content = body.content;
  const { ok, status, json } = await nest("PUT", `/cms/pages/${encodeURIComponent(id)}`, req.headers.get("authorization"), patch);
  return NextResponse.json(ok ? { status: true, data: mapPage(json?.data || {}) } : json, { status: ok ? 200 : status });
}

// Pages are unpublished, never deleted (content and URLs are preserved).
export async function DELETE() {
  return NextResponse.json(
    { status: false, message: "Static pages can't be deleted — switch the page to inactive to unpublish it." },
    { status: 405 }
  );
}
