import { handlePOST } from "@/lib/apiHandler";

// POST /api/cms/sections/seed { pageSlug } → idempotent default-content seed
export async function POST(req) {
  const authHeader = req.headers.get("authorization");
  return handlePOST(req, "/api/v1/cms/sections/seed", { Authorization: authHeader });
}
