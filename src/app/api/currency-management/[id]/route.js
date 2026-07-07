import { handlePATCH, handleDELETE } from "@/lib/apiHandler";
import { toBody } from "../route";

const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT =
  process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

export async function PUT(req, { params }) {
  const authHeader = req.headers.get("authorization");
  const body = await req.json();
  // NestJS exposes PUT for currency update.
  const res = await fetch(`${NEST}/api/v1/currencies/${(await params).id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-id": TENANT,
      Authorization: authHeader || "",
    },
    body: JSON.stringify(toBody(body)),
  });
  const data = await res.json();
  return Response.json(data, { status: res.ok ? 200 : res.status });
}

export async function DELETE(req, { params }) {
  const authHeader = req.headers.get("authorization");
  return handleDELETE(`/api/v1/currencies/${(await params).id}`, null, {
    Authorization: authHeader,
  });
}
