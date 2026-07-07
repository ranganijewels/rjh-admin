const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

// PATCH /api/order-management/:id/status
// Body: { status, paymentStatus, trackingNumber, courierName, trackingUrl, orderNotes }
export async function PATCH(req, { params }) {
  const { id } = await params;
  const auth = req.headers.get("authorization");
  try {
    const body = await req.json();
    const res = await fetch(`${NEST}/api/v1/orders/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": TENANT,
        ...(auth && { Authorization: auth }),
      },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    return Response.json(json?.data ?? json, { status: res.ok ? 200 : res.status });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
