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
import { TruncatedText } from "@/components/common/ui/short-id";
import { Edit2Icon } from "lucide-react";
import ActiveToggleCell from "@/components/common/ui/ActiveToggleCell";
import { RiDeleteBin5Line } from "@remixicon/react";

export const useFAQColumns = ({ onEdit, onDelete }) => {
  return useMemo(() => {
    return [
      {
        id: "select",
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        size: 48,
        meta: { headerTitle: "Select" },
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
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-foreground" title={row?.original?.title || "Untitled"}>
                {row?.original?.title || "Untitled"}
              </span>
              <span className="truncate text-sm text-muted-foreground">
                {plainTextDescription || "No description"}
              </span>
            </div>
          );
        },
        enableSorting: true,
        size: 350,
        meta: {
          headerTitle: "Title",
          identity: true,
          truncate: true,
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
        cell: ({ row }) => <TruncatedText value={row.original.category || "-"} />,
        size: 140,
        meta: { headerTitle: "Category", truncate: true },
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
        enableHiding: false,
        size: 100,
        meta: { headerTitle: "Active" },
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
              aria-label="Edit FAQ"
              title="Edit FAQ"
              onClick={(event) => {
                event.stopPropagation();
                onEdit?.(row?.original);
              }}
            >
              <Edit2Icon />
            </Button>
            <Button
              mode="icon"
              variant="outline"
              className="!cursor-pointer"
              aria-label="Delete FAQ"
              title="Delete FAQ"
              onClick={(event) => {
                event.stopPropagation();
                onDelete?.(row?.original?.id);
              }}
            >
              <RiDeleteBin5Line />
            </Button>
          </div>
        ),
        enableHiding: false,
        size: 110,
        meta: { headerTitle: "Actions" },
      },
    ];
  }, [onEdit, onDelete]);
};
