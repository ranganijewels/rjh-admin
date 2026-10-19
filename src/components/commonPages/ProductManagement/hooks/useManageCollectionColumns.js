"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation"; // ✅ for navigation
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Button } from "@/components/common/ui/button";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toTitleCase } from "@/lib/utils";
import ActiveToggleCell from "@/components/common/ui/ActiveToggleCell";
import { StatusBadge } from "@/components/common/ui/badge";
import { ShortId, TruncatedText } from "@/components/common/ui/short-id";

export const useManageCollectionColumns = ({
  editingCell,
  setEditingCell,
  editedValue,
  handleSaveEdit,
  onClick,
  onView,
} = {}) => {
  const router = useRouter();

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: ({ column }) => (
          <DataGridColumnHeader title="ID" column={column} />
        ),
        accessorFn: (row) => row.id,
        cell: ({ row }) => (
          <ShortId value={row.original.id} label="Collection ID" />
        ),
        size: 130,
        meta: { headerTitle: "ID" },
      },
      {
        id: "collection",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Collection"
            column={column}
            onClick={() => onClick?.("collection")}
          />
        ),
        accessorFn: (row) => row.name,
        cell: ({ row }) => (
          <TruncatedText
            value={row.original.name || "—"}
            className="font-medium text-foreground"
          />
        ),
        enableSorting: true,
        size: 230,
        meta: {
          identity: true,
          headerTitle: "Collection",
          truncate: true,
          skeleton: <Skeleton className="h-4 w-[125px]" />,
        },
      },
      {
        id: "description",
        header: ({ column }) => (
          <DataGridColumnHeader title="Description" column={column} />
        ),
        accessorFn: (row) => row.description,
        cell: ({ row }) => (
          <TruncatedText value={toTitleCase(row.original.description) || "—"} />
        ),
        size: 280,
        meta: { headerTitle: "Description", truncate: true },
      },
      {
        id: "createdAt",
        header: ({ column }) => (
          <DataGridColumnHeader title="Created At" column={column} />
        ),
        accessorFn: (row) => row.createdAt,
        cell: ({ row }) =>
          row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "—",
        size: 140,
        meta: { headerTitle: "Created At" },
      },
      {
        id: "is_active",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        accessorFn: (row) => row.status === "active",
        cell: ({ row }) => (
          <ActiveToggleCell
            id={row.original.id}
            isActive={row.original.status === "active"}
            toggleStatus={() => console.log("Toggle", row.original.id)}
          />
        ),
        size: 110,
        meta: { headerTitle: "Status" },
      },
      {
        id: "visibility",
        header: ({ column }) => (
          <DataGridColumnHeader title="Visibility" column={column} />
        ),
        // Backend Collection entity only has one `status` field, no separate
        // visibility concept — mirrors the Status column.
        accessorFn: (row) => (row.status === "active" ? "published" : "draft"),
        cell: ({ row }) => {
          const isPublished = row.original.status === "active";
          return (
            <StatusBadge
              status={isPublished ? "published" : "draft"}
              appearance="light"
            />
          );
        },
        size: 120,
        meta: { headerTitle: "Visibility" },
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataGridColumnHeader title="Actions" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex gap-[5px]">
            <Button
              variant="outline"
              mode="icon"
              aria-label={`Add products to ${row.original.name || "collection"}`}
              title="Add products"
              onClick={() =>
                router.push(
                  `/dashboard/product-management/manage-collection/${row.original.id}`
                )
              }
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              mode="icon"
              aria-label={`Delete ${row.original.name || "collection"}`}
              title="Delete collection"
              onClick={() => console.log("Delete", row.original.id)}
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 110,
        meta: { headerTitle: "Actions" },
      },
    ],
    [
      editingCell,
      setEditingCell,
      editedValue,
      handleSaveEdit,
      onView,
      onClick,
      router,
    ]
  );

  return columns;
};
