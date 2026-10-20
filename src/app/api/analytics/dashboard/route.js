import { resolveProductTokens } from "@/lib/product-tokens";

const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

/**
 * A product name can be a template — "{{karat}} {{metal_color}} Gold Round
 * Diamond Elegant Ring" — that the storefront resolves for the variant the
 * shopper picked. The analytics payload carries no variant, so the tokens
 * are dropped: the catalogue-level name is the one without them, which
 * beats showing the raw braces. The order sheet still shows the resolved
 * name, because an order line does carry the variant.
 */
function mapProductNames(payload) {
  if (!payload || typeof payload !== "object") return payload;

  return {
    ...payload,
    topProducts: Array.isArray(payload.topProducts)
      ? payload.topProducts.map((product) => ({
          ...product,
          name: resolveProductTokens(product?.name),
        }))
      : payload.topProducts,
    recentOrders: Array.isArray(payload.recentOrders)
      ? payload.recentOrders.map((order) => ({
          ...order,
          product: resolveProductTokens(order?.product),
        }))
      : payload.recentOrders,
  };
}

export async function GET(req) {
  const auth = req.headers.get("authorization");
  try {
    const res = await fetch(`${NEST}/api/v1/analytics/dashboard`, {
      headers: {
        "Content-Type": "application/json",
        "x-tenant-id": TENANT,
        ...(auth && { Authorization: auth }),
      },
      cache: "no-store",
    });
    const json = await res.json();
    // NestJS wraps payload as { success, data }
    const data = json?.data ?? json;
    return Response.json(mapProductNames(data), {
      status: res.ok ? 200 : res.status,
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
