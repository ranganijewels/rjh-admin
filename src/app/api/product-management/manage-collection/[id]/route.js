import { handlePATCH } from "@/lib/apiHandler";

export async function PUT(req, { params }) {
  const authHeader = req.headers.get("authorization");
  const body = await req.json();
  return handlePATCH(`/api/v1/masters/values/${(await params).id}`, body, { Authorization: authHeader });
}
