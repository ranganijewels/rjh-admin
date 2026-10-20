import { useMemo, useState } from "react";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Button } from "@/components/common/ui/button";
import { StatusBadge } from "@/components/common/ui/badge";
import { ShortId, TruncatedText } from "@/components/common/ui/short-id";
import { EyeIcon, FlaskConical } from "lucide-react";
import { getAuthToken } from "@/lib/auth-token";

// Test orders stay in the list for the audit trail but are excluded from
// revenue/dashboard reporting.
//
// The marker only appears on a row that IS a test order. The affordance for
// flagging one used to sit on every row as a grey "· test?" — which read as
// stray text rather than a control, and it pushed the order number into an
// ellipsis. It is now a button in the row actions, next to "view".
const TestMarker = ({ isTest }) => {
  if (!isTest) return null;
  return (
    <span className="shrink-0 rounded bg-warning/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-warning">
      Test
    </span>
  );
};

const TestToggle = ({ order }) => {
  const [isTest, setIsTest] = useState(!!order.is_test);
  const [busy, setBusy] = useState(false);

  const toggle = async (e) => {
    e.stopPropagation();
    setBusy(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/order-management/${order.id}/test`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({ isTest: !isTest }),
      });
      if (res.ok) setIsTest(!isTest);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      mode="icon"
      variant="outline"
      disabled={busy}
      aria-label={
        isTest
          ? `Mark order ${order.orderNumber || order.id || ""} as a real order`
          : `Mark order ${order.orderNumber || order.id || ""} as a test order`
      }
      title={
        isTest
          ? "Test order — excluded from reports. Click to mark as real."
          : "Mark as test order (excluded from reports)"
      }
      className={isTest ? "text-warning" : undefined}
      onClick={toggle}
    >
      <FlaskConical />
    </Button>
  );
};

export const useOrderListColumns = ({ onEdit, onView }) => {
  return useMemo(
    () => [
      {
        id: "select",
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        size: 40,
        meta: { headerTitle: "Select" },
      },
      {
        id: "orderId",
        header: ({ column }) => (
          <DataGridColumnHeader title="Order #" column={column} />
        ),
        accessorFn: (row) => row.orderNumber || row.order_number || row.id,
        cell: ({ row }) => {
          const o = row.original;
          // Show the human order number (SF-…); fall back to the raw id in a
          // short, copyable form rather than dumping a full UUID.
          const orderNumber = o.orderNumber || o.order_number;
          if (orderNumber) {
            return (
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium" title={orderNumber}>
                  {orderNumber}
                </span>
                <TestMarker isTest={!!o.is_test} />
              </div>
            );
          }
          return (
            <div className="flex items-center gap-2">
              <ShortId value={o.id} length={10} label="Order ID" />
              <TestMarker isTest={!!o.is_test} />
            </div>
          );
        },
        enableSorting: true,
        size: 190,
        meta: {
          identity: true,
          headerTitle: "Order #",
          truncate: true,
          skeleton: <Skeleton className="h-4 w-[125px]" />,
        },
      },
      {
        id: "customer_name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Customer Name" column={column} />
        ),
        accessorFn: (row) => row.customer_name,
        cell: ({ row }) => (
          <TruncatedText value={row.original.customer_name} />
        ),
        size: 130,
        meta: { headerTitle: "Customer Name", truncate: true },
      },
      {
        // Order status comes before the money columns: it is the column the
        // list is scanned for.
        id: "fulfilmentStatus",
        header: ({ column }) => (
          <DataGridColumnHeader title="Order Status" column={column} />
        ),
        accessorFn: (row) => row.order_status,
        cell: ({ row }) =>
          row.original.order_status ? (
            <StatusBadge status={row.original.order_status} />
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
        size: 120,
        meta: { headerTitle: "Order Status" },
      },
      {
        id: "paymentStatus",
        header: ({ column }) => (
          <DataGridColumnHeader title="Payment Status" column={column} />
        ),
        accessorFn: (row) => row.payment_status,
        cell: ({ row }) =>
          row.original.payment_status ? (
            <StatusBadge status={row.original.payment_status} />
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
        size: 115,
        meta: { headerTitle: "Payment Status" },
      },
      {
        id: "totalValue",
        header: ({ column }) => (
          <DataGridColumnHeader title="Total Value" column={column} />
        ),
        accessorFn: (row) => row.subtotal,
        cell: ({ row }) => {
          const n = Number(row.original.subtotal);
          // Guard against bad/legacy NaN totals so the grid never shows "NaN".
          if (!Number.isFinite(n)) {
            return <span className="text-warning">—</span>;
          }
          return <span>${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
        },
        size: 110,
        meta: { headerTitle: "Total Value" },
      },
      {
        id: "quantity",
        header: ({ column }) => (
          <DataGridColumnHeader title="Quantity" column={column} />
        ),
        accessorFn: (row) => row.total_quantity,
        cell: ({ row }) => <span>{row.original.total_quantity}</span>,
        size: 70,
        meta: { headerTitle: "Quantity" },
      },
      {
        id: "orderDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Order Date" column={column} />
        ),
        accessorFn: (row) => row.created_at,
        cell: ({ row }) => {
          const date = row.original?.created_at;
          if (!date) return "-";

          const formattedDate = new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });

          return formattedDate;
        },
        size: 95,
        meta: { headerTitle: "Order Date" },
      },
      {
        id: "orderChannel",
        header: ({ column }) => (
          <DataGridColumnHeader title="Order Channel" column={column} />
        ),
        accessorFn: (row) => row.payment_method,
        cell: ({ row }) => (
          <span className="capitalize">{row.original.payment_method || "—"}</span>
        ),
        size: 130,
        meta: { headerTitle: "Order Channel" },
      },
      {
        id: "action",
        header: ({ column }) => (
          <DataGridColumnHeader title="Action" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              mode="icon"
              variant="outline"
              aria-label={`View order ${row.original.orderNumber || row.original.id || ""}`}
              title="View order"
              onClick={(event) => {
                event.stopPropagation();
                onView(row.original);
              }}
            >
              <EyeIcon />
            </Button>
            <TestToggle order={row.original} />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 104,
        meta: { headerTitle: "Action" },
      },
    ],
    [onEdit, onView]
  );
};
