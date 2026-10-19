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

export const useBlogPostColumns = ({ onEdit, onDelete, storeId, canEdit = true, canDelete = true }) => {
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
        meta: { headerTitle: "Select" },
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
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-foreground" title={row?.original?.title || "Untitled"}>
                {row?.original?.title || "Untitled"}
              </span>
              <span className="truncate text-sm text-muted-foreground">
                {excerpt || "No excerpt"}
              </span>
            </div>
          );
        },
        enableSorting: true,
        size: 300,
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
        id: "tags",
        header: ({ column }) => (
          <DataGridColumnHeader title="Category / Tags" column={column} />
        ),
        accessorFn: (row) => (row?.tags || []).join(", ") || "-",
        cell: ({ row }) => (
          <TruncatedText value={(row?.original?.tags || []).join(", ") || "-"} />
        ),
        size: 160,
        meta: { headerTitle: "Category / Tags", truncate: true },
      },
      {
        id: "author",
        header: ({ column }) => (
          <DataGridColumnHeader title="Author" column={column} />
        ),
        accessorFn: (row) => row.author,
        cell: ({ row }) => <TruncatedText value={row.original.author || "-"} />,
        size: 130,
        meta: { headerTitle: "Author", truncate: true },
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
        enableHiding: false,
        size: 110,
        meta: { headerTitle: "Published" },
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
        meta: { headerTitle: "Date" },
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
                aria-label="Edit post"
                title="Edit post"
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
                aria-label="Delete post"
                title="Delete post"
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
