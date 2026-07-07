const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

// GET /api/catalog/masters?kind=<kind>&all=true → forward to NestJS /api/v1/catalog-masters
export async function GET(req) {
  try {
    const { search } = new URL(req.url);
    const res = await fetch(`${NEST}/api/v1/catalog-masters${search || ""}`, {
      method: "GET",
      headers: { "x-tenant-id": TENANT },
      cache: "no-store",
    });
    const j = await res.json().catch(() => ({}));
    return Response.json(j?.data ?? j, { status: res.ok ? 200 : res.status });
  } catch (err) {
    return Response.json({ message: err?.message || "Proxy error" }, { status: 500 });
  }
}

// POST /api/catalog/masters → create a catalog master value
export async function POST(req) {
  try {
    const auth = req.headers.get("authorization");
    const body = await req.json();
    const res = await fetch(`${NEST}/api/v1/catalog-masters`, {
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
  } catch (err) {
    return Response.json({ message: err?.message || "Proxy error" }, { status: 500 });
  }
}
