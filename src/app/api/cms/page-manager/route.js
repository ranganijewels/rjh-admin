import { NextResponse } from "next/server";

const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

// Static pages are the same cms_pages records the CMS Studio edits (keyed by
// slug). The admin table uses page_title/page_slug/is_active, so map both ways
// here; `id` is the slug so edits and status changes address the same record.
export function mapPage(p) {
  return {
    ...p,
    id: p.slug,
    record_id: p.id,
    page_title: p.title,
    page_slug: p.slug,
    is_active: !!p.isPublished,
  };
}

export const slugify = (s) =>
  String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

export async function nest(method, path, auth, body) {
  const res = await fetch(`${NEST}/api/v1${path}`, {
    method,
    headers: { "Content-Type": "application/json", "x-tenant-id": TENANT, ...(auth && { Authorization: auth }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

export async function GET(req) {
  const { ok, status, json } = await nest("GET", "/cms/pages", req.headers.get("authorization"));
  const rows = Array.isArray(json?.data) ? json.data : [];
  return NextResponse.json({ ...json, data: rows.map(mapPage) }, { status: ok ? 200 : status });
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const slug = slugify(body.page_slug || body.slug || body.page_title || body.title);
  if (!slug) return NextResponse.json({ status: false, errors: { page_title: ["Title is required"] } }, { status: 400 });
  const { ok, status, json } = await nest("PUT", `/cms/pages/${slug}`, req.headers.get("authorization"), {
    title: body.page_title || body.title,
    content: body.content ?? "",
    isPublished: false,
  });
  return NextResponse.json(ok ? { status: true, data: mapPage(json?.data || {}) } : json, { status: ok ? 200 : status });
}
