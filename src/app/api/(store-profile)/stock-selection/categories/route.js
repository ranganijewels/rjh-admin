import { handleGET } from "@/lib/apiHandler";

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  return handleGET("/api/v1/masters/categories", { Authorization: authHeader });
}
