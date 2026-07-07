const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT =
  process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

// Live engine prices for a list of products (admin product list column).
export async function POST(req) {
  const auth = req.headers.get("authorization");
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${NEST}/api/v1/pricing/batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-id": TENANT,
      ...(auth && { Authorization: auth }),
    },
    body: JSON.stringify({ productIds: body.productIds || [] }),
  });
  const data = await res.json();
  const d = data?.data ?? data;
  return Response.json({ map: d?.map || {}, results: d?.results || [] }, {
    status: res.ok ? 200 : res.status,
  });
}
