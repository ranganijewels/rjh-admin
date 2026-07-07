const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

// Maps an admin resource slug → the NestJS REST base (some are nested).
export const RESOURCE_MAP = {
  accounts: "accounts",
  quotes: "quotes",
  events: "events",
  reviews: "reviews",
  "work-centers": "work-centers",
  "production-orders": "production-orders",
  warranties: "warranties",
  "service-requests": "service-requests",
  returns: "returns",
  "seo-pages": "seo/pages",
  "seo-redirects": "seo/redirects",
  "dam-assets": "dam/assets",
  "pim-attributes": "pim/attributes",
};

export async function GET(req, { params }) {
  const { resource } = await params;
  const path = RESOURCE_MAP[resource];
  if (!path) return Response.json({ error: "Unknown resource" }, { status: 404 });
  const { search } = new URL(req.url);
  const res = await fetch(`${NEST}/api/v1/${path}${search || ""}`, {
    headers: { "x-tenant-id": TENANT },
    cache: "no-store",
  });
  const j = await res.json();
  return Response.json(j?.data ?? j, { status: res.ok ? 200 : res.status });
}

export async function POST(req, { params }) {
  const { resource } = await params;
  const path = RESOURCE_MAP[resource];
  if (!path) return Response.json({ error: "Unknown resource" }, { status: 404 });
  const auth = req.headers.get("authorization");
  const body = await req.json();
  const res = await fetch(`${NEST}/api/v1/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-tenant-id": TENANT, ...(auth && { Authorization: auth }) },
    body: JSON.stringify(body),
  });
  const j = await res.json();
  return Response.json(j?.data ?? j, { status: res.ok ? 200 : res.status });
}
