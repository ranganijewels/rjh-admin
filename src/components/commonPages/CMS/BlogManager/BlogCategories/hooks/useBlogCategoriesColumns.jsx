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

export const useBlogCategoriesColumns = ({ onEdit, onDelete, storeId }) => {
  const { toggleStatus } = useCrudApi(`/api/cms/blog/${storeId}/categories`);

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
        id: "category",
        header: ({ column }) => (
          <DataGridColumnHeader title="Category" column={column} />
        ),
        accessorFn: (row) => row.title,
        cell: ({ row }) => {
          const t = row.original.title;
          return (
            <span title={t} className="block truncate">
              {t}
            </span>
          );
        },
        size: 230,
      },
      {
        id: "description",
        header: ({ column }) => (
          <DataGridColumnHeader title="Description" column={column} />
        ),
        accessorFn: (row) => row.description || "-",
        cell: ({ row }) => row.original.description || "-",
        size: 280,
      },
      {
        id: "slug",
        header: ({ column }) => (
          <DataGridColumnHeader title="Slug" column={column} />
        ),
        accessorFn: (row) => row.slug,
        cell: ({ row }) => row.original.slug,
        size: 120,
      },
      // {
      //   id: "postcount",
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="Post Count" column={column} />
      //   ),
      //   accessorFn: (row) => row?.postcount || "-",
      //   cell: ({ row }) => row?.original?.postcount || "-",
      //   size: 120,
      // },
      {
        id: "is_active",
        header: ({ column }) => (
          <DataGridColumnHeader title="Active" column={column} />
        ),
        accessorFn: (row) => row?.is_active ?? false,
        cell: ({ row }) => (
          <ActiveToggleCell
            id={row.original.id}
            isActive={row.original.is_active}
            toggleStatus={toggleStatus}
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
