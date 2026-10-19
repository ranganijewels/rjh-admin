"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  Package,
  DollarSign,
  Clock,
  Truck,
  ArrowUpRight,
} from "lucide-react";

import { NAVY, STEEL, STATUS_COLORS_MAP as STATUS_COLORS } from "@/lib/colorTokens";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const fmtMoney = (n) =>
  "$" + Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

const fmtNum = (n) => Number(n || 0).toLocaleString("en-US");

function KpiCard({ label, value, icon: Icon, accent, sub, trend }) {
  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500 dark:text-muted-foreground">{label}</span>
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}14`, color: accent }}
        >
          <Icon className="w-5 h-5" />
        </span>
      </div>
      <div className="text-[28px] leading-none font-semibold text-[#091930] dark:text-foreground">
        {value}
      </div>
      {sub && (
        <div className="flex items-center gap-1.5 text-xs">
          {trend != null && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                trend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
              }`}
            >
              {trend >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {Math.abs(trend)}%
            </span>
          )}
          <span className="text-gray-400 dark:text-muted-foreground">{sub}</span>
        </div>
      )}
    </div>
  );
}

const Overview = () => {
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/analytics/dashboard", { cache: "no-store" });
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

  if (loading) {
    return (
      <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-gray-100 dark:bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (err || !d) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-100 bg-red-50 text-red-600 p-4 text-sm">
          Could not load dashboard data{err ? `: ${err}` : ""}.
        </div>
      </div>
    );
  }

  const revenue = d.revenue || {};
  const orders = d.orders || {};
  const trend = d.salesTrend || [];
  const statusBreakdown = d.statusBreakdown || [];
  const topProducts = d.topProducts || [];
  const recentOrders = d.recentOrders || [];

  // Sales trend area chart
  const trendOptions = {
    chart: { type: "area", toolbar: { show: false }, fontFamily: "inherit" },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    colors: [NAVY],
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 90] },
    },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
    xaxis: {
      categories: trend.map((t) => t.month),
      labels: { style: { colors: "#94a3b8", fontSize: "12px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#94a3b8", fontSize: "12px" },
        formatter: (v) => (v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${Math.round(v)}`),
      },
    },
    tooltip: { y: { formatter: (v) => fmtMoney(v) } },
  };
  const trendSeries = [{ name: "Revenue", data: trend.map((t) => t.revenue) }];

  // Status donut
  const donutLabels = statusBreakdown.map((s) => s.status);
  const donutSeries = statusBreakdown.map((s) => s.count);
  const donutColors = donutLabels.map((l) => STATUS_COLORS[l] || STEEL);
  const donutOptions = {
    chart: { type: "donut", fontFamily: "inherit" },
    labels: donutLabels,
    colors: donutColors,
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { width: 2 },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Orders",
              fontSize: "13px",
              color: "#94a3b8",
              formatter: () => fmtNum(orders.total),
            },
          },
        },
      },
    },
  };

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[28px] font-semibold text-[#091930] dark:text-foreground">
            Command Center
          </h1>
          <p className="text-sm text-gray-700 dark:text-foreground">
            Live performance across the house — updated in real time.
          </p>
        </div>
        <span className="text-xs text-gray-500 dark:text-muted-foreground">
          As of {new Date(d.generatedAt || Date.now()).toLocaleString()}
        </span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Total Revenue"
          value={fmtMoney(revenue.total)}
          icon={DollarSign}
          accent={NAVY}
          sub="vs last month"
          trend={revenue.growthPct}
        />
        <KpiCard
          label="Orders (This Month)"
          value={fmtNum(orders.thisMonth)}
          icon={ShoppingBag}
          accent={STEEL}
          sub={`${fmtNum(orders.today)} today`}
        />
        <KpiCard
          label="Avg. Order Value"
          value={fmtMoney(d.aov)}
          icon={ArrowUpRight}
          accent="#0ea5e9"
          sub="per won order"
        />
        <KpiCard
          label="Customers"
          value={fmtNum(d.customers?.total)}
          icon={Users}
          accent="#8b5cf6"
          sub={`+${fmtNum(d.customers?.newThisMonth)} this month`}
        />
        <KpiCard
          label="Products Live"
          value={fmtNum(d.products?.live)}
          icon={Package}
          accent="#22c55e"
          sub={`of ${fmtNum(d.products?.total)} total`}
        />
      </div>

      {/* Operational alerts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-2xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-500" />
          <div>
            <div className="text-xl font-semibold text-amber-700 dark:text-amber-400">{fmtNum(orders.pending)}</div>
            <div className="text-xs text-amber-600 dark:text-amber-400">Orders awaiting action</div>
          </div>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-4 flex items-center gap-3">
          <Truck className="w-5 h-5 text-indigo-500" />
          <div>
            <div className="text-xl font-semibold text-indigo-700 dark:text-indigo-400">{fmtNum(orders.processing)}</div>
            <div className="text-xs text-indigo-600 dark:text-indigo-400">In production / fulfillment</div>
          </div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-4 flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-emerald-500" />
          <div>
            <div className="text-xl font-semibold text-emerald-700 dark:text-emerald-400">{fmtMoney(revenue.thisMonth)}</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400">Revenue this month</div>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-4 flex items-center gap-3">
          <ShoppingBag className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          <div>
            <div className="text-xl font-semibold text-slate-700 dark:text-slate-300">{fmtNum(orders.total)}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Orders all-time</div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-[#091930] dark:text-foreground">Revenue Trend</h3>
            <span className="text-xs text-gray-400 dark:text-muted-foreground">Last 12 months</span>
          </div>
          <ApexChart options={trendOptions} series={trendSeries} type="area" height={280} />
        </div>

        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 shadow-sm">
          <h3 className="font-semibold text-[#091930] dark:text-foreground mb-2">Order Pipeline</h3>
          {donutSeries.length ? (
            <ApexChart options={donutOptions} series={donutSeries} type="donut" height={220} />
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-gray-400 dark:text-muted-foreground">
              No orders yet
            </div>
          )}
          <div className="mt-3 space-y-1.5">
            {statusBreakdown.map((s) => (
              <div key={s.status} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-600 dark:text-muted-foreground">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: STATUS_COLORS[s.status] || STEEL }}
                  />
                  {s.status}
                </span>
                <span className="font-medium text-[#091930] dark:text-foreground">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top products + recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 shadow-sm">
          <h3 className="font-semibold text-[#091930] dark:text-foreground mb-4">Top Performing Products</h3>
          <div className="space-y-3">
            {topProducts.length ? (
              topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-muted border border-gray-100 dark:border-border overflow-hidden flex items-center justify-center shrink-0">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name ? `${p.name} product thumbnail` : "Product thumbnail"}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-4 h-4 text-gray-300 dark:text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#091930] dark:text-foreground truncate">{p.name}</div>
                    <div className="text-xs text-gray-400 dark:text-muted-foreground">
                      {p.code || "—"} · {p.orders} order{p.orders === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-[#091930] dark:text-foreground">{fmtMoney(p.revenue)}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 dark:text-muted-foreground py-6 text-center">
                No sales yet. Add products and process orders to see top performers.
                <br />
                <Link
                  href="/dashboard/product-management/my-products"
                  className="text-[#162640] font-medium underline underline-offset-2 hover:text-[#091930] dark:text-foreground"
                >
                  Go to Product Management
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 shadow-sm">
          <h3 className="font-semibold text-[#091930] dark:text-foreground mb-4">Recent Orders</h3>
          <div className="relative">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-muted-foreground text-xs border-b border-gray-100 dark:border-border">
                    <th scope="col" className="pb-2 font-medium">Order</th>
                    <th scope="col" className="pb-2 font-medium">Customer</th>
                    <th scope="col" className="pb-2 font-medium">Status</th>
                    <th scope="col" className="pb-2 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length ? (
                    recentOrders.map((o) => (
                      <tr key={o.id} className="border-b border-gray-50 dark:border-border last:border-0">
                        <td className="py-2.5 font-medium text-[#091930] dark:text-foreground">
                          {o.orderNumber || o.id?.slice(0, 8)}
                        </td>
                        <td className="py-2.5 text-gray-600 dark:text-muted-foreground truncate max-w-[120px]">{o.customer}</td>
                        <td className="py-2.5">
                          <span
                            className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                            style={{
                              background: `${STATUS_COLORS[o.status] || STEEL}1a`,
                              color: STATUS_COLORS[o.status] || STEEL,
                            }}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-semibold text-[#091930] dark:text-foreground">
                          {fmtMoney(o.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-gray-500 dark:text-muted-foreground">
                        No recent orders
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 right-0 h-full w-6 bg-gradient-to-l from-white to-transparent sm:hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
