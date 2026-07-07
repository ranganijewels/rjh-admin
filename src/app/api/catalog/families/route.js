const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT =
  process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

export async function GET(req) {
  const qs = new URL(req.url).search || "";
  try {
    const res = await fetch(`${NEST}/api/v1/product-families${qs}`, {
      method: "GET",
      headers: { "x-tenant-id": TENANT },
      cache: "no-store",
    });
    const j = await res.json().catch(() => ({}));
    return Response.json(j?.data ?? j, { status: res.ok ? 200 : res.status });
  } catch (e) {
    return Response.json(
      { message: e?.message || "Upstream error" },
      { status: 502 }
    );
  }
}

export async function POST(req) {
  const auth = req.headers.get("authorization");
  const body = await req.json().catch(() => ({}));
  try {
    const res = await fetch(`${NEST}/api/v1/product-families`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": TENANT,
        ...(auth && { Authorization: auth }),
      },
      cache: "no-store",
      body: JSON.stringify(body),
    });
    const j = await res.json().catch(() => ({}));
    return Response.json(j?.data ?? j, { status: res.ok ? 200 : res.status });
  } catch (e) {
    return Response.json(
      { message: e?.message || "Upstream error" },
      { status: 502 }
    );
  }
}
