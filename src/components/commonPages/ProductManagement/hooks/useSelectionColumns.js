"use client";

import { useMemo } from "react";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";
import { Skeleton } from "@/components/common/ui/skeleton";
import { toTitleCase } from "@/lib/utils";
import { TruncatedText } from "@/components/common/ui/short-id";

export const useSelectionColumns = ({
  editingCell,
  setEditingCell,
  editedValue,
  handleSaveEdit,
  onClick,
  onView,
}) => {
  const columns = useMemo(
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
        id: "id",
        header: ({ column }) => (
          <DataGridColumnHeader title="ID" column={column} />
        ),
        accessorFn: (row) => row.id,
        cell: ({ row }) => <TruncatedText value={row.original.id || "—"} />,
        size: 130,
        meta: { headerTitle: "ID" },
      },
      {
        id: "product_image",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Image"
            column={column}
            onClick={() => onClick("image")}
          />
        ),
        accessorFn: (row) => row.product_image,
        cell: ({ row }) => {
          const productImage = row.original.product_image;

          return (
            <img
              src={productImage || "/images/products/1.png"}
              className="h-[50px] w-[50px] rounded object-cover"
              alt={row.original.title || "Product image"}
              onError={(e) => {
                e.currentTarget.src = "/images/products/1.png";
              }}
            />
          );
        },
        enableSorting: true,
        size: 100,
        meta: {
          headerTitle: "Image",
          skeleton: <Skeleton className="h-4 w-[125px]" />,
        },
      },
      {
        id: "title",
        header: ({ column }) => (
          <DataGridColumnHeader title="Title" column={column} />
        ),
        accessorFn: (row) => row.title,
        cell: ({ row }) => {
          const t = toTitleCase(row.original.title) || "-";
          return <TruncatedText value={t} />;
        },
        size: 230,
        meta: { headerTitle: "Title", identity: true, truncate: true },
      },
      {
        id: "design_no",
        header: ({ column }) => (
          <DataGridColumnHeader title="Design No" column={column} />
        ),
        accessorFn: (row) => row.design_no,
        cell: ({ row }) => <TruncatedText value={row.original.design_no || "—"} />,
        size: 130,
        meta: { headerTitle: "Design No", truncate: true },
      },
      {
        id: "category",
        header: ({ column }) => (
          <DataGridColumnHeader title="Category" column={column} />
        ),
        accessorFn: (row) => row.category,
        cell: ({ row }) => toTitleCase(row.original.category) || "—",
        size: 130,
        meta: { headerTitle: "Category" },
      },
      {
        id: "style",
        header: ({ column }) => (
          <DataGridColumnHeader title="Style" column={column} />
        ),
        accessorFn: (row) => row.style,
        cell: ({ row }) => toTitleCase(row.original.style) || "—",
        size: 120,
        meta: { headerTitle: "Style" },
      },
      {
        id: "shape",
        header: ({ column }) => (
          <DataGridColumnHeader title="Shape" column={column} />
        ),
        accessorFn: (row) => row.shape,
        cell: ({ row }) => row.original.shape || "—",
        size: 120,
        meta: { headerTitle: "Shape" },
      },
      {
        id: "base_price",
        header: ({ column }) => (
          <DataGridColumnHeader title="Base Price" column={column} />
        ),
        accessorFn: (row) => row?.base_price,
        cell: ({ row }) => {
          return `$${row?.original?.base_price || 0}`;
        },
        size: 120,
        meta: { headerTitle: "Base Price" },
      },
      {
        id: "salesPrice",
        header: ({ column }) => (
          <DataGridColumnHeader title="Sales Price" column={column} />
        ),
        accessorFn: (row) => row.sales_price,
        cell: ({ row }) => `$${row.original.sales_price || 0}`,
        size: 120,
        meta: { headerTitle: "Sales Price" },
      },
      {
        id: "collection",
        header: ({ column }) => (
          <DataGridColumnHeader title="Collection" column={column} />
        ),
        accessorFn: (row) => row.collection,
        cell: ({ row }) => toTitleCase(row.original.collection) || "—",
        size: 140,
        meta: { headerTitle: "Collection" },
      },
      {
        id: "createdAt",
        header: ({ column }) => (
          <DataGridColumnHeader title="Created At" column={column} />
        ),
        accessorFn: (row) => row.created_at,
        cell: ({ row }) =>
          row.original.created_at
            ? new Date(row.original.created_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "—",
        size: 140,
        meta: { headerTitle: "Created At" },
      },
      {
        id: "lastUpdatedDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Last Updated" column={column} />
        ),
        accessorFn: (row) => row.updated_at,
        cell: ({ row }) =>
          row.original.updated_at
            ? new Date(row.original.updated_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "—",
        size: 140,
        meta: { headerTitle: "Last Updated" },
      },
      {
        id: "gender",
        header: ({ column }) => (
          <DataGridColumnHeader title="Gender" column={column} />
        ),
        accessorFn: (row) => row.gender,
        cell: ({ row }) => toTitleCase(row.original.gender) || "—",
        size: 100,
        meta: { headerTitle: "Gender" },
      },
    ],
    [editingCell, setEditingCell, editedValue, handleSaveEdit, onView, onClick]
  );

  return columns;
};
