import { handleGET, handlePATCH, handleDELETE } from "@/lib/apiHandler";

export async function GET(req, { params }) {
  const authHeader = req.headers.get("authorization");
  const { id } = await params;
  return handleGET(`/api/v1/collections/${id}`, { Authorization: authHeader });
}

export async function PUT(req, { params }) {
  const authHeader = req.headers.get("authorization");
  const body = await req.json();
  const { id } = await params;
  return handlePATCH(`/api/v1/collections/${id}`, body, { Authorization: authHeader });
}

export async function DELETE(req, { params }) {
  const authHeader = req.headers.get("authorization");
  const { id } = await params;
  return handleDELETE(`/api/v1/collections/${id}`, null, { Authorization: authHeader });
}
