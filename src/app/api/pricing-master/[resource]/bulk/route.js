const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT =
  process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

// Same whitelist as ../route.js — kept in sync manually since there are only
// the 8 pricing masters and this list rarely changes.
const ALLOWED = new Set([
  "metal-rates",
  "diamond-rates",
  "labor-rates",
  "tax-rates",
  "shipping-rates",
  "additional-charges",
  "diamond-metal-weights",
  "price-books",
]);

// CSV import lands here: the browser parses the file and posts the full
// array of rows in one request, forwarded straight to each master's existing
// `POST /:resource/bulk` (already used by nothing else today, but built for
// exactly this — see RateCrud.doBulk in rate-masters.controller.ts).
export async function POST(req, { params }) {
  const { resource } = await params;
  if (!ALLOWED.has(resource))
    return Response.json({ error: "Unknown resource" }, { status: 404 });
  const auth = req.headers.get("authorization");
  const body = await req.json().catch(() => ({}));
  const items = Array.isArray(body?.items) ? body.items : [];
  if (!items.length)
    return Response.json({ error: "No rows to import" }, { status: 400 });

  const res = await fetch(`${NEST}/api/v1/${resource}/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-id": TENANT,
      ...(auth && { Authorization: auth }),
    },
    body: JSON.stringify({ items }),
  });
  const data = await res.json().catch(() => ({}));
  return Response.json(data, { status: res.ok ? 200 : res.status });
}
