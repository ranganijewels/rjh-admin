import { handleGET, handlePOST } from "@/lib/apiHandler";

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  return handleGET("/api/v1/cms/faqs/admin/all", { Authorization: authHeader });
}

export async function POST(req) {
  const authHeader = req.headers.get("authorization");
  return handlePOST(req, "/api/v1/cms/faqs", { Authorization: authHeader });
}
