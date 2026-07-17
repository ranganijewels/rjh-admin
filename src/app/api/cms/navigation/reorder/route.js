import { handlePOST } from "@/lib/apiHandler";

// POST /api/cms/navigation/reorder → recompute sortOrder within a sibling group
export async function POST(req) {
  const authHeader = req.headers.get("authorization");
  return handlePOST(req, "/api/v1/cms/navigation/reorder", { Authorization: authHeader });
}
