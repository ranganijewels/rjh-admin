const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

export async function GET(req) {
  const auth = req.headers.get("authorization");
  try {
    const res = await fetch(`${NEST}/api/v1/analytics/dashboard`, {
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": TENANT,
        ...(auth && { Authorization: auth }),
      },
      cache: "no-store",
    });
    const json = await res.json();
    // NestJS wraps payload as { success, data }
    const data = json?.data ?? json;
    return Response.json(data, { status: res.ok ? 200 : res.status });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
