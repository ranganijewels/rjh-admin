const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

// PUT /api/catalog/masters/:id → update a catalog master value
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const auth = req.headers.get("authorization");
    const body = await req.json();
    const res = await fetch(`${NEST}/api/v1/catalog-masters/${id}`, {
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

// DELETE /api/catalog/masters/:id → remove a catalog master value
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const auth = req.headers.get("authorization");
    const res = await fetch(`${NEST}/api/v1/catalog-masters/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": TENANT,
        ...(auth && { Authorization: auth }),
      },
      cache: "no-store",
    });
    const j = await res.json().catch(() => ({}));
    return Response.json(j?.data ?? j, { status: res.ok ? 200 : res.status });
  } catch (err) {
    return Response.json({ message: err?.message || "Proxy error" }, { status: 500 });
  }
}
