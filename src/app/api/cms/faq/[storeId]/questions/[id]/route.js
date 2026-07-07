import { handleGET, handlePATCH, handleDELETE } from "@/lib/apiHandler";

export async function GET(req, { params }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  return handleGET(`/api/v1/cms/faqs/${id}`, { Authorization: authHeader });
}

export async function PUT(req, { params }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  const body = await req.json();
  return handlePATCH(`/api/v1/cms/faqs/${id}`, body, { Authorization: authHeader });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");
  return handleDELETE(`/api/v1/cms/faqs/${id}`, null, { Authorization: authHeader });
}
