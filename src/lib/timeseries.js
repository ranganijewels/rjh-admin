/**
 * Bucketing orders into a time series.
 *
 * The analytics endpoint only exposes a twelve month trend, so the day, week
 * and year views are computed here from the order list the admin already
 * loads. Everything in this module is pure, so it can be unit tested without
 * a server.
 */

export const TIME_RANGES = [
  { key: "day", label: "Day", buckets: 30 },
  { key: "week", label: "Week", buckets: 12 },
  { key: "month", label: "Month", buckets: 12 },
  { key: "year", label: "Year", buckets: 5 },
];

export const DEFAULT_RANGE = "month";

const RANGE_BUCKETS = Object.fromEntries(
  TIME_RANGES.map((range) => [range.key, range.buckets])
);

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** The start of the ISO week (Monday) for a date. */
function startOfWeek(date) {
  const d = new Date(date);
  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  d.setUTCDate(d.getUTCDate() - day);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)
  );
}

function startOfYear(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
}

/** The key a date falls into for a range. */
export function bucketKey(date, range) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;

  switch (range) {
    case "day":
      return d.toISOString().slice(0, 10);
    case "week":
      return startOfWeek(d).toISOString().slice(0, 10);
    case "month":
      return d.toISOString().slice(0, 7);
    case "year":
      return d.toISOString().slice(0, 4);
    default:
      return null;
  }
}

function bucketLabel(date, range) {
  const d = new Date(date);
  switch (range) {
    case "day":
      return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
    case "week":
      return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
    case "month":
      return MONTHS[d.getUTCMonth()];
    case "year":
      return String(d.getUTCFullYear());
    default:
      return "";
  }
}

/** The (empty) buckets for a range, oldest first. */
export function buildBuckets(range, now = new Date()) {
  const count = RANGE_BUCKETS[range] || RANGE_BUCKETS.month;
  const end = new Date(now);
  const buckets = [];

  for (let i = count - 1; i >= 0; i -= 1) {
    let start;
    if (range === "day") {
      start = new Date(end);
      start.setUTCDate(start.getUTCDate() - i);
    } else if (range === "week") {
      start = startOfWeek(end);
      start.setUTCDate(start.getUTCDate() - i * 7);
    } else if (range === "month") {
      start = startOfMonth(end);
      start.setUTCMonth(start.getUTCMonth() - i);
    } else {
      start = startOfYear(end);
      start.setUTCFullYear(start.getUTCFullYear() - i);
    }

    buckets.push({
      key: bucketKey(start, range),
      label: bucketLabel(start, range),
      start: start.toISOString(),
    });
  }

  return buckets;
}

/** Pull the fields we need out of an order, whatever it is called. */
export function normaliseOrder(order = {}) {
  const rawDate =
    order.created_at ?? order.createdAt ?? order.date ?? order.placed_at;
  const date = rawDate ? new Date(rawDate) : null;

  const rawAmount =
    order.subtotal ?? order.totalAmount ?? order.total_amount ?? order.amount;
  const revenue = Number(rawAmount) || 0;

  const customer =
    order.customer_id ??
    order.customerId ??
    order.customer_email ??
    order.customerEmail ??
    order.customer_name ??
    order.customerName ??
    null;

  return {
    date: date && !Number.isNaN(date.getTime()) ? date : null,
    revenue,
    customer: customer ? String(customer) : null,
  };
}

/**
 * Build a revenue / orders / customers series for a range.
 *
 * Every bucket carries the revenue and the number of orders in it, the
 * average order value, the distinct customers who bought in it and how many
 * of them were buying for the first time.
 */
export function buildTimeSeries(orders, range = DEFAULT_RANGE, now = new Date()) {
  const rows = (orders || [])
    .map(normaliseOrder)
    .filter((order) => order.date);

  const buckets = buildBuckets(range, now);
  const index = new Map(buckets.map((bucket, i) => [bucket.key, i]));

  const series = buckets.map((bucket) => ({
    ...bucket,
    revenue: 0,
    orders: 0,
    aov: 0,
    customers: 0,
    newCustomers: 0,
  }));

  const customersPerBucket = buckets.map(() => new Set());

  // The first order each customer ever placed — that is what makes them new.
  const firstSeen = new Map();
  for (const order of rows) {
    if (!order.customer) continue;
    const previous = firstSeen.get(order.customer);
    if (!previous || order.date < previous) {
      firstSeen.set(order.customer, order.date);
    }
  }

  for (const order of rows) {
    const i = index.get(bucketKey(order.date, range));
    if (i === undefined) continue;

    series[i].revenue += order.revenue;
    series[i].orders += 1;
    if (order.customer) customersPerBucket[i].add(order.customer);
  }

  const newPerBucket = new Map();
  for (const [, date] of firstSeen) {
    const key = bucketKey(date, range);
    if (!index.has(key)) continue;
    newPerBucket.set(key, (newPerBucket.get(key) || 0) + 1);
  }

  series.forEach((bucket, i) => {
    bucket.customers = customersPerBucket[i].size;
    bucket.newCustomers = newPerBucket.get(bucket.key) || 0;
    bucket.aov = bucket.orders ? bucket.revenue / bucket.orders : 0;
  });

  const totals = series.reduce(
    (acc, bucket) => ({
      revenue: acc.revenue + bucket.revenue,
      orders: acc.orders + bucket.orders,
      customers: acc.customers + bucket.newCustomers,
    }),
    { revenue: 0, orders: 0, customers: 0 }
  );
  totals.aov = totals.orders ? totals.revenue / totals.orders : 0;

  return { range, series, totals };
}

/**
 * The change between the last two buckets, as a percentage.
 * Returns null when there is nothing to compare against.
 */
export function changePct(series = [], valueKey = "revenue") {
  if (series.length < 2) return null;
  const last = Number(series[series.length - 1]?.[valueKey]) || 0;
  const previous = Number(series[series.length - 2]?.[valueKey]) || 0;
  if (!previous) return null;
  return ((last - previous) / previous) * 100;
}
