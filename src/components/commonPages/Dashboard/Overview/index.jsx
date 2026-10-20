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
import { Skeleton } from "@/components/common/ui/skeleton";
import { Page, PageHeader } from "@/components/common/ui/page";
import { SafeImage } from "@/components/common/ui/safe-image";

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

function DashboardSkeleton() {
  return (
    <div className="space-y-5 lg:space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[124px] rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        <Skeleton className="h-72 rounded-xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </div>
  );
}

const Overview = () => {
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const tokens = useChartTokens();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/analytics/dashboard", { cache: "no-store" });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
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

  const newCustomerPct = customers.total
    ? Math.round(((customers.newThisMonth || 0) / customers.total) * 100)
    : 0;

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
        sparkline: trend.map((t) => Number(t.revenue) || 0),
      },
      {
        label: "Total orders",
        value: fmtNum(orders.total),
        icon: ShoppingBag,
        sub: `${fmtNum(orders.today)} today`,
        sparkline: trend.map((t) => Number(t.orders) || 0),
      },
      {
        label: "Avg. order value",
        value: fmtMoney(d?.aov),
        icon: ArrowUpRight,
        sub: "per order",
      },
      {
        label: "Customers",
        value: fmtNum(customers.total),
        icon: Users,
        sub: `+${fmtNum(customers.newThisMonth)} this month`,
      },
      {
        label: "Live products",
        value: fmtNum(liveProducts),
        icon: Package,
        sub: `of ${fmtNum(totalProducts)} in catalogue`,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [d, revenue, orders, customers, products, trend, liveProducts, totalProducts]
  );

  // A month of zeros still renders a (flat) chart, which reads as broken —
  // treat "no movement at all" as no data.
  const hasTrendData = trend.some(
    (t) => (Number(t.revenue) || 0) > 0 || (Number(t.orders) || 0) > 0
  );

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

  if (loading) return <DashboardSkeleton />;

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

  const trendOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "inherit" },
    plotOptions: {
      bar: { borderRadius: 6, columnWidth: "45%", borderRadiusApplication: "end" },
    },
    colors: [tokens.series, tokens.info],
    series: [
      {
        name: "Revenue",
        type: "column",
        data: trend.map((t) => Number(t.revenue) || 0),
      },
      {
        name: "Orders",
        type: "line",
        data: trend.map((t) => Number(t.orders) || 0),
      },
    ],
    stroke: { width: [0, 3], curve: "smooth" },
    dataLabels: { enabled: false },
    grid: { borderColor: tokens.grid, strokeDashArray: 4 },
    xaxis: {
      categories: trend.map((t) => t.month),
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
            sparkline={kpi.sparkline}
          />
        ))}
      </div>

      {/* Sales trend + order status */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="py-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Sales &amp; orders trend
              </h2>
              <p className="text-xs text-muted-foreground">
                Revenue and order volume over the last 12 months
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {hasTrendData ? (
              <ApexChart
                options={trendOptions}
                series={trendOptions.series}
                type="bar"
                height={300}
              />
            ) : (
              <div className="flex h-64 flex-col items-center justify-center gap-1 text-center">
                <p className="text-sm font-medium text-foreground">
                  No sales in the last 12 months
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
          <CardHeader className="py-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Customer growth
              </h2>
              <p className="text-xs text-muted-foreground">
                New storefront accounts this month
              </p>
            </div>
            <span className="text-xs text-muted-foreground">This month</span>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[28px] font-semibold leading-none text-foreground">
                  {fmtNum(customers.newThisMonth)}
                </p>
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <UserPlus className="size-4" aria-hidden="true" />
                  new this month
                </p>
              </div>
              <div className="text-end">
                <p className="text-[28px] font-semibold leading-none text-foreground">
                  {fmtNum(customers.total)}
                </p>
                <p className="mt-1.5 flex items-center justify-end gap-1.5 text-sm text-muted-foreground">
                  <Users className="size-4" aria-hidden="true" />
                  total customers
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Share of new accounts
                </span>
                <span className="font-medium text-foreground">
                  {newCustomerPct}%
                </span>
              </div>
              <div
                className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={newCustomerPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="New customers this month"
              >
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${newCustomerPct}%` }}
                />
              </div>
            </div>

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
