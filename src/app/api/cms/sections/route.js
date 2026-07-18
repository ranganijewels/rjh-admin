import { handleGET, handlePOST } from "@/lib/apiHandler";

// GET /api/cms/sections?pageSlug=mega-menu → list sections for a page
export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  const { searchParams } = new URL(req.url);
  const pageSlug = searchParams.get("pageSlug") || "";
  return handleGET("/api/v1/cms/sections", { Authorization: authHeader }, { pageSlug });
}

// POST /api/cms/sections → create a new section
export async function POST(req) {
  const authHeader = req.headers.get("authorization");
  return handlePOST(req, "/api/v1/cms/sections", { Authorization: authHeader });
}
