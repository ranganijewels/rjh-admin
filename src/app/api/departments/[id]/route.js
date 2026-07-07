import { handleDELETE } from "@/lib/apiHandler";

export async function DELETE(req, { params }) {
  const authHeader = req.headers.get("authorization");
  return handleDELETE(`/api/v1/masters/values/${(await params).id}`, null, { Authorization: authHeader });
}
