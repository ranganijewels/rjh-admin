const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT =
  process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

function headers(auth) {
  return {
    "Content-Type": "application/json",
    "x-tenant-id": TENANT,
    ...(auth && { Authorization: auth }),
  };
}

// GET /api/catalog/boms?familyId=<id>&masterCode=<code>
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const qs = new URLSearchParams();
  const familyId = searchParams.get("familyId");
  const masterCode = searchParams.get("masterCode");
  if (familyId) qs.set("familyId", familyId);
  if (masterCode) qs.set("masterCode", masterCode);
  const query = qs.toString();

  const res = await fetch(
    `${NEST}/api/v1/product-boms${query ? `?${query}` : ""}`,
    { headers: { "x-tenant-id": TENANT }, cache: "no-store" }
  );
  const j = await res.json().catch(() => ([]));
  return Response.json(j?.data ?? j, { status: res.ok ? 200 : res.status });
}

// POST /api/catalog/boms
export async function POST(req) {
  const auth = req.headers.get("authorization");
  const body = await req.json();
  const res = await fetch(`${NEST}/api/v1/product-boms`, {
    method: "POST",
    headers: headers(auth),
    body: JSON.stringify(body),
  });
  const j = await res.json().catch(() => ({}));
  return Response.json(j?.data ?? j, { status: res.ok ? 200 : res.status });
}
