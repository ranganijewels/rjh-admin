"use client";

import { useMemo } from "react";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";
import { Skeleton } from "@/components/common/ui/skeleton";
import { StatusBadge } from "@/components/common/ui/badge";
import { Button } from "@/components/common/ui/button";
import { Edit2Icon } from "lucide-react";
import ActiveToggleCell from "@/components/common/ui/ActiveToggleCell";
import { RiDeleteBin5Line } from "@remixicon/react";

export const useFAQColumns = ({ onEdit, onDelete }) => {
  return useMemo(() => {
    return [
      {
        accessorKey: "id",
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        size: 48,
      },
      {
        id: "title",
        header: ({ column }) => (
          <DataGridColumnHeader title="Title" column={column} />
        ),
        accessorFn: (row) => row?.title || "Untitled",
        cell: ({ row }) => {
          const plainTextDescription = row?.original?.description
            ? row.original.description.replace(/<[^>]+>/g, "")
            : "";

          return (
            <div className="flex flex-col">
              <span className="font-medium text-sm text-gray-900">
                {row?.original?.title || "Untitled"}
              </span>
              <span className="text-sm text-muted-foreground truncate max-w-[250px]">
                {plainTextDescription || "No description"}
              </span>
            </div>
          );
        },
        enableSorting: true,
        size: 350,
        meta: {
          skeleton: (
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-[125px]" />
              <Skeleton className="h-3 w-[200px]" />
            </div>
          ),
        },
      },
      {
        id: "category",
        header: ({ column }) => (
          <DataGridColumnHeader title="Category" column={column} />
        ),
        accessorFn: (row) => row.category,
        cell: ({ row }) => row.original.category,
        size: 120,
      },
      {
        id: "is_active",
        header: ({ column }) => (
          <DataGridColumnHeader title="Active" column={column} />
        ),
        accessorFn: (row) => row?.is_active ?? false,
        cell: ({ row }) => (
          <ActiveToggleCell
            id={row?.original?.id}
            isActive={row?.original?.is_active ?? false}
          />
        ),
        size: 100,
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataGridColumnHeader title="Actions" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex gap-2.5">
            <Button
              mode="icon"
              variant="outline"
              onClick={() => onEdit?.(row?.original)}
            >
              <Edit2Icon />
            </Button>
            <Button
              mode="icon"
              variant="outline"
              className="!cursor-pointer"
              onClick={() => onDelete?.(row?.original?.id)}
            >
              <RiDeleteBin5Line />
            </Button>
          </div>
        ),
        size: 180,
      },
    ];
  }, [onEdit, onDelete]);
};
