import { handleGET, handlePATCH } from "@/lib/apiHandler";

// Fetch a conversation with its messages (admin). `after` returns only newer.
export async function GET(req, { params }) {
  const authHeader = req.headers.get("authorization");
  const after = new URL(req.url).searchParams.get("after") || "";
  return handleGET(
    `/api/v1/chat/conversations/${(await params).id}`,
    { Authorization: authHeader },
    after ? { after } : {},
  );
}

// Open / close a conversation.
export async function PATCH(req, { params }) {
  const authHeader = req.headers.get("authorization");
  const body = await req.json().catch(() => ({}));
  return handlePATCH(`/api/v1/chat/conversations/${(await params).id}`, body, {
    Authorization: authHeader,
  });
}
