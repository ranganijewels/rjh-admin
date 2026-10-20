"use client";

import { useMemo, useState } from "react";
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
import { cn, toTitleCase } from "@/lib/utils";
import ActiveToggleCell from "@/components/common/ui/ActiveToggleCell";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/common/ui/tooltip";
import { TruncatedText } from "@/components/common/ui/short-id";

const STOREFRONT_URL =
  process.env.NEXT_PUBLIC_STOREFRONT_URL || "https://ranganijewelry.com";

/**
 * Product thumbnail with a graceful fallback.
 *
 * Catalogue media is served from signed URLs that can expire or 401 — a
 * broken image icon in every row would be worse than the placeholder.
 */
function ProductThumb({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-11 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
        <ImageOff className="size-4 text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-11 w-9 shrink-0 rounded-md object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export const useProductListColumns = ({
  editingCell,
  setEditingCell,
  editedValue,
  handleSaveEdit,
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
        // Thumbnail + name in a single pinned cell. Catalogue rows often have
        // no title, so the design number doubles as the display name and the
        // category sits underneath as context.
        id: "product",
        header: ({ column }) => (
          <DataGridColumnHeader title="Product" column={column} />
        ),
        accessorFn: (row) => row.title || row.design_no || "",
        cell: ({ row }) => {
          const { title, design_no, category, product_image } = row.original;
          const name = toTitleCase(title) || design_no || "—";
          // The design number is the row's real identity, so it always shows
          // — under the name when there is one, otherwise as the name itself
          // (with the category underneath).
          const sub = title && design_no ? design_no : toTitleCase(category);

          return (
            <div className="flex items-center gap-3">
              <ProductThumb src={product_image} alt={name} />
              <div className="min-w-0">
                <TruncatedText
                  value={name}
                  className="font-medium text-foreground"
                />
                {sub && (
                  <p
                    className={cn(
                      "truncate text-xs text-muted-foreground",
                      title && design_no && "font-mono"
                    )}
                  >
                    {sub}
                  </p>
                )}
              </div>
            </div>
          );
        },
        size: 220,
        meta: {
          identity: true,
          headerTitle: "Product",
          truncate: true,
          skeleton: <Skeleton className="h-11 w-[220px]" />,
        },
      },
      {
        id: "category",
        header: ({ column }) => (
          <DataGridColumnHeader title="Category" column={column} />
        ),
        accessorFn: (row) => row.category,
        cell: ({ row }) => toTitleCase(row.original.category) || "—",
        size: 110,
        meta: { headerTitle: "Category" },
      },
      {
        id: "style",
        header: ({ column }) => (
          <DataGridColumnHeader title="Style" column={column} />
        ),
        accessorFn: (row) => row.style,
        cell: ({ row }) => toTitleCase(row.original.style) || "—",
        size: 100,
        meta: { headerTitle: "Style" },
      },
      {
        id: "shape",
        header: ({ column }) => (
          <DataGridColumnHeader title="Shape" column={column} />
        ),
        accessorFn: (row) => row.shape,
        cell: ({ row }) => row.original.shape || "—",
        size: 100,
        meta: { headerTitle: "Shape" },
      },
      {
        id: "metal_color",
        header: ({ column }) => (
          <DataGridColumnHeader title="Metal Color" column={column} />
        ),
        accessorFn: (row) => row.metal_color,
        cell: ({ row }) => toTitleCase(row.original.metal_color) || "—",
        size: 110,
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
        size: 110,
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
        size: 120,
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
        size: 100,
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
      toggleStatus,
    ]
  );

  return { columns };
};
