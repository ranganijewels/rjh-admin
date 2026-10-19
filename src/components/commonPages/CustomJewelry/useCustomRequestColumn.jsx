"use client";

import { useMemo } from "react";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";
import { StatusBadge } from "@/components/common/ui/badge";
import { Button } from "@/components/common/ui/button";
import { ShortId, TruncatedText } from "@/components/common/ui/short-id";
import { EyeIcon } from "lucide-react";

const useCustomRequestColumn = ({ onView } = {}) => {
  return useMemo(
    () => [
      {
        id: "select",
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        size: 44,
        meta: { headerTitle: "Select" },
      },
      {
        id: "request_id",
        header: ({ column }) => (
          <DataGridColumnHeader title="Requested ID" column={column} />
        ),
        accessorFn: (row) => row.id,
        cell: ({ row }) => (
          <ShortId value={row.original.id} label="Request ID" />
        ),
        size: 140,
        meta: { identity: true, headerTitle: "Requested ID" },
      },
      {
        id: "store_name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Store Name" column={column} />
        ),
        accessorFn: (row) => row.store_name,
        cell: ({ row }) => (
          <TruncatedText
            value={row.original.store_name}
            className="font-medium text-foreground"
          />
        ),
        size: 200,
        meta: { headerTitle: "Store Name", truncate: true },
      },
      {
        id: "type",
        header: ({ column }) => (
          <DataGridColumnHeader title="Type" column={column} />
        ),
        accessorFn: (row) => row.category?.name,
        cell: ({ row }) => {
          const name = row.original.category?.name || "";
          const formattedName =
            name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
          return <span>{formattedName || "—"}</span>;
        },
        size: 150,
        meta: { headerTitle: "Type" },
      },
      {
        id: "requestedOn",
        header: ({ column }) => (
          <DataGridColumnHeader title="Requested On" column={column} />
        ),
        accessorFn: (row) => row.created_at,
        cell: ({ row }) => {
          const date = new Date(row.original.created_at);
          if (Number.isNaN(date.getTime())) return "—";
          return date.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          });
        },
        size: 140,
        meta: { headerTitle: "Requested On" },
      },
      {
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        accessorFn: (row) => row.status,
        cell: ({ row }) =>
          row.original.status ? (
            <StatusBadge status={row.original.status} />
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
        enableSorting: true,
        size: 135,
        meta: { headerTitle: "Status" },
      },
      {
        id: "action",
        header: ({ column }) => (
          <DataGridColumnHeader title="Action" column={column} />
        ),
        cell: ({ row }) => (
          <Button
            mode="icon"
            variant="outline"
            aria-label={`View request ${
              row.original.store_name || row.original.id || ""
            }`}
            title="View request"
            onClick={(event) => {
              event.stopPropagation();
              onView(row.original);
            }}
          >
            <EyeIcon />
          </Button>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 80,
        meta: { headerTitle: "Action" },
      },
    ],
    [onView]
  );
};

export default useCustomRequestColumn;
