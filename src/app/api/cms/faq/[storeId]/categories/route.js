import { handleGET, handlePOST } from "@/lib/apiHandler";

// FAQ categories stored as master values under category "faq_category"
export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  return handleGET("/api/v1/masters/values?category=faq_category", { Authorization: authHeader });
}

export async function POST(req) {
  const authHeader = req.headers.get("authorization");
  const body = await req.json();
  const payload = { category: "faq_category", value: body.name || body.value, label: body.name || body.label };
  const fakeReq = new Request("http://localhost", {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization: authHeader || "" },
    body: JSON.stringify(payload),
  });
  return handlePOST(fakeReq, "/api/v1/masters/values", { Authorization: authHeader });
}
