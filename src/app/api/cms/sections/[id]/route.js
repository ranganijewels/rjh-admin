import { handlePUT, handleDELETE } from "@/lib/apiHandler";

export async function PUT(req, { params }) {
  const authHeader = req.headers.get("authorization");
  return handlePUT(req, `/api/v1/cms/sections/${(await params).id}`, { Authorization: authHeader });
}

export async function DELETE(req, { params }) {
  const authHeader = req.headers.get("authorization");
  return handleDELETE(`/api/v1/cms/sections/${(await params).id}`, null, { Authorization: authHeader });
}
