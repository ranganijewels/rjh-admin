import { handleGET } from "@/lib/apiHandler";

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "20";
  const search = searchParams.get("search") || "";
  const query = new URLSearchParams({ page, limit });
  if (search) query.append("search", search);
  return handleGET(`/api/v1/products?${query}`, { Authorization: authHeader });
}
