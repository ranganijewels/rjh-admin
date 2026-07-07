import { handleGET, handlePATCH, handleDELETE } from "@/lib/apiHandler";

export async function GET(req, { params }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  return handleGET(`/api/v1/masters/values?category=faq_category`, { Authorization: authHeader });
}

export async function PUT(req, { params }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  const body = await req.json();
  const fakeReq = new Request("http://localhost", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", authorization: authHeader || "" },
    body: JSON.stringify({ value: body.name || body.value, label: body.name || body.label }),
  });
  return handlePATCH(`/api/v1/masters/values/${id}`, { value: body.name || body.value, label: body.name || body.label }, { Authorization: authHeader });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  return handleDELETE(`/api/v1/masters/values/${id}`, null, { Authorization: authHeader });
}
