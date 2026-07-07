const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT =
  process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

export async function PATCH(req, { params }) {
  const authHeader = req.headers.get("authorization");
  const res = await fetch(
    `${NEST}/api/v1/currencies/${(await params).id}/default`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": TENANT,
        Authorization: authHeader || "",
      },
    }
  );
  const data = await res.json();
  return Response.json(data, { status: res.ok ? 200 : res.status });
}
