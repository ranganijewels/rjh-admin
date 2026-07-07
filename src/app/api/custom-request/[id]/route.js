import { handleGET } from "@/lib/apiHandler";

export async function GET(req, { params }) {
  const authHeader = req.headers.get("authorization");
  const { id } = await params;
  return handleGET(`/api/v1/storefront/custom-requests/${id}`, { Authorization: authHeader });
}
