"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/common/ui/button";
import { Edit2Icon } from "lucide-react";
import { RiDeleteBin5Line } from "@remixicon/react";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";
// import { useCrudApi } from "@/hooks/useCrudApi";
import ActiveToggleCell from "@/components/common/ui/ActiveToggleCell";
import { useCrudApi } from "@/hooks/useCrudApi";

const useCouponsList = ({ onEdit, onDelete }) => {
  const { toggleStatus } = useCrudApi("/api/coupon-management");

  return useMemo(() => {
    // const renderDate = (dateStr) => new Date(dateStr).toLocaleDateString();

    return [
      // {
      //   accessorKey: "id",
      //   header: () => <DataGridTableRowSelectAll />,
      //   cell: ({ row }) => <DataGridTableRowSelect row={row} />,
      //   enableSorting: false,
      //   enableHiding: false,
      //   size: 48,
      // },
      {
        id: "coupon_id",
        header: ({ column }) => (
          <DataGridColumnHeader title="Coupon ID" column={column} />
        ),
        accessorFn: (row) => row.id,
        cell: ({ row }) => row.original.id,
        size: 135,
      },
      {
        id: "code",
        header: ({ column }) => (
          <DataGridColumnHeader title="Code" column={column} />
        ),
        accessorFn: (row) => row.code,
        cell: ({ row }) => (
          <span title={row.original.code} className="block truncate">
            {row.original.code}
          </span>
        ),
        size: 135,
      },
      {
        id: "discount",
        header: ({ column }) => (
          <DataGridColumnHeader title="Discount" column={column} />
        ),
        accessorFn: (row) => row.discount_value,
        cell: ({ row }) => row.original.discount_value,
        size: 135,
      },
      {
        id: "min_order_amount",
        header: ({ column }) => (
          <DataGridColumnHeader title="Min Order Amount" column={column} />
        ),
        accessorFn: (row) => row.min_order_amount,
        cell: ({ row }) => row.original.min_order_amount,
        size: 135,
      },
      {
        id: "max_discount_amount",
        header: ({ column }) => (
          <DataGridColumnHeader title="Max Discount Amount" column={column} />
        ),
        accessorFn: (row) => row.max_discount_amount,
        cell: ({ row }) => row.original.max_discount_amount,
        size: 135,
      },
      {
        id: "validity",
        header: ({ column }) => (
          <DataGridColumnHeader title="Validity" column={column} />
        ),
        accessorFn: (row) =>
          row.start_date && row.end_date
            ? `${new Date(row.start_date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })} - ${new Date(row.end_date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}`
            : "-",
        cell: ({ row }) => (
          <span>
            {row.original.start_date && row.original.end_date
              ? `${new Date(row.original.start_date).toLocaleDateString(
                  "en-GB",
                  {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  }
                )} To ${new Date(row.original.end_date).toLocaleDateString(
                  "en-GB",
                  {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  }
                )}`
              : "—"}
          </span>
        ),
        size: 150,
      },
      {
        id: "uses_limit",
        header: ({ column }) => (
          <DataGridColumnHeader title="Uses Limit" column={column} />
        ),
        accessorFn: (row) => row.usage_limit,
        cell: ({ row }) => row.original.usage_limit,
        size: 135,
      },
      {
        id: "is_active",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        accessorFn: (row) => row.is_active,
        cell: ({ row }) => (
          <ActiveToggleCell
            id={row.original.id}
            isActive={row.original.is_active}
            toggleStatus={toggleStatus}
          />
        ),
        size: 135,
      },
      {
        id: "action",
        header: ({ column }) => (
          <DataGridColumnHeader title="Action" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex gap-2.5">
            <Button
              mode="icon"
              variant="outline"
              onClick={() => onEdit(row.original)}
            >
              <Edit2Icon />
            </Button>
            <Button
              mode="icon"
              variant="outline"
              className="!cursor-pointer"
              onClick={() => onDelete(row.original.id)}
            >
              <RiDeleteBin5Line />
            </Button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 135,
      },
    ];
  }, [onEdit, onDelete, toggleStatus]);
};

export default useCouponsList;
