import { buildTimeSeries, DEFAULT_RANGE, TIME_RANGES } from "@/lib/timeseries";

const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT =
  process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

// The upstream caps `limit` at 100, so the series is built from pages.
const PAGE_LIMIT = 100;
// Safety ceiling: 1,000 orders, the same ceiling the Orders page uses.
const MAX_PAGES = 10;
// Rebuilding the series on every request would hammer the orders endpoint.
const CACHE_TTL_MS = 60_000;

const cache = new Map();

function cached(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

async function fetchOrders(authHeader) {
  const orders = [];
  let total = Infinity;

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const res = await fetch(
      `${NEST}/api/v1/orders?page=${page}&limit=${PAGE_LIMIT}`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": TENANT,
          ...(authHeader && { Authorization: authHeader }),
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      if (page === 1) throw new Error(`Orders request failed (${res.status})`);
      break;
    }

    const json = await res.json();
    const rows = json?.data ?? json?.rows ?? json?.items ?? [];
    if (!Array.isArray(rows) || rows.length === 0) break;

    orders.push(...rows);

    const reported = Number(json?.meta?.total ?? json?.total);
    if (Number.isFinite(reported)) {
      total = reported;
      if (orders.length >= total) break;
    } else if (rows.length < PAGE_LIMIT) {
      break;
    }
  }

  return { orders, truncated: total > orders.length };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const requested = searchParams.get("range") || DEFAULT_RANGE;
  const range = TIME_RANGES.some((r) => r.key === requested)
    ? requested
    : DEFAULT_RANGE;

  const authHeader = req.headers.get("authorization");
  const cacheKey = `${range}:${authHeader ? "auth" : "anon"}`;

  const hit = cached(cacheKey);
  if (hit) {
    return Response.json(hit, {
      headers: { "Cache-Control": "private, max-age=30" },
    });
  }

  try {
    const { orders, truncated } = await fetchOrders(authHeader);
    const series = buildTimeSeries(orders, range);
    const payload = {
      ...series,
      // Whether the series covers every order — the admin shows this so a
      // truncated history is never mistaken for the whole story.
      truncated,
      loadedOrders: orders.length,
      generatedAt: new Date().toISOString(),
    };

    cache.set(cacheKey, { at: Date.now(), value: payload });

    return Response.json(payload, {
      headers: { "Cache-Control": "private, max-age=30" },
    });
  } catch (e) {
    return Response.json(
      { error: e.message, range, series: [], totals: null },
      { status: 502 }
    );
  }
}
