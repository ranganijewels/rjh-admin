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
import { useCrudApi } from "@/hooks/useCrudApi";

export const useBlogCategoriesColumns = ({ onEdit, onDelete, storeId, canEdit = true, canDelete = true }) => {
  const { toggleStatus } = useCrudApi(`/api/cms/blog/${storeId}/categories`);

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
        id: "category",
        header: ({ column }) => (
          <DataGridColumnHeader title="Category" column={column} />
        ),
        accessorFn: (row) => row.valueLabel,
        cell: ({ row }) => (
          <TruncatedText value={row.original.valueLabel} className="font-medium text-foreground" />
        ),
        size: 230,
        meta: { headerTitle: "Category", identity: true, truncate: true },
      },
      {
        id: "description",
        header: ({ column }) => (
          <DataGridColumnHeader title="Description" column={column} />
        ),
        accessorFn: (row) => row.description || "-",
        cell: ({ row }) => <TruncatedText value={row.original.description || "-"} />,
        size: 280,
        meta: { headerTitle: "Description", truncate: true },
      },
      {
        id: "is_active",
        header: ({ column }) => (
          <DataGridColumnHeader title="Active" column={column} />
        ),
        accessorFn: (row) => row?.isActive ?? false,
        cell: ({ row }) => (
          <ActiveToggleCell
            id={row.original.id}
            isActive={row.original.isActive}
            toggleStatus={toggleStatus}
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
            {canEdit && (
              <Button
                mode="icon"
                variant="outline"
                aria-label="Edit category"
                title="Edit category"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit?.(row?.original);
                }}
              >
                <Edit2Icon />
              </Button>
            )}
            {canDelete && (
              <Button
                mode="icon"
                variant="outline"
                className="!cursor-pointer"
                aria-label="Delete category"
                title="Delete category"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete?.(row?.original?.id);
                }}
              >
                <RiDeleteBin5Line />
              </Button>
            )}
          </div>
        ),
        enableHiding: false,
        size: 110,
        meta: { headerTitle: "Actions" },
      },
    ];
  }, [onEdit, onDelete, canEdit, canDelete, toggleStatus]);
};
