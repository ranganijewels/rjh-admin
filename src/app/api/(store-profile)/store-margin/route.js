import { handleGET, handlePOST } from "@/lib/apiHandler";

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  return handleGET("/api/v1/pricing-config", { Authorization: authHeader });
}

export async function POST(req) {
  const authHeader = req.headers.get("authorization");
  return handlePOST(req, "/api/v1/pricing-config", { Authorization: authHeader });
}
