"use client";

import { useMemo } from "react";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Button } from "@/components/common/ui/button";
import {
  Edit2Icon,
  ExternalLinkIcon,
  EyeIcon,
  Trash2Icon,
  ImageOff,
} from "lucide-react";
import { toTitleCase } from "@/lib/utils";
import ActiveToggleCell from "@/components/common/ui/ActiveToggleCell";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/common/ui/tooltip";
import { TruncatedText } from "@/components/common/ui/short-id";

const STOREFRONT_URL =
  process.env.NEXT_PUBLIC_STOREFRONT_URL || "https://ranganijewelry.com";

export const useProductListColumns = ({
  editingCell,
  setEditingCell,
  editedValue,
  handleSaveEdit,
  onClick,
  onView,
  onEdit,
  onDelete,
  toggleStatus,
}) => {
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

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
        // The design number is what identifies a product on the storefront
        // (titles are often empty), so it is the pinned identity column.
        id: "design_no",
        header: ({ column }) => (
          <DataGridColumnHeader title="Design No" column={column} />
        ),
        accessorFn: (row) => row.design_no,
        cell: ({ row }) => (
          <TruncatedText
            value={row.original.design_no || "—"}
            className="font-medium text-foreground"
          />
        ),
        size: 140,
        meta: {
          identity: true,
          headerTitle: "Design No",
          truncate: true,
          skeleton: <Skeleton className="h-4 w-[90px]" />,
        },
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

          if (!productImage) {
            return (
              <div className="flex h-[70px] w-[55px] items-center justify-center rounded bg-muted">
                <ImageOff className="h-4 w-4 text-muted-foreground" />
              </div>
            );
          }

          return (
            <img
              src={productImage}
              className="h-[70px] w-[55px] object-cover"
              alt={
                row.original.title ||
                row.original.design_no ||
                "Product image"
              }
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
          // Truncate to a single line; full name on hover. Drag the column edge to widen.
          return <TruncatedText value={t} />;
        },
        size: 200,
        meta: { headerTitle: "Title", truncate: true },
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
        size: 110,
        meta: { headerTitle: "Shape" },
      },
      {
        id: "metal_color",
        header: ({ column }) => (
          <DataGridColumnHeader title="Metal Color" column={column} />
        ),
        accessorFn: (row) => row.metal_color,
        cell: ({ row }) => toTitleCase(row.original.metal_color) || "—",
        size: 120,
        meta: { headerTitle: "Metal Color" },
      },
      {
        id: "live_price",
        header: ({ column }) => (
          <DataGridColumnHeader title="Price (live)" column={column} />
        ),
        accessorFn: (row) => row?.live_price,
        cell: ({ row }) => {
          const v = row?.original?.live_price;
          return v != null
            ? `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            : "—";
        },
        size: 120,
        meta: { headerTitle: "Price (live)" },
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
        cell: ({ row }) => formatDate(row.original.created_at),
        size: 140,
        meta: { headerTitle: "Created At" },
      },
      {
        id: "lastUpdatedDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Last Updated" column={column} />
        ),
        accessorFn: (row) => row.updated_at,
        cell: ({ row }) => formatDate(row.original.updated_at),
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
      {
        id: "active",
        header: ({ column }) => (
          <DataGridColumnHeader title="Active" column={column} />
        ),
        accessorFn: (row) => row?.active ?? false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <ActiveToggleCell
              id={row?.original?.id}
              isActive={row?.original?.active ?? false}
              toggleStatus={toggleStatus}
            />
            {!row?.original?.has_media && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <ImageOff className="h-4 w-4 shrink-0 text-amber-600" />
                </TooltipTrigger>
                <TooltipContent>
                  Hidden from the storefront until at least one photo is
                  uploaded — Active status alone isn&apos;t enough.
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        ),
        size: 110,
        meta: { headerTitle: "Active" },
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataGridColumnHeader title="Actions" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              mode="icon"
              size="sm"
              onClick={() => onView(row.original)}
              aria-label={`View ${row.original.design_no || "product"}`}
              title="View"
            >
              <EyeIcon className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              mode="icon"
              size="sm"
              asChild
              aria-label={`View ${row.original.design_no || "product"} on storefront`}
              title="View on Storefront"
            >
              <a
                href={`${STOREFRONT_URL}/product/${row.original.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLinkIcon className="h-3.5 w-3.5" />
              </a>
            </Button>
            {onEdit && (
              <Button
                variant="outline"
                mode="icon"
                size="sm"
                onClick={() => onEdit(row.original)}
                aria-label={`Edit ${row.original.design_no || "product"}`}
                title="Edit"
              >
                <Edit2Icon className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                mode="icon"
                size="sm"
                onClick={() => onDelete(row.original.id)}
                aria-label={`Delete ${row.original.design_no || "product"}`}
                title="Delete"
              >
                <Trash2Icon className="h-3.5 w-3.5 text-red-500" />
              </Button>
            )}
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 172,
        meta: { headerTitle: "Actions" },
      },
    ],
    [
      editingCell,
      setEditingCell,
      editedValue,
      handleSaveEdit,
      onView,
      onEdit,
      onDelete,
      onClick,
      toggleStatus,
    ]
  );

  return { columns };
};
