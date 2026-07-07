const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT =
  process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

// Admin price preview — calls the engine's /price-preview (no save).
export async function POST(req) {
  const auth = req.headers.get("authorization");
  const body = await req.json();
  const res = await fetch(`${NEST}/api/v1/price-preview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-id": TENANT,
      ...(auth && { Authorization: auth }),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data?.data ?? data, { status: res.ok ? 200 : res.status });
}
