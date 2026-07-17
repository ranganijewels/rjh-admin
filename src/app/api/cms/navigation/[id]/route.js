const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

// Custom fetch (not the shared handleDELETE helper) so an error body's real
// `message` — e.g. the 409 "delete or reparent children first" conflict —
// passes through verbatim instead of being replaced by a generic one.

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const auth = req.headers.get("authorization");
    const res = await fetch(`${NEST}/api/v1/cms/navigation/${id}`, {
      method: "GET",
      headers: { "x-tenant-id": TENANT, ...(auth && { Authorization: auth }) },
      cache: "no-store",
    });
    const j = await res.json().catch(() => ({}));
    return Response.json(j?.data ?? j, { status: res.ok ? 200 : res.status });
  } catch (err) {
    return Response.json({ message: err?.message || "Proxy error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const auth = req.headers.get("authorization");
    const body = await req.json();
    const res = await fetch(`${NEST}/api/v1/cms/navigation/${id}`, {
      method: "PUT",
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

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const auth = req.headers.get("authorization");
    const res = await fetch(`${NEST}/api/v1/cms/navigation/${id}`, {
      method: "DELETE",
      headers: { "x-tenant-id": TENANT, ...(auth && { Authorization: auth }) },
      cache: "no-store",
    });
    // 204 No Content has no body to parse.
    if (res.status === 204) return new Response(null, { status: 204 });
    const j = await res.json().catch(() => ({}));
    return Response.json(j?.data ?? j, { status: res.ok ? 200 : res.status });
  } catch (err) {
    return Response.json({ message: err?.message || "Proxy error" }, { status: 500 });
  }
}
