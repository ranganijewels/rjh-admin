import { RESOURCE_MAP } from "../../route";

const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

// Custom row actions: POST /api/enterprise/<resource>/<id>/<action>
// e.g. reviews/:id/moderate, production-orders/:id/advance, quotes/:id/accept
export async function POST(req, { params }) {
  const { resource, id, action } = await params;
  const path = RESOURCE_MAP[resource];
  if (!path) return Response.json({ error: "Unknown resource" }, { status: 404 });
  const auth = req.headers.get("authorization");
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${NEST}/api/v1/${path}/${id}/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-tenant-id": TENANT, ...(auth && { Authorization: auth }) },
    body: JSON.stringify(body),
  });
  const j = await res.json().catch(() => ({}));
  return Response.json(j?.data ?? j, { status: res.ok ? 200 : res.status });
}
