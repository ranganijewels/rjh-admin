"use client";

import { useMemo } from "react";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";
import { Skeleton } from "@/components/common/ui/skeleton";
import { StatusBadge } from "@/components/common/ui/badge";
import { ShortId, TruncatedText } from "@/components/common/ui/short-id";

export const useReturnRepairColumns = () => {
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
        id: "orderId",
        header: ({ column }) => (
          <DataGridColumnHeader title="Order ID" column={column} />
        ),
        accessorFn: (row) => row.order_id,
        cell: ({ row }) => (
          <ShortId value={row.original.order_id} label="Order ID" />
        ),
        enableSorting: true,
        size: 130,
        meta: {
          identity: true,
          headerTitle: "Order ID",
          skeleton: <Skeleton className="h-4 w-[125px]" />,
        },
      },
      {
        id: "image",
        header: ({ column }) => (
          <DataGridColumnHeader title="Image" column={column} />
        ),
        accessorFn: (row) => row.files?.[0] || null,
        cell: ({ row }) => {
          const img = row.original.files?.[0];
          return img ? (
            <img
              src={img}
              alt={`${row.original.full_name} item image`}
              width="80"
              height="80"
              loading="lazy"
              className="h-[80px] w-[80px] rounded-md object-cover"
            />
          ) : (
            <span className="text-muted-foreground">N/A</span>
          );
        },
        enableSorting: false,
        size: 120,
        meta: { headerTitle: "Image" },
      },
      {
        id: "fullName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Full Name" column={column} />
        ),
        accessorFn: (row) => row.full_name,
        cell: ({ row }) => (
          <TruncatedText
            value={row.original.full_name}
            className="font-medium text-foreground"
          />
        ),
        enableSorting: true,
        size: 175,
        meta: { headerTitle: "Full Name", truncate: true },
      },
      {
        id: "phoneNumber",
        header: ({ column }) => (
          <DataGridColumnHeader title="Phone Number" column={column} />
        ),
        accessorFn: (row) => row.phone_number,
        cell: ({ row }) => <span>{row.original.phone_number || "—"}</span>,
        size: 140,
        meta: { headerTitle: "Phone Number" },
      },
      {
        id: "email",
        header: ({ column }) => (
          <DataGridColumnHeader title="Email" column={column} />
        ),
        accessorFn: (row) => row.email,
        cell: ({ row }) => (
          <TruncatedText value={row.original.email} />
        ),
        size: 200,
        meta: { headerTitle: "Email", truncate: true },
      },
      {
        id: "JewelryType",
        header: ({ column }) => (
          <DataGridColumnHeader title="Jewelry Type" column={column} />
        ),
        accessorFn: (row) => row.jewellery_type,
        cell: ({ row }) => <span>{row.original.jewellery_type || "—"}</span>,
        size: 130,
        meta: { headerTitle: "Jewelry Type" },
      },
      {
        id: "preferredAction",
        header: ({ column }) => (
          <DataGridColumnHeader title="Preferred Action" column={column} />
        ),
        accessorFn: (row) => row.preferred_action,
        cell: ({ row }) => (
          <TruncatedText value={row.original.preferred_action} />
        ),
        size: 150,
        meta: { headerTitle: "Preferred Action", truncate: true },
      },
      {
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Return Status" column={column} />
        ),
        accessorFn: (row) => row.status,
        cell: ({ row }) =>
          row.original.status ? (
            <StatusBadge status={row.original.status} />
          ) : (
            <span className="text-muted-foreground">N/A</span>
          ),
        size: 140,
        meta: { headerTitle: "Return Status" },
      },
    ],
    []
  );
};
