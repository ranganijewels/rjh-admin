import { handleGET, handlePOST } from "@/lib/apiHandler";

// Collections manager — backed by the NestJS /collections module (real
// collection entities with slug + product assignment), replacing the old
// masters/values?category=collection list.
export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  return handleGET("/api/v1/collections?all=true", { Authorization: authHeader });
}

export async function POST(req) {
  const authHeader = req.headers.get("authorization");
  return handlePOST(req, "/api/v1/collections", { Authorization: authHeader });
}
