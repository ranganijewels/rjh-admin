const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT =
  process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

const ALLOWED = new Set([
  "metal-rates",
  "diamond-rates",
  "labor-rates",
  "tax-rates",
  "shipping-rates",
  "additional-charges",
  "diamond-metal-weights",
  "price-books",
]);

function headers(auth) {
  return {
    "Content-Type": "application/json",
    "x-tenant-id": TENANT,
    ...(auth && { Authorization: auth }),
  };
}

export async function PUT(req, { params }) {
  const { resource, id } = await params;
  if (!ALLOWED.has(resource))
    return Response.json({ error: "Unknown resource" }, { status: 404 });
  const auth = req.headers.get("authorization");
  const body = await req.json();
  const res = await fetch(`${NEST}/api/v1/${resource}/${id}`, {
    method: "PUT",
    headers: headers(auth),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data, { status: res.ok ? 200 : res.status });
}

export async function DELETE(req, { params }) {
  const { resource, id } = await params;
  if (!ALLOWED.has(resource))
    return Response.json({ error: "Unknown resource" }, { status: 404 });
  const auth = req.headers.get("authorization");
  const res = await fetch(`${NEST}/api/v1/${resource}/${id}`, {
    method: "DELETE",
    headers: headers(auth),
  });
  const data = await res.json().catch(() => ({ success: res.ok }));
  return Response.json(data, { status: res.ok ? 200 : res.status });
}
