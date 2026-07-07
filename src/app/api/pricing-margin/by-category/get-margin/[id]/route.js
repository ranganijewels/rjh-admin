import { handleGET } from "@/lib/apiHandler";

export async function GET(req, { params }) {
  const authHeader = req.headers.get("authorization");
  return handleGET(`/api/v1/pricing-config`, { Authorization: authHeader });
}
