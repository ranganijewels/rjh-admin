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

// PUT /api/catalog/boms/:id
export async function PUT(req, { params }) {
  const { id } = await params;
  const auth = req.headers.get("authorization");
  const body = await req.json();
  const res = await fetch(`${NEST}/api/v1/product-boms/${id}`, {
    method: "PUT",
    headers: headers(auth),
    body: JSON.stringify(body),
  });
  const j = await res.json().catch(() => ({}));
  return Response.json(j?.data ?? j, { status: res.ok ? 200 : res.status });
}

// DELETE /api/catalog/boms/:id
export async function DELETE(req, { params }) {
  const { id } = await params;
  const auth = req.headers.get("authorization");
  const res = await fetch(`${NEST}/api/v1/product-boms/${id}`, {
    method: "DELETE",
    headers: headers(auth),
  });
  const j = await res.json().catch(() => ({ success: res.ok }));
  return Response.json(j?.data ?? j, { status: res.ok ? 200 : res.status });
}
