const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

// PATCH /api/order-management/:id/test  { isTest } — test orders are excluded from reporting.
export async function PATCH(req, { params }) {
  const { id } = await params;
  const auth = req.headers.get("authorization");
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${NEST}/api/v1/orders/${id}/test`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-tenant-id": TENANT, ...(auth && { Authorization: auth }) },
    body: JSON.stringify({ isTest: !!body.isTest }),
  });
  const json = await res.json().catch(() => ({}));
  return Response.json(json?.data ?? json, { status: res.ok ? 200 : res.status });
}
