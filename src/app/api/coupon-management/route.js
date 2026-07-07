import { handleGETWithMap, handlePATCH } from "@/lib/apiHandler";
import { NextResponse } from "next/server";

const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

function mapCoupon(c) {
  return {
    ...c,
    type: c.discountType,
    discount_value: c.discountValue,
    min_order_amount: c.minOrderValue,
    max_discount_amount: c.maxDiscount,
    usage_limit: c.maxUses,
    start_date: c.startsAt,
    end_date: c.expiresAt,
    is_active: c.isActive,
  };
}

function toCouponBody(body) {
  return {
    code: body.code,
    discountType: body.type === "percentage" ? "percent" : (body.type || body.discountType || "percent"),
    discountValue: body.discount_value ?? body.discountValue,
    minOrderValue: body.min_order_amount ?? body.minOrderValue,
    maxDiscount: body.max_discount_amount ?? body.maxDiscount,
    maxUses: body.usage_limit ?? body.maxUses,
    maxUsesPerUser: body.usage_limit_per_user ?? body.maxUsesPerUser,
    startsAt: body.start_date ?? body.startsAt,
    expiresAt: body.end_date ?? body.expiresAt,
    isActive: body.is_active ?? body.isActive ?? true,
  };
}

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  return handleGETWithMap("/api/v1/coupons", { Authorization: authHeader }, mapCoupon);
}

export async function POST(req) {
  const authHeader = req.headers.get("authorization");
  try {
    const body = await req.json();
    const res = await fetch(`${NEST}/api/v1/coupons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": TENANT,
        Authorization: authHeader,
      },
      body: JSON.stringify(toCouponBody(body)),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
