"use client";

import { useMemo } from "react";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Badge, BadgeDot } from "@/components/common/ui/badge";

export const useReturnRepairColumns = () => {
  const STATUS_MAP = {
    submitted: { label: "Submitted", variant: "info" },
    in_progress: { label: "In Progress", variant: "warning" },
    completed: { label: "Completed", variant: "success" },
    rejected: { label: "Rejected", variant: "danger" },
  };

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
          <DataGridColumnHeader title="Order ID" column={column} />
        ),
        accessorFn: (row) => row.order_id,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{row.original.order_id}</span>
          </div>
        ),
        enableSorting: true,
        size: 100,
        meta: {
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
              className="w-[80px] h-[80px] rounded-md object-cover"
            />
          ) : (
            <span className="text-muted-foreground">N/A</span>
          );
        },
        enableSorting: false,
        size: 135,
      },
      {
        id: "fullName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Full Name" column={column} />
        ),
        accessorFn: (row) => row.full_name,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span
              title={row.original.full_name}
              className="block truncate text-sm font-medium"
            >
              {row.original.full_name}
            </span>
          </div>
        ),
        enableSorting: true,
        size: 135,
      },
      {
        id: "phoneNumber",
        header: ({ column }) => (
          <DataGridColumnHeader title="Phone Number" column={column} />
        ),
        accessorFn: (row) => row.phone_number,
        cell: ({ row }) => <span>{row.original.phone_number}</span>,
        size: 120,
      },
      {
        id: "email",
        header: ({ column }) => (
          <DataGridColumnHeader title="Email" column={column} />
        ),
        accessorFn: (row) => row.email,
        cell: ({ row }) => <span>{row.original.email}</span>,
        size: 135,
      },
      {
        id: "JewelryType",
        header: ({ column }) => (
          <DataGridColumnHeader title="Jewelry Type" column={column} />
        ),
        accessorFn: (row) => row.jewellery_type,
        cell: ({ row }) => row.original.jewellery_type,
        size: 110,
      },
      {
        id: "preferredAction",
        header: ({ column }) => (
          <DataGridColumnHeader title="Preferred Action" column={column} />
        ),
        accessorFn: (row) => row.preferred_action,
        cell: ({ row }) => <span>{row.original.preferred_action}</span>,
        size: 135,
      },
      {
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Return Status" column={column} />
        ),
        accessorFn: (row) => {
          const value = row.status;
          return STATUS_MAP[value] || null;
        },
        cell: ({ row }) => {
          const status = row.getValue("status");
          return status ? (
            <Badge
              size="lg"
              variant={status.variant}
              appearance="outline"
              shape="circle"
            >
              <BadgeDot /> {status.label}
            </Badge>
          ) : (
            <span className="text-muted-foreground">N/A</span>
          );
        },
        size: 125,
      },
      // {
      //   id: "action",
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="Action" column={column} />
      //   ),
      //   accessorFn: (row) => row.orderChannel,
      //   cell: ({ row }) => (
      //     <div className="flex gap-[10px]">
      //       <Button mode="icon" variant="outline">
      //         <Edit2Icon />
      //       </Button>

      //       <Button
      //         mode="icon"
      //         variant="outline"
      //         onClick={() => handleView(row.original)}
      //       >
      //         <EyeIcon />
      //       </Button>
      //     </div>
      //   ),
      // },
    ],
    []
  );
};
