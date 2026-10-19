"use client";
import { useMemo } from "react";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";
import { StatusBadge } from "@/components/common/ui/badge";
import { Button } from "@/components/common/ui/button";
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
        size: 48,
      },
      {
        id: "request_id",
        header: ({ column }) => (
          <DataGridColumnHeader title="Requested ID" column={column} />
        ),
        accessorFn: (row) => row.id,
        cell: ({ row }) => <span>{row.original.id}</span>,
        size: 135,
      },
      {
        id: "store_name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Store Name" column={column} />
        ),
        accessorFn: (row) => row.store_name,
        cell: ({ row }) => {
          const storeName = row.original.store_name || "-";
          return (
            <span title={storeName} className="block truncate">
              {storeName}
            </span>
          );
        },
        size: 230,
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
          return <span>{formattedName}</span>;
        },
        size: 135,
      },
      {
        id: "requestedOn",
        header: ({ column }) => (
          <DataGridColumnHeader title="Requested On" column={column} />
        ),
        accessorFn: (row) => row.created_at,
        cell: ({ row }) => {
          const date = new Date(row.original.created_at);
          return date.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          });
        },
        size: 135,
      },
      {
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        accessorFn: (row) => row.status,
        cell: ({ row }) => (
          <>
            <StatusBadge
              size="lg"
              appearance="outline"
              status={row.original.status}
            />
          </>
        ),
        enableSorting: true,
        size: 135,
      },

      // {
      //   id: "assignedDesigner",
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="Assigned Designer" column={column} />
      //   ),
      //   accessorFn: (row) => row.assignedDesigner,
      //   cell: ({ row }) => <span>{row.original.assignedDesigner}</span>,
      //   size: 135,
      // },
      {
        id: "action",
        header: ({ column }) => (
          <DataGridColumnHeader title="Action" column={column} />
        ),
        accessorFn: (row) => row.orderChannel,
        cell: ({ row }) => (
          <Button
            mode="icon"
            variant="outline"
            onClick={() => onView(row.original)}
          >
            <EyeIcon />
          </Button>
        ),
        size: 130,
      },
    ],
    [onView]
  );
};

export default useCustomRequestColumn;
