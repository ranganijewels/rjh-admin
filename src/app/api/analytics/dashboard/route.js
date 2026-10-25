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

/**
 * One attempt against the analytics endpoint, with the body parsed.
 *
 * The upstream occasionally refuses the connection and then never answers,
 * and Node gives up after ten seconds — `fetch` throws, which is what turned
 * into a red "could not load" banner on an otherwise healthy dashboard. A
 * bounded retry turns that one bad connection into a normal page load.
 * Only transport and parse failures retry; a 401 comes straight back.
 */
async function fetchDashboard(headers) {
  const url = `${NEST}/api/v1/analytics/dashboard`;
  let lastError;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      });
      const json = await res.json();
      return { ok: res.ok, status: res.status, json };
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError;
}

export async function GET(req) {
  const auth = req.headers.get("authorization");

  let result;
  try {
    result = await fetchDashboard({
      "Content-Type": "application/json",
      "x-tenant-id": TENANT,
      ...(auth && { Authorization: auth }),
    });
  } catch (e) {
    // The upstream never answered at all — a timeout, a reset, DNS.
    return Response.json(
      { error: `Dashboard service unreachable: ${e.message}` },
      { status: 502 }
    );
  }

  if (!result.ok) {
    // A bare status code tells the page nothing about what went wrong.
    return Response.json(
      {
        error:
          result.json?.message ||
          result.json?.error ||
          `Dashboard service returned ${result.status}`,
      },
      { status: result.status }
    );
  }

  // NestJS wraps payload as { success, data }
  return Response.json(mapProductNames(result.json?.data ?? result.json), {
    status: 200,
  });
}
