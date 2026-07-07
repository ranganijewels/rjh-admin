import { RESOURCE_MAP } from "../route";

const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

export async function PUT(req, { params }) {
  const { resource, id } = await params;
  const path = RESOURCE_MAP[resource];
  if (!path) return Response.json({ error: "Unknown resource" }, { status: 404 });
  const auth = req.headers.get("authorization");
  const body = await req.json();
  const res = await fetch(`${NEST}/api/v1/${path}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-tenant-id": TENANT, ...(auth && { Authorization: auth }) },
    body: JSON.stringify(body),
  });
  const j = await res.json();
  return Response.json(j?.data ?? j, { status: res.ok ? 200 : res.status });
}

export async function DELETE(req, { params }) {
  const { resource, id } = await params;
  const path = RESOURCE_MAP[resource];
  if (!path) return Response.json({ error: "Unknown resource" }, { status: 404 });
  const auth = req.headers.get("authorization");
  const res = await fetch(`${NEST}/api/v1/${path}/${id}`, {
    method: "DELETE",
    headers: { "x-tenant-id": TENANT, ...(auth && { Authorization: auth }) },
  });
  const j = await res.json().catch(() => ({ success: true }));
  return Response.json(j?.data ?? j, { status: res.ok ? 200 : res.status });
}
