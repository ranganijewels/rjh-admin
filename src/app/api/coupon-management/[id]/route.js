import { handlePATCH, handleDELETE } from "@/lib/apiHandler";

function toCouponBody(body) {
  return {
    code: body.code,
    discountType: body.type === "percentage" ? "percent" : (body.type || body.discountType),
    discountValue: body.discount_value ?? body.discountValue,
    minOrderValue: body.min_order_amount ?? body.minOrderValue,
    maxDiscount: body.max_discount_amount ?? body.maxDiscount,
    maxUses: body.usage_limit ?? body.maxUses,
    startsAt: body.start_date ?? body.startsAt,
    expiresAt: body.end_date ?? body.expiresAt,
    isActive: body.is_active ?? body.isActive,
  };
}

export async function PUT(req, { params }) {
  const authHeader = req.headers.get("authorization");
  const body = await req.json();
  return handlePATCH(`/api/v1/coupons/${(await params).id}`, toCouponBody(body), { Authorization: authHeader });
}

export async function DELETE(req, { params }) {
  const authHeader = req.headers.get("authorization");
  return handleDELETE(`/api/v1/coupons/${(await params).id}`, null, { Authorization: authHeader });
}
