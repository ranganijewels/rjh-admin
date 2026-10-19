const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT =
  process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

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

// One request deleting many rows server-side, instead of the admin UI firing
// one DELETE per selected row — with a big selection that fanned out into
// that many concurrent requests, reliably exhausted the DB connection pool,
// failed silently, and never even refreshed the list to show what (if
// anything) actually got deleted.
export async function POST(req, { params }) {
  const { resource } = await params;
  if (!ALLOWED.has(resource))
    return Response.json({ error: "Unknown resource" }, { status: 404 });
  const auth = req.headers.get("authorization");
  const body = await req.json().catch(() => ({}));
  const ids = Array.isArray(body?.ids) ? body.ids : [];
  if (!ids.length)
    return Response.json({ error: "No rows to delete" }, { status: 400 });

  const res = await fetch(`${NEST}/api/v1/${resource}/bulk-delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-id": TENANT,
      ...(auth && { Authorization: auth }),
    },
    body: JSON.stringify({ ids }),
  });
  const data = await res.json().catch(() => ({}));
  return Response.json(data, { status: res.ok ? 200 : res.status });
}
