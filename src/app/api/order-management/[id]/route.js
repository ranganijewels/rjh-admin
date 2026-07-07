import { handleGET } from "@/lib/apiHandler";

export async function GET(req, { params }) {
  const authHeader = req.headers.get("authorization");
  return handleGET(`/api/v1/orders/${(await params).id}`, { Authorization: authHeader });
}
