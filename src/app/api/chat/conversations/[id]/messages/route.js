import { handlePOST } from "@/lib/apiHandler";

// Agent reply to a conversation.
export async function POST(req, { params }) {
  const authHeader = req.headers.get("authorization");
  return handlePOST(req, `/api/v1/chat/conversations/${(await params).id}/messages`, {
    Authorization: authHeader,
  });
}
