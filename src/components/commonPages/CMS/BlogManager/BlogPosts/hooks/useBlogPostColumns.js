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
import { useCrudApi } from "@/hooks/useCrudApi";

export const useBlogPostColumns = ({ onEdit, onDelete, storeId }) => {
  const { toggleStatus } = useCrudApi(`/api/cms/blog/${storeId}/posts`);

  return useMemo(() => {
    return [
      {
        id: "select",
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
          const excerpt = row?.original?.excerpt || "";

          return (
            <div className="flex flex-col">
              <span className="font-medium text-sm text-gray-900 dark:text-foreground">
                {row?.original?.title || "Untitled"}
              </span>
              <span className="text-sm text-muted-foreground truncate max-w-[250px]">
                {excerpt || "No excerpt"}
              </span>
            </div>
          );
        },
        enableSorting: true,
        size: 300,
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
        id: "tags",
        header: ({ column }) => (
          <DataGridColumnHeader title="Category / Tags" column={column} />
        ),
        accessorFn: (row) => (row?.tags || []).join(", ") || "-",
        cell: ({ row }) => (row?.original?.tags || []).join(", ") || "-",
        size: 160,
      },
      {
        id: "author",
        header: ({ column }) => (
          <DataGridColumnHeader title="Author" column={column} />
        ),
        accessorFn: (row) => row.author,
        cell: ({ row }) => row.original.author || "-",
        size: 120,
      },
      {
        id: "isPublished",
        header: ({ column }) => (
          <DataGridColumnHeader title="Published" column={column} />
        ),
        accessorFn: (row) => row?.isPublished ?? false,
        cell: ({ row }) => (
          <ActiveToggleCell
            id={row?.original?.id}
            isActive={row?.original?.isPublished ?? false}
            toggleStatus={toggleStatus}
          />
        ),
        size: 100,
      },
      {
        id: "publishedDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Date" column={column} />
        ),
        accessorFn: (row) => row?.publishedAt || row?.createdAt || "-",
        cell: ({ row }) => {
          const value = row?.original?.publishedAt || row?.original?.createdAt;
          if (!value) return "-";

          const date = new Date(value);
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        },
        size: 120,
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
