import { handleGET } from "@/lib/apiHandler";

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category_id") || "";
  const qs = category ? `?category=${category}` : "";
  return handleGET(`/api/v1/masters/values${qs}`, { Authorization: authHeader });
}
