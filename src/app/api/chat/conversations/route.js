import { handleGET } from "@/lib/apiHandler";

// List chat conversations for the admin inbox.
export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  const status = new URL(req.url).searchParams.get("status") || "";
  return handleGET(
    "/api/v1/chat/conversations",
    { Authorization: authHeader },
    status ? { status } : {},
  );
}
