import { handleGETWithMap } from "@/lib/apiHandler";

function mapOrder(o) {
  return {
    ...o,
    customer_name: o.customerName,
    total_quantity: o.quantity,
    subtotal: o.totalAmount,
    order_status: o.orderStatus,
    payment_status: o.paymentStatus,
    payment_method: o.channel,
    created_at: o.createdAt,
  };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const authHeader = req.headers.get("authorization");
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "20";
  const search = searchParams.get("q") || searchParams.get("search") || "";
  const query = new URLSearchParams({ page, limit });
  if (search) query.append("search", search);
  return handleGETWithMap(`/api/v1/orders?${query}`, { Authorization: authHeader }, mapOrder);
}
