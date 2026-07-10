import { handleGET } from "@/lib/apiHandler";

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  return handleGET(
    `/api/v1/storefront/appointments${status ? `?status=${status}` : ""}`,
    { Authorization: authHeader }
  );
}
