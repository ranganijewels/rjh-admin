"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  Clock,
  DollarSign,
  Download,
  PackageOpen,
  Plus,
  RefreshCw,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  AlertToolbar,
} from "@/components/common/ui/alert";
import { Button } from "@/components/common/ui/button";
import { Card, CardContent } from "@/components/common/ui/cards/card";
import { Page, PageHeader } from "@/components/common/ui/page";
import { KpiCard } from "@/components/common/ui/kpi-card";
import { StatusFilter } from "@/components/common/ui/status-filter";
import { Skeleton } from "@/components/common/ui/skeleton";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { useCrudApi } from "@/hooks/useCrudApi";
import { usePermissions } from "@/provider/permission-provider";
import { cn } from "@/lib/utils";

import { useOrderList } from "../hooks/useOrderList";
import { useOrderListColumns } from "../hooks/useOrderListColumns";
import {
  isPendingStatus,
  isProcessingStatus,
  isToday,
  ORDER_STATUS_ORDER,
  orderStatusOf,
} from "../hooks/orderStatus";
import CreateOrderDialog from "./CreateOrderDialog";
import OrderCard from "./OrderCard";
import ViewOrders from "./ViewOrders";

const fmtMoney = (n) =>
  "$" + Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

const fmtNum = (n) => Number(n || 0).toLocaleString("en-US");

// Columns exported to CSV, in order. Values are plain strings so the export
// always mirrors what the table shows.
const EXPORT_COLUMNS = [
  ["Order #", (o) => o.orderNumber || o.order_number || o.id],
  ["Date", (o) => (o.created_at ? new Date(o.created_at).toLocaleString() : "")],
  ["Customer", (o) => o.customer_name || ""],
  ["Order status", (o) => o.order_status || ""],
  ["Payment status", (o) => o.payment_status || ""],
  ["Payment method", (o) => o.payment_method || ""],
  ["Quantity", (o) => o.total_quantity ?? ""],
  ["Total value", (o) => (Number.isFinite(Number(o.subtotal)) ? Number(o.subtotal).toFixed(2) : "")],
  ["Test order", (o) => (o.is_test ? "Yes" : "No")],
];

const csvCell = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const toCsv = (rows) =>
  [
    EXPORT_COLUMNS.map(([header]) => csvCell(header)).join(","),
    ...rows.map((row) =>
      EXPORT_COLUMNS.map(([, accessor]) => csvCell(accessor(row))).join(",")
    ),
  ].join("\n");

// Fields the quick search looks through.
const SEARCHABLE_FIELDS = [
  "orderNumber",
  "order_number",
  "customer_name",
  "customerName",
  "order_status",
  "payment_status",
  "payment_method",
  "payment_gateway",
  "email",
  "phone",
  "id",
];

const AllOrders = () => {
  const { can } = usePermissions();
  const { orders, loading, error, total, truncated, refresh } = useOrderList();
  const { fetchById } = useCrudApi("/api/order-management");

  const [statusTab, setStatusTab] = useState("all");
  const [todayOnly, setTodayOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openOrderDetailSheet, setOpenOrderDetailSheet] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const handleView = useCallback(
    async (order) => {
      setSelectedOrderId(order?.id ?? null);
      try {
        const data = await fetchById(order.id);
        setOrderDetail(data?.data || order);
      } catch (e) {
        // Fall back to the row we already have rather than opening nothing.
        setOrderDetail(order);
      } finally {
        setOpenOrderDetailSheet(true);
      }
    },
    [fetchById]
  );

  const handleEdit = useCallback(() => {}, []);

  const columns = useOrderListColumns({ onEdit: handleEdit, onView: handleView });

  // --- scope ---------------------------------------------------------------

  // "Today" narrows the list before the status tab is applied, so the tab
  // counters always describe what is actually on screen.
  const dateScoped = useMemo(
    () => (todayOnly ? orders.filter((o) => isToday(o.created_at)) : orders),
    [orders, todayOnly]
  );

  const statusCounts = useMemo(() => {
    const counts = new Map();
    dateScoped.forEach((order) => {
      const status = orderStatusOf(order);
      counts.set(status, (counts.get(status) || 0) + 1);
    });
    return counts;
  }, [dateScoped]);

  const tabs = useMemo(() => {
    const list = [
      { value: "all", label: "All orders", count: dateScoped.length },
    ];
    const known = ORDER_STATUS_ORDER.filter((status) => statusCounts.has(status));
    const others = [...statusCounts.keys()]
      .filter((status) => !ORDER_STATUS_ORDER.includes(status))
      .sort();
    [...known, ...others].forEach((status) => {
      list.push({
        value: status,
        label: status,
        count: statusCounts.get(status),
      });
    });
    return list;
  }, [dateScoped, statusCounts]);

  const scopedRows = useMemo(
    () =>
      statusTab === "all"
        ? dateScoped
        : dateScoped.filter((order) => orderStatusOf(order) === statusTab),
    [dateScoped, statusTab]
  );

  // --- search --------------------------------------------------------------

  const matchesSearch = useCallback((order, query) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return SEARCHABLE_FIELDS.some((field) => {
      const value = order[field];
      return (
        value !== undefined &&
        value !== null &&
        String(value).toLowerCase().includes(needle)
      );
    });
  }, []);

  const filterFunction = useCallback(
    (data, query) => data.filter((order) => matchesSearch(order, query)),
    [matchesSearch]
  );

  // --- KPIs ----------------------------------------------------------------

  const kpis = useMemo(() => {
    // Test orders stay in the list for the audit trail but are excluded from
    // revenue reporting, matching the rest of the platform.
    const billable = orders.filter((order) => !order.is_test);
    const revenue = billable.reduce(
      (sum, order) => sum + (Number(order.subtotal) || 0),
      0
    );
    const todayCount = orders.filter((order) => isToday(order.created_at)).length;
    const awaiting = orders.filter((order) => isPendingStatus(order)).length;
    const inProduction = orders.filter((order) => isProcessingStatus(order)).length;

    return [
      {
        label: "Total orders",
        value: fmtNum(orders.length),
        icon: ShoppingBag,
        sub: `${fmtNum(todayCount)} today`,
      },
      {
        label: "Pending",
        value: fmtNum(awaiting),
        icon: Clock,
        sub: "need an action",
      },
      {
        label: "In production",
        value: fmtNum(inProduction),
        icon: Truck,
        sub: "confirmed → shipped",
      },
      {
        label: "Revenue",
        value: fmtMoney(revenue),
        icon: DollarSign,
        sub: "excludes test orders",
      },
      {
        label: "Avg. order value",
        value: fmtMoney(billable.length ? revenue / billable.length : 0),
        icon: ArrowUpRight,
        sub: "per order",
      },
    ];
  }, [orders]);

  // --- actions -------------------------------------------------------------

  const handleExport = useCallback(() => {
    const rows = filterFunction(scopedRows, searchQuery);
    if (!rows.length) {
      toast.error("No orders to export for the current filters");
      return;
    }

    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} order${rows.length === 1 ? "" : "s"}`);
  }, [filterFunction, scopedRows, searchQuery]);

  // Reuses the exact single-order cancel mechanism from ViewOrders.jsx
  // (PATCH /api/order-management/:id/status) — orders are never hard-deleted.
  const cancelOrder = useCallback(async (id) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("authTokenStoreAdmin")
        : null;
    await fetch(`/api/order-management/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ status: "Cancelled" }),
    });
  }, []);

  const renderOrderCard = useCallback(
    (order) => <OrderCard order={order} onView={handleView} />,
    [handleView]
  );

  const handleRetry = useCallback(() => {
    refresh();
  }, [refresh]);

  // --- states --------------------------------------------------------------

  if (error) {
    return (
      <Alert variant="destructive" appearance="light" close={false}>
        <AlertIcon>
          <AlertCircle />
        </AlertIcon>
        <AlertContent>
          <AlertTitle>Failed to load orders</AlertTitle>
          <AlertDescription>
            Please try refreshing or contact support if the problem persists.
          </AlertDescription>
        </AlertContent>
        <AlertToolbar>
          <Button size="sm" variant="destructive" onClick={handleRetry}>
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </AlertToolbar>
      </Alert>
    );
  }

  const hasOrders = orders.length > 0;

  return (
    <Page>
      {/* Page header + page-level actions */}
      <PageHeader
        title="Orders"
        description="Track fulfilment, filter by status and manage customer orders."
        actions={
          <>
            <Button
              variant={todayOnly ? "primary" : "outline"}
              size="md"
              onClick={() => setTodayOnly((value) => !value)}
              aria-pressed={todayOnly}
            >
              <CalendarDays className="size-4" />
              Today
            </Button>
            <Button variant="outline" size="md" onClick={handleExport}>
              <Download className="size-4" />
              Export
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              Create order
            </Button>
          </>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[124px] rounded-xl" />
            ))
          : kpis.map((kpi) => (
              <KpiCard
                key={kpi.label}
                label={kpi.label}
                value={kpi.value}
                icon={kpi.icon}
                sub={kpi.sub}
              />
            ))}
      </div>

      {truncated && !loading && (
        <p className="-mt-3 text-xs text-muted-foreground">
          Showing the most recent {fmtNum(orders.length)} of {fmtNum(total)}{" "}
          orders.
        </p>
      )}

      {hasOrders && (
        <StatusFilter
          options={tabs}
          value={statusTab}
          onChange={setStatusTab}
          ariaLabel="Order status"
        />
      )}
      {/* Order list */}
      {loading ? (
        <Card>
            <CardContent className="space-y-3 p-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
        </CardContent>
        </Card>
      ) : !hasOrders ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <PackageOpen className="size-10 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">No orders yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Create your first order to get started. New orders placed on the
            storefront will also appear here automatically.
          </p>
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Create order
          </Button>
        </div>
      ) : (
        <ListWithCardToggle
          title="Order list"
          titleAs="h2"
          description={
            todayOnly
              ? "Orders placed today."
              : "Every order placed on your storefront."
          }
          data={scopedRows}
          columns={columns}
          filterFunction={filterFunction}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          renderCardView={renderOrderCard}
          responsiveCards
          paginationResetKey={`${statusTab}-${todayOnly}`}
          onRefresh={refresh}
          resizableColumns
          bulkActions={
            can("orders", "delete")
              ? [
                  {
                    key: "cancel",
                    label: "Cancel Orders",
                    variant: "destructive",
                    confirmMessage:
                      "Cancel the selected order(s)? This cannot be undone.",
                    onRun: async (rows) => {
                      await Promise.all(rows.map((r) => cancelOrder(r.id)));
                      refresh();
                    },
                  },
                ]
              : []
          }
        />
      )}

      <ViewOrders
        open={openOrderDetailSheet}
        onClose={() => setOpenOrderDetailSheet(false)}
        orders={orderDetail}
        orderId={selectedOrderId}
      />

      <CreateOrderDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={refresh}
      />
    </Page>
  );
};

export default AllOrders;
