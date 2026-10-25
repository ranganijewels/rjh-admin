"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  ShoppingBag,
  Users,
  Package,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  UserPlus,
  Boxes,
  Download,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/common/ui/cards/card";
import { StatusBadge } from "@/components/common/ui/badge";
import { Button } from "@/components/common/ui/button";
import { KpiCard } from "@/components/common/ui/kpi-card";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/common/ui/toggle-group";
import { TIME_RANGES } from "@/lib/timeseries";
import { getAuthToken } from "@/lib/auth-token";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Page, PageHeader } from "@/components/common/ui/page";
import { SafeImage } from "@/components/common/ui/safe-image";
import { DashboardPageSkeleton } from "@/components/common/ui/skeletons/page-skeleton";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const fmtMoney = (n) =>
  "$" + Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

const fmtMoney2 = (n) =>
  "$" +
  Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtNum = (n) => Number(n || 0).toLocaleString("en-US");

// Status colours mirror the badge tokens (warning / info / success /
// destructive) so the chart and the status pills in the table agree.
const STATUS_COLORS = {
  pending: "#d97706",
  "order placed": "#d97706",
  confirmed: "#2563eb",
  processing: "#d97706",
  "in production": "#d97706",
  picking: "#d97706",
  packing: "#d97706",
  shipped: "#16a34a",
  shipping: "#16a34a",
  delivered: "#16a34a",
  completed: "#16a34a",
  cancelled: "#dc2626",
  canceled: "#dc2626",
  refunded: "#dc2626",
  returned: "#dc2626",
};

const statusColor = (status) =>
  STATUS_COLORS[String(status || "").toLowerCase()] || "#64748b";

// Charts can't use Tailwind classes, so read the same CSS variables the rest
// of the UI uses and re-read them whenever the `.dark` class flips. This keeps
// the dashboard on the shared token palette instead of hardcoded hex values.
function useChartTokens() {
  const [tokens, setTokens] = useState({
    series: "#111827",
    info: "#2563eb",
    success: "#16a34a",
    grid: "#e5e7eb",
    label: "#64748b",
    surface: "#ffffff",
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const read = () => {
      const styles = getComputedStyle(document.documentElement);
      const value = (name, fallback) =>
        styles.getPropertyValue(name).trim() || fallback;
      setTokens({
        series: value("--primary", "#111827"),
        info: value("--info", "#2563eb"),
        success: value("--success", "#16a34a"),
        grid: value("--border", "#e5e7eb"),
        label: value("--muted-foreground", "#64748b"),
        surface: value("--card", "#ffffff"),
      });
    };

    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return tokens;
}

const Overview = () => {
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const tokens = useChartTokens();

  // The analytics endpoint only exposes a twelve month trend, so the day,
  // week and year views come from the order list, bucketed in the admin.
  const [range, setRange] = useState("month");
  const [series, setSeries] = useState({ series: [], totals: null, truncated: false });
  const [seriesLoading, setSeriesLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const token = getAuthToken();
        const res = await fetch("/api/analytics/dashboard", {
          cache: "no-store",
          headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        });
        if (!res.ok) {
          // Prefer the reason the route gives us — a bare status code hides
          // whether the upstream was slow, refused us, or is simply down.
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || `Request failed (${res.status})`);
        }
        const json = await res.json();
        if (alive) setD(json);
      } catch (e) {
        if (alive) setErr(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // The time series is fetched per period. A failure is not fatal — the
  // dashboard falls back to the twelve month trend the analytics endpoint
  // always provides.
  useEffect(() => {
    let alive = true;
    setSeriesLoading(true);
    (async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(
          `/api/analytics/timeseries?range=${range}`,
          {
            cache: "no-store",
            headers: { ...(token && { Authorization: `Bearer ${token}` }) },
          }
        );
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const json = await res.json();
        if (alive) {
          setSeries({
            series: json?.series || [],
            totals: json?.totals || null,
            truncated: !!json?.truncated,
          });
        }
      } catch {
        if (alive) setSeries({ series: [], totals: null, truncated: false });
      } finally {
        if (alive) setSeriesLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [range]);

  const revenue = d?.revenue || {};
  const orders = d?.orders || {};
  const trend = d?.salesTrend || [];
  const topProducts = d?.topProducts || [];
  const recentOrders = d?.recentOrders || [];
  const statusBreakdown = d?.statusBreakdown || [];
  const products = d?.products || {};
  const customers = d?.customers || {};

  const maxProductRevenue = useMemo(
    () => Math.max(...topProducts.map((p) => Number(p.revenue) || 0), 1),
    [topProducts]
  );

  // ─── Revenue by product ───────────────────────────────────────────────
  const productRevenue = useMemo(
    () =>
      topProducts
        .map((product) => ({
          name: product.name || product.code || "Product",
          revenue: Number(product.revenue) || 0,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8),
    [topProducts]
  );


  const totalProducts = Number(products.total) || 0;
  const liveProducts = Number(products.live) || 0;
  const notLiveProducts = Math.max(totalProducts - liveProducts, 0);
  const livePct = totalProducts
    ? Math.round((liveProducts / totalProducts) * 100)
    : 0;

  const statusTotal = useMemo(
    () => statusBreakdown.reduce((sum, s) => sum + (Number(s.count) || 0), 0),
    [statusBreakdown]
  );

  // ─── The period series ───────────────────────────────────────────────
  // The order-derived series is preferred; when it is not available the
  // twelve month trend from the analytics endpoint stands in, so the
  // dashboard never shows an empty chart.
  const seriesRows = series.series.length
    ? series.series
    : trend.map((t) => ({
        key: t.key,
        label: t.month,
        revenue: Number(t.revenue) || 0,
        orders: Number(t.orders) || 0,
        aov: Number(t.revenue) > 0 && Number(t.orders) > 0
          ? Number(t.revenue) / Number(t.orders)
          : 0,
        customers: 0,
        newCustomers: 0,
      }));

  const usingFallbackSeries = !series.series.length && trend.length > 0;

  const hasSeriesData = seriesRows.some(
    (row) => row.revenue > 0 || row.orders > 0
  );

  const rangeLabel =
    TIME_RANGES.find((item) => item.key === range)?.label || "Month";

  const periodTotals = useMemo(
    () =>
      series.totals || {
        revenue: seriesRows.reduce((sum, row) => sum + row.revenue, 0),
        orders: seriesRows.reduce((sum, row) => sum + row.orders, 0),
        aov: 0,
        customers: 0,
      },
    [series.totals, seriesRows]
  );

  const kpis = useMemo(
    () => [
      {
        label: "Total revenue",
        value: fmtMoney(revenue.total),
        icon: DollarSign,
        // A zero growth reading only makes sense when there is a previous
        // month to compare against — otherwise it would read as "no change".
        sub:
          revenue.lastMonth > 0
            ? "vs last month"
            : "no prior month to compare",
        trend: revenue.lastMonth > 0 ? revenue.growthPct : null,
        chart: seriesRows.map((row) => row.revenue),
        chartVariant: "area",
      },
      {
        label: "Total orders",
        value: fmtNum(orders.total),
        icon: ShoppingBag,
        sub: `${fmtNum(orders.today)} today`,
        chart: seriesRows.map((row) => row.orders),
        chartVariant: "bar",
      },
      {
        label: "Avg. order value",
        value: fmtMoney(d?.aov),
        icon: ArrowUpRight,
        sub: "per order",
        chart: seriesRows.map((row) => row.aov),
        chartVariant: "area",
        chartTone: "info",
      },
      {
        label: "Customers",
        value: fmtNum(customers.total),
        icon: Users,
        sub: `+${fmtNum(customers.newThisMonth)} this month`,
        // New accounts per period — the one customer number that has a
        // history worth plotting.
        chart: seriesRows.map((row) => row.newCustomers),
        chartVariant: "bar",
        chartTone: "success",
      },
      {
        label: "Live products",
        value: fmtNum(liveProducts),
        icon: Package,
        sub: `of ${fmtNum(totalProducts)} in catalogue`,
        // A share of the catalogue rather than a trend, so it gets a
        // progress bar instead of a chart.
        progress: { value: liveProducts, max: totalProducts },
        progressLabel: "Live products of the catalogue",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      d,
      revenue,
      orders,
      customers,
      products,
      seriesRows,
      liveProducts,
      totalProducts,
    ]
  );

  // A month of zeros still renders a (flat) chart, which reads as broken —
  // treat "no movement at all" as no data.
  const hasTrendData = trend.some(
    (t) => (Number(t.revenue) || 0) > 0 || (Number(t.orders) || 0) > 0
  );

  // The change against the previous bucket, for the trend badges.
  const revenueChange = useMemo(() => {
    if (seriesRows.length < 2) return null;
    const last = seriesRows[seriesRows.length - 1];
    const previous = seriesRows[seriesRows.length - 2];
    if (!previous.revenue) return null;
    return ((last.revenue - previous.revenue) / previous.revenue) * 100;
  }, [seriesRows]);

  // The dashboard is a read-only summary, so the export is the same numbers
  // the cards show — nothing is recomputed from a different source.
  const handleExport = useCallback(() => {
    const csvCell = (value) => {
      const text = String(value ?? "");
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };

    const rows = [
      ["Metric", "Value"],
      ["Total revenue", revenue.total],
      ["Revenue this month", revenue.thisMonth],
      ["Revenue last month", revenue.lastMonth],
      ["Revenue growth %", revenue.growthPct],
      ["Total orders", orders.total],
      ["Orders today", orders.today],
      ["Orders pending", orders.pending],
      ["Orders in production", orders.processing],
      ["Average order value", d?.aov],
      ["Customers", customers.total],
      ["New customers this month", customers.newThisMonth],
      ["Products total", totalProducts],
      ["Products live", liveProducts],
      [],
      ["Month", "Revenue", "Orders"],
      ...trend.map((t) => [t.month, t.revenue, t.orders]),
      [],
      ["Order status", "Count"],
      ...statusBreakdown.map((s) => [s.status, s.count]),
      [],
      ["Top product", "Orders", "Revenue"],
      ...topProducts.map((p) => [p.name, p.orders, p.revenue]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => csvCell(cell)).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dashboard-summary-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success("Dashboard summary exported");
  }, [
    revenue,
    orders,
    d,
    customers,
    totalProducts,
    liveProducts,
    trend,
    statusBreakdown,
    topProducts,
  ]);

  if (loading) return <DashboardPageSkeleton />;

  if (err || !d) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
      >
        Could not load dashboard data{err ? `: ${err}` : ""}.
      </div>
    );
  }

  // --- charts ---------------------------------------------------------------

  const periodTrendOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "inherit" },
    plotOptions: {
      bar: { borderRadius: 6, columnWidth: "45%", borderRadiusApplication: "end" },
    },
    colors: [tokens.series, tokens.info],
    series: [
      {
        name: "Revenue",
        type: "column",
        data: seriesRows.map((row) => Number(row.revenue) || 0),
      },
      {
        name: "Orders",
        type: "line",
        data: seriesRows.map((row) => Number(row.orders) || 0),
      },
    ],
    stroke: { width: [0, 3], curve: "smooth" },
    dataLabels: { enabled: false },
    grid: { borderColor: tokens.grid, strokeDashArray: 4 },
    xaxis: {
      categories: seriesRows.map((row) => row.label),
      labels: { style: { colors: tokens.label, fontSize: "12px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: [
      {
        labels: {
          style: { colors: tokens.label, fontSize: "12px" },
          formatter: (v) => (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${Math.round(v)}`),
        },
      },
      {
        opposite: true,
        labels: {
          style: { colors: tokens.label, fontSize: "12px" },
          formatter: (v) => Math.round(v),
        },
      },
    ],
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: { colors: tokens.label },
      markers: { size: 5 },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (v) => fmtMoney(v) },
    },
  };

  const statusOptions = {
    chart: { type: "donut", fontFamily: "inherit" },
    labels: statusBreakdown.map((s) => s.status),
    series: statusBreakdown.map((s) => Number(s.count) || 0),
    colors: statusBreakdown.map((s) => statusColor(s.status)),
    stroke: { width: 2, colors: [tokens.surface] },
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            name: { show: true, offsetY: 18, color: tokens.label, fontSize: "12px" },
            value: {
              show: true,
              offsetY: -12,
              color: tokens.series,
              fontSize: "20px",
              fontWeight: 600,
              formatter: (v) => fmtNum(v),
            },
            total: {
              show: true,
              label: "Total orders",
              color: tokens.label,
              fontSize: "12px",
              formatter: () => fmtNum(statusTotal),
            },
          },
        },
      },
    },
    tooltip: { y: { formatter: (v) => `${v} orders` } },
  };

  // ─── New vs returning customers ───────────────────────────────────────
  const customerOptions = {
    chart: { type: "bar", stacked: true, toolbar: { show: false }, fontFamily: "inherit" },
    plotOptions: { bar: { borderRadius: 4, columnWidth: "55%" } },
    colors: [tokens.success, tokens.info],
    series: [
      {
        name: "New customers",
        data: seriesRows.map((row) => Number(row.newCustomers) || 0),
      },
      {
        name: "Returning",
        data: seriesRows.map(
          (row) => Math.max(0, Number(row.customers) - Number(row.newCustomers)) || 0
        ),
      },
    ],
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    grid: { borderColor: tokens.grid, strokeDashArray: 4, xaxis: { lines: { show: false } } },
    xaxis: {
      categories: seriesRows.map((row) => row.label),
      labels: {
        style: { colors: tokens.label, fontSize: "10px" },
        hideOverlappingLabels: true,
        rotate: 0,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: tokens.label, fontSize: "11px" },
        formatter: (v) => Math.round(v),
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: { colors: tokens.label },
      markers: { size: 5 },
    },
    tooltip: { shared: true, intersect: false, y: { formatter: (v) => fmtNum(v) } },
  };

  // ─── Average order value ──────────────────────────────────────────────
  const aovOptions = {
    chart: { type: "area", toolbar: { show: false }, fontFamily: "inherit" },
    colors: [tokens.info],
    series: [
      {
        name: "Average order value",
        data: seriesRows.map((row) => Number(row.aov) || 0),
      },
    ],
    stroke: { width: [0, 3], curve: "smooth" },
    fill: { type: "gradient", gradient: { opacityFrom: 0.28, opacityTo: 0.02 } },
    dataLabels: { enabled: false },
    grid: { borderColor: tokens.grid, strokeDashArray: 4 },
    xaxis: {
      categories: seriesRows.map((row) => row.label),
      labels: { style: { colors: tokens.label, fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: tokens.label, fontSize: "11px" },
        formatter: (v) => (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${Math.round(v)}`),
      },
    },
    tooltip: { y: { formatter: (v) => fmtMoney2(v) } },
  };

  const productRevenueOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "inherit" },
    plotOptions: { bar: { borderRadius: 4, horizontal: true, barHeight: "55%" } },
    colors: [tokens.series],
    series: [
      {
        name: "Revenue",
        data: productRevenue.map((product) => product.revenue),
      },
    ],
    // On a horizontal bar the categories sit on the y axis and the values on
    // the x axis — and the value is written into the label, so a short bar
    // still shows what it is worth.
    dataLabels: { enabled: false },
    grid: { borderColor: tokens.grid, strokeDashArray: 4, yaxis: { lines: { show: false } } },
    yaxis: {
      categories: productRevenue.map((product) =>
        product.name.length > 26 ? `${product.name.slice(0, 25)}…` : product.name
      ),
      labels: {
        style: { colors: tokens.label, fontSize: "11px" },
        maxWidth: 260,
      },
    },
    xaxis: {
      categories: productRevenue.map((product) => product.name),
      labels: {
        style: { colors: tokens.label, fontSize: "11px" },
        formatter: (v) => (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${Math.round(v)}`),
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    tooltip: { y: { formatter: (v) => fmtMoney2(v) } },
    legend: { show: false },
  };

  return (
    <Page>
      <PageHeader
        title={`Welcome back${user?.name ? `, ${user.name}` : ""}`}
        description="Here's what's happening across your store today."
        actions={
          <Button variant="outline" size="md" onClick={handleExport}>
            <Download className="size-4" />
            Export summary
          </Button>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            sub={kpi.sub}
            trend={kpi.trend}
            chart={kpi.chart}
            chartVariant={kpi.chartVariant}
            chartTone={kpi.chartTone}
            progress={kpi.progress}
            progressLabel={kpi.progressLabel}
          />
        ))}
      </div>

      {/* Sales trend + order status */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="gap-3 py-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Sales &amp; orders trend
              </h2>
              <p className="text-xs text-muted-foreground">
                Revenue and order volume by {rangeLabel.toLowerCase()}
                {usingFallbackSeries ? " (last 12 months)" : ""}
              </p>
            </div>

            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={range}
              onValueChange={(value) => value && setRange(value)}
              aria-label="Chart period"
              className="shrink-0"
            >
              {TIME_RANGES.map((item) => (
                <ToggleGroupItem
                  key={item.key}
                  value={item.key}
                  aria-label={`${item.label} view`}
                  title={`${item.label} view`}
                  className="px-2.5 text-xs"
                >
                  {item.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </CardHeader>
          <CardContent>
            {seriesLoading && !hasSeriesData ? (
              <div className="flex h-64 items-center justify-center">
                <Skeleton className="h-56 w-full" />
              </div>
            ) : hasSeriesData ? (
              <>
                <ApexChart
                  options={periodTrendOptions}
                  series={periodTrendOptions.series}
                  type="bar"
                  height={300}
                />
                {series.truncated && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Based on the most recent{" "}
                    {fmtNum(series.truncated ? 1000 : 0)} orders.
                  </p>
                )}
              </>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center gap-1 text-center">
                <p className="text-sm font-medium text-foreground">
                  No sales in this period
                </p>
                <p className="text-xs text-muted-foreground">
                  The chart fills in as soon as the first order is placed.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Order status
              </h2>
              <p className="text-xs text-muted-foreground">
                How the {fmtNum(statusTotal)} orders are distributed
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusBreakdown.length ? (
              <>
                <ApexChart
                  options={statusOptions}
                  series={statusOptions.series}
                  type="donut"
                  height={196}
                />
                <ul className="space-y-2">
                  {statusBreakdown.map((s) => (
                    <li
                      key={s.status}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: statusColor(s.status) }}
                          aria-hidden="true"
                        />
                        <span className="truncate text-muted-foreground">
                          {s.status}
                        </span>
                      </span>
                      <span className="shrink-0 font-medium tabular-nums text-foreground">
                        {fmtNum(s.count)}
                        <span className="ms-1.5 text-xs font-normal text-muted-foreground">
                          {statusTotal
                            ? `${Math.round((s.count / statusTotal) * 100)}%`
                            : "0%"}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                No orders yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customers + revenue by product */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        <Card>
          <CardHeader className="gap-3 py-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Customers
              </h2>
              <p className="text-xs text-muted-foreground">
                New and returning accounts by {rangeLabel.toLowerCase()}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[22px] font-semibold leading-none text-foreground">
                  {fmtNum(customers.newThisMonth)}
                </p>
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <UserPlus className="size-3.5" aria-hidden="true" />
                  new this month
                </p>
              </div>
              <div className="text-end">
                <p className="text-[22px] font-semibold leading-none text-foreground">
                  {fmtNum(customers.total)}
                </p>
                <p className="mt-1.5 flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                  <Users className="size-3.5" aria-hidden="true" />
                  total accounts
                </p>
              </div>
            </div>

            {hasSeriesData && seriesRows.some((row) => row.customers > 0) ? (
              <ApexChart
                options={customerOptions}
                series={customerOptions.series}
                type="bar"
                height={220}
              />
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-1 text-center">
                <p className="text-sm font-medium text-foreground">
                  No customer history yet
                </p>
                <p className="text-xs text-muted-foreground">
                  New and returning accounts are counted from the orders.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="gap-3 py-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Revenue by product
              </h2>
              <p className="text-xs text-muted-foreground">
                Where the money comes from
              </p>
            </div>
            <Link
              href="/dashboard/product-management/my-products"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View products
            </Link>
          </CardHeader>
          <CardContent>
            {productRevenue.length ? (
              <ApexChart
                options={productRevenueOptions}
                series={productRevenueOptions.series}
                type="bar"
                height={280}
              />
            ) : (
              <div className="flex h-56 flex-col items-center justify-center gap-1 text-center">
                <p className="text-sm font-medium text-foreground">
                  No sales yet
                </p>
                <p className="text-xs text-muted-foreground">
                  The chart fills in as soon as the first order is placed.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent orders + top products */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="py-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Recent orders
              </h2>
              <p className="text-xs text-muted-foreground">
                The latest orders placed on the storefront
              </p>
            </div>
            <Link
              href="/dashboard/order-management/all"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th scope="col" className="px-5 py-2.5 font-medium">
                      Order
                    </th>
                    <th scope="col" className="px-5 py-2.5 font-medium">
                      Customer
                    </th>
                    <th scope="col" className="px-5 py-2.5 font-medium">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-2.5 font-medium">
                      Payment
                    </th>
                    <th scope="col" className="px-5 py-2.5 text-right font-medium">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length ? (
                    recentOrders.map((o) => (
                      <tr
                        key={o.id}
                        className="border-b border-border/60 last:border-0 hover:bg-muted/40"
                      >
                        <td className="whitespace-nowrap px-5 py-2.5">
                          <Link
                            href="/dashboard/order-management/all"
                            className="font-medium text-foreground hover:underline"
                          >
                            {o.orderNumber || String(o.id || "").slice(0, 8)}
                          </Link>
                          {o.date && (
                            <div className="text-xs text-muted-foreground">
                              {new Date(o.date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          )}
                        </td>
                        <td className="max-w-[160px] truncate px-5 py-2.5 text-muted-foreground">
                          {o.customer || "—"}
                        </td>
                        <td className="px-5 py-2.5">
                          <StatusBadge status={o.status} />
                        </td>
                        <td className="px-5 py-2.5">
                          <StatusBadge status={o.paymentStatus} />
                        </td>
                        <td className="whitespace-nowrap px-5 py-2.5 text-right font-semibold text-foreground">
                          {fmtMoney2(o.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-8 text-center text-sm text-muted-foreground"
                      >
                        No recent orders
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Top products
              </h2>
              <p className="text-xs text-muted-foreground">
                Best sellers by revenue
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.length ? (
              topProducts.map((p, i) => {
                const revenueValue = Number(p.revenue) || 0;
                const pct = Math.max(
                  Math.round((revenueValue / maxProductRevenue) * 100),
                  2
                );
                return (
                  <div key={`${p.code || p.name}-${i}`} className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                      {p.image ? (
                        <SafeImage
                          src={p.image}
                          alt={p.name ? `${p.name} thumbnail` : "Product thumbnail"}
                          width={40}
                          height={40}
                          className="size-full object-cover"
                        />
                      ) : (
                        <Package
                          className="size-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="truncate text-sm font-medium text-foreground"
                          title={p.name}
                        >
                          {p.name}
                        </span>
                        <span className="shrink-0 text-sm font-semibold text-foreground">
                          {fmtMoney(revenueValue)}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {p.orders} order{p.orders === 1 ? "" : "s"}
                      </div>
                      <div
                        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                        role="img"
                        aria-label={`${p.name}: ${fmtMoney(revenueValue)} revenue`}
                      >
                        <span
                          className="block h-full rounded-full bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No sales yet.{" "}
                <Link
                  href="/dashboard/product-management/my-products"
                  className="font-medium text-foreground underline underline-offset-2"
                >
                  Go to Product Management
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inventory + customers */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <Card>
          <CardHeader className="py-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Inventory alerts
              </h2>
              <p className="text-xs text-muted-foreground">
                Catalogue items that are not live on the storefront
              </p>
            </div>
            <Link
              href="/dashboard/product-management/my-products"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View products
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {totalProducts === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No products yet.
              </p>
            ) : (
              <>
                {notLiveProducts > 0 ? (
                  <div className="flex items-start gap-3 rounded-lg border border-warning/20 bg-warning/5 p-3">
                    <AlertTriangle
                      className="mt-0.5 size-4 shrink-0 text-warning"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {fmtNum(notLiveProducts)} product
                        {notLiveProducts === 1 ? "" : "s"} not live
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Draft or unpublished items are hidden from the storefront.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 rounded-lg border border-success/20 bg-success/5 p-3">
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-success"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        All products are live
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Every product is published to the storefront.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Live products</span>
                    <span className="font-medium text-foreground">
                      {fmtNum(liveProducts)} / {fmtNum(totalProducts)}
                    </span>
                  </div>
                  <div
                    className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuenow={livePct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Live products"
                  >
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${livePct}%` }}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-3 py-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Average order value
              </h2>
              <p className="text-xs text-muted-foreground">
                What an order is worth by {rangeLabel.toLowerCase()}
              </p>
            </div>
            <span className="text-xs font-medium text-foreground">
              {fmtMoney(d?.aov)}
            </span>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasSeriesData ? (
              <ApexChart
                options={aovOptions}
                series={aovOptions.series}
                type="area"
                height={200}
              />
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-1 text-center">
                <p className="text-sm font-medium text-foreground">
                  No orders in this period
                </p>
                <p className="text-xs text-muted-foreground">
                  The average order value appears with the first sale.
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-card text-muted-foreground">
                <Boxes className="size-4" aria-hidden="true" />
              </span>
              <p className="text-xs text-muted-foreground">
                {fmtNum(orders.pending)} order
                {orders.pending === 1 ? "" : "s"} waiting for confirmation and{" "}
                {fmtNum(orders.processing)} in production.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
};

export default Overview;
