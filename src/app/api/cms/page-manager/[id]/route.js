import { handlePATCH, handleDELETE } from "@/lib/apiHandler";

export async function PUT(req, { params }) {
  const authHeader = req.headers.get("authorization");
  const body = await req.json();
  return handlePATCH(`/api/v1/cms/pages/${(await params).id}`, body, { Authorization: authHeader });
}

export async function DELETE(req, { params }) {
  const authHeader = req.headers.get("authorization");
  return handleDELETE(`/api/v1/cms/pages/${(await params).id}`, null, { Authorization: authHeader });
}
