import { handleGET } from "@/lib/apiHandler";

export async function GET(req, { params }) {
  const authHeader = req.headers.get("authorization");
  return handleGET(`/api/v1/products/${(await params).id}`, { Authorization: authHeader });
}
