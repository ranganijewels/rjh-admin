import { handleGETWithMap } from "@/lib/apiHandler";

function mapCustomer(c) {
  const parts = (c.customerName || "").trim().split(" ");
  return {
    ...c,
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
}

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "50";
  return handleGETWithMap(`/api/v1/customers?page=${page}&limit=${limit}`, { Authorization: authHeader }, mapCustomer);
}
