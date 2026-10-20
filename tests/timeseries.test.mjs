import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  buildBuckets,
  buildTimeSeries,
  bucketKey,
  changePct,
  normaliseOrder,
  TIME_RANGES,
} from "@/lib/timeseries";

const NOW = "2026-10-20T12:00:00.000Z";

const order = (createdAt, amount, customer) => ({
  created_at: createdAt,
  totalAmount: amount,
  customerName: customer,
});

describe("bucketKey", () => {
  test("buckets by day, week, month and year", () => {
    const date = "2026-10-20T12:00:00.000Z";
    assert.equal(bucketKey(date, "day"), "2026-10-20");
    assert.equal(bucketKey(date, "month"), "2026-10");
    assert.equal(bucketKey(date, "year"), "2026");
    // 2026-10-20 is a Tuesday, so its week starts on Monday the 19th.
    assert.equal(bucketKey(date, "week"), "2026-10-19");
  });

  test("returns null for a date it cannot read", () => {
    assert.equal(bucketKey("nonsense", "day"), null);
  });
});

describe("buildBuckets", () => {
  test("returns the buckets oldest first, with no gaps", () => {
    const buckets = buildBuckets("day", NOW);
    assert.equal(buckets.length, 30);
    assert.equal(buckets[0].key, "2026-09-21");
    assert.equal(buckets[buckets.length - 1].key, "2026-10-20");
  });

  test("a month has twelve buckets and a year five", () => {
    assert.equal(buildBuckets("month", NOW).length, 12);
    assert.equal(buildBuckets("year", NOW).length, 5);
    assert.equal(buildBuckets("week", NOW).length, 12);
  });
});

describe("normaliseOrder", () => {
  test("reads the fields whatever they are called", () => {
    const a = normaliseOrder({ createdAt: "2026-10-01", totalAmount: 100 });
    const b = normaliseOrder({ created_at: "2026-10-01", subtotal: 100 });
    assert.equal(a.revenue, 100);
    assert.equal(b.revenue, 100);
    assert.equal(a.date.toISOString(), "2026-10-01T00:00:00.000Z");
  });

  test("an order with no date is dropped", () => {
    assert.equal(normaliseOrder({}).date, null);
  });
});

describe("buildTimeSeries", () => {
  test("buckets the revenue and the order count", () => {
    const { series } = buildTimeSeries(
      [
        order("2026-10-19T10:00:00Z", 100, "a"),
        order("2026-10-20T10:00:00Z", 250, "b"),
        order("2026-10-20T12:00:00Z", 50, "c"),
      ],
      "day",
      NOW
    );

    const last = series[series.length - 1];
    assert.equal(last.revenue, 300);
    assert.equal(last.orders, 2);
    assert.equal(last.aov, 150);
    assert.equal(last.customers, 2);
  });

  test("counts a customer as new in the period of their first order", () => {
    const { series } = buildTimeSeries(
      [
        order("2026-10-01T10:00:00Z", 100, "a"),
        order("2026-10-20T10:00:00Z", 100, "a"),
        order("2026-10-20T11:00:00Z", 100, "b"),
      ],
      "day",
      NOW
    );

    const first = series.find((bucket) => bucket.key === "2026-10-01");
    const last = series[series.length - 1];
    assert.equal(first.newCustomers, 1);
    assert.equal(last.newCustomers, 1);
    // "a" bought in both, so the last bucket has one new and one returning.
    assert.equal(last.customers, 2);
  });

  test("returns the totals for the period", () => {
    const { totals } = buildTimeSeries(
      [
        order("2026-10-19T10:00:00Z", 100, "a"),
        order("2026-10-20T10:00:00Z", 300, "b"),
      ],
      "day",
      NOW
    );
    assert.equal(totals.revenue, 400);
    assert.equal(totals.orders, 2);
    assert.equal(totals.aov, 200);
  });

  test("ignores orders outside the period", () => {
    const { series } = buildTimeSeries(
      [order("2020-01-01T10:00:00Z", 999, "a")],
      "day",
      NOW
    );
    assert.equal(series[series.length - 1].revenue, 0);
  });

  test("an empty order list gives empty buckets, not a crash", () => {
    const { series, totals } = buildTimeSeries([], "month", NOW);
    assert.equal(series.length, 12);
    assert.equal(totals.revenue, 0);
  });
});

describe("changePct", () => {
  test("is the change against the previous bucket", () => {
    const pct = changePct([{ revenue: 100 }, { revenue: 150 }], "revenue");
    assert.equal(pct, 50);
  });

  test("is null when there is nothing to compare against", () => {
    assert.equal(changePct([{ revenue: 100 }], "revenue"), null);
    assert.equal(changePct([{ revenue: 0 }, { revenue: 100 }], "revenue"), null);
  });
});

describe("TIME_RANGES", () => {
  test("offers day, week, month and year", () => {
    assert.deepEqual(
      TIME_RANGES.map((range) => range.key),
      ["day", "week", "month", "year"]
    );
  });
});
