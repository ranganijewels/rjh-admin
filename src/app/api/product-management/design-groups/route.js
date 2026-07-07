const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT =
  process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

// List every design group + its member products (for the form picker and the
// Product Groups management view).
export async function GET(req) {
  const auth = req.headers.get("authorization");
  const res = await fetch(`${NEST}/api/v1/products/design-groups`, {
    headers: { "x-tenant-id": TENANT, ...(auth && { Authorization: auth }) },
    cache: "no-store",
  });
  const data = await res.json();
  return Response.json({ data: data?.data ?? data }, { status: res.ok ? 200 : res.status });
}
