import { handlePOST } from "@/lib/apiHandler";

export async function POST(req) {
  const authHeader = req.headers.get("authorization");
  return handlePOST(req, "/api/v1/ai/generate-listing", { Authorization: authHeader });
}
