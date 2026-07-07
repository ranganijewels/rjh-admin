import { handleGETWithMap } from "@/lib/apiHandler";

function mapCustomRequest(r) {
  return {
    ...r,
    store_name: r.name,
    category: { name: r.jewelryType ?? "custom" },
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  };
}

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "20";
  return handleGETWithMap(
    `/api/v1/storefront/custom-requests?page=${page}&limit=${limit}`,
    { Authorization: authHeader },
    mapCustomRequest
  );
}
