import { handleGETWithMap } from "@/lib/apiHandler";
import { mapOrder } from "../route";

export async function GET(req, { params }) {
  const authHeader = req.headers.get("authorization");
  return handleGETWithMap(`/api/v1/orders/${(await params).id}`, { Authorization: authHeader }, mapOrder);
}
