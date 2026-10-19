import { useMemo, useState } from "react";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Button } from "@/components/common/ui/button";
import { EyeIcon } from "lucide-react";

// Test orders stay in the list for the audit trail but are excluded from
// revenue/dashboard reporting. Click the chip to flag or unflag.
const TestFlag = ({ order }) => {
  const [isTest, setIsTest] = useState(!!order.is_test);
  const [busy, setBusy] = useState(false);
  const toggle = async (e) => {
    e.stopPropagation();
    setBusy(true);
    try {
      const token = localStorage.getItem("authTokenStoreAdmin");
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
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      title={isTest ? "Test order — excluded from reports. Click to mark as real." : "Mark as test order (exclude from reports)"}
      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
        isTest ? "bg-amber-100 text-amber-800" : "text-muted-foreground/50 hover:text-amber-700"
      }`}
    >
      {isTest ? "Test" : "· test?"}
    </button>
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
        size: 48,
      },
      {
        id: "orderId",
        header: ({ column }) => (
          <DataGridColumnHeader title="Order #" column={column} />
        ),
        accessorFn: (row) => row.orderNumber || row.order_number || row.id,
        cell: ({ row }) => {
          const o = row.original;
          // Show the human order number (SF-…); fall back to a short id.
          const label =
            o.orderNumber ||
            o.order_number ||
            (o.id ? `${String(o.id).slice(0, 8)}…` : "—");
          return (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{label}</span>
              <TestFlag order={o} />
            </div>
          );
        },
        enableSorting: true,
        size: 140,
        meta: {
          skeleton: <Skeleton className="h-4 w-[125px]" />,
        },
      },
      {
        id: "customer_name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Customer Name" column={column} />
        ),
        accessorFn: (row) => row.customer_name,
        cell: ({ row }) => {
          const name = row.original.customer_name;
          return (
            <span title={name} className="block truncate">
              {name}
            </span>
          );
        },
        size: 230,
      },
      {
        id: "quantity",
        header: ({ column }) => (
          <DataGridColumnHeader title="Quantity" column={column} />
        ),
        accessorFn: (row) => row.total_quantity,
        cell: ({ row }) => <span>{row.original.total_quantity}</span>,
        size: 135,
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
            return <span className="text-amber-600">—</span>;
          }
          return <span>${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
        },
        size: 135,
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
        size: 135,
      },
      {
        id: "orderChannel",
        header: ({ column }) => (
          <DataGridColumnHeader title="Order Channel" column={column} />
        ),
        accessorFn: (row) => row.payment_method,
        cell: ({ row }) => <span>{row.original.payment_method}</span>,
        size: 130,
      },
      {
        id: "paymentStatus",
        header: ({ column }) => (
          <DataGridColumnHeader title="Payment Status" column={column} />
        ),
        accessorFn: (row) => row.payment_status,
        cell: ({ row }) => <span>{row.original.payment_status}</span>,
        size: 135,
      },
      {
        id: "fulfilmentStatus",
        header: ({ column }) => (
          <DataGridColumnHeader title="Order Status" column={column} />
        ),
        accessorFn: (row) => row.order_status,
        cell: ({ row }) => <span>{row.original.order_status}</span>,
        size: 135,
      },
      {
        id: "action",
        header: ({ column }) => (
          <DataGridColumnHeader title="Action" column={column} />
        ),
        accessorFn: (row) => row.orderChannel,
        cell: ({ row }) => (
          <div className="flex gap-[10px]">
            <Button
              mode="icon"
              variant="outline"
              onClick={() => {
                onView(row.original);
              }}
            >
              <EyeIcon />
            </Button>
          </div>
        ),
        size: 130,
      },
    ],
    [onEdit, onView]
  );
};
