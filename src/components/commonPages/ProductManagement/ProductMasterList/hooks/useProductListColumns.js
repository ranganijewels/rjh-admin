"use client";

import { useMemo } from "react";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Button } from "@/components/common/ui/button";
import { Edit2Icon, ExternalLinkIcon, EyeIcon, Trash2Icon, ImageOff } from "lucide-react";
import { toTitleCase } from "@/lib/utils";
import ActiveToggleCell from "@/components/common/ui/ActiveToggleCell";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/common/ui/tooltip";

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
        size: 48,
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
              <div className="w-[55px] h-[70px] flex items-center justify-center bg-muted rounded">
                <ImageOff className="h-4 w-4 text-muted-foreground" />
              </div>
            );
          }

          return (
            <img
              src={productImage}
              className="w-[55px] h-[70px] object-cover"
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
          return (
            <span title={t} className="block truncate">
              {t}
            </span>
          );
        },
        size: 240,
      },
      {
        id: "design_no",
        header: ({ column }) => (
          <DataGridColumnHeader title="Design No" column={column} />
        ),
        accessorFn: (row) => row.design_no,
        cell: ({ row }) => row.original.design_no,
        size: 120,
      },
      {
        id: "category",
        header: ({ column }) => (
          <DataGridColumnHeader title="Category" column={column} />
        ),
        accessorFn: (row) => row.category,
        cell: ({ row }) => toTitleCase(row.original.category),
        size: 120,
      },
      {
        id: "style",
        header: ({ column }) => (
          <DataGridColumnHeader title="Style" column={column} />
        ),
        accessorFn: (row) => row.style,
        cell: ({ row }) => toTitleCase(row.original.style),
        size: 120,
      },
      {
        id: "shape",
        header: ({ column }) => (
          <DataGridColumnHeader title="Shape" column={column} />
        ),
        accessorFn: (row) => row.shape,
        cell: ({ row }) => row.original.shape || "-",
        size: 110,
      },
      {
        id: "metal_color",
        header: ({ column }) => (
          <DataGridColumnHeader title="Metal Color" column={column} />
        ),
        accessorFn: (row) => row.metal_color,
        cell: ({ row }) => toTitleCase(row.original.metal_color) || "-",
        size: 110,
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
      },
      {
        id: "collection",
        header: ({ column }) => (
          <DataGridColumnHeader title="Collection" column={column} />
        ),
        accessorFn: (row) => row.collection,
        cell: ({ row }) => toTitleCase(row.original.collection),
        size: 140,
      },
      {
        id: "createdAt",
        header: ({ column }) => (
          <DataGridColumnHeader title="Created At" column={column} />
        ),
        accessorFn: (row) => row.created_at,
        cell: ({ row }) => formatDate(row.original.created_at),
        size: 160,
      },
      {
        id: "lastUpdatedDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Last Updated" column={column} />
        ),
        accessorFn: (row) => row.updated_at,
        cell: ({ row }) => formatDate(row.original.updated_at),
        size: 160,
      },
      {
        id: "gender",
        header: ({ column }) => (
          <DataGridColumnHeader title="Gender" column={column} />
        ),
        accessorFn: (row) => row.gender,
        cell: ({ row }) => toTitleCase(row.original.gender),
        size: 100,
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
                  <ImageOff className="h-4 w-4 text-amber-600 shrink-0" />
                </TooltipTrigger>
                <TooltipContent>
                  Hidden from the storefront until at least one photo is
                  uploaded — Active status alone isn&apos;t enough.
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        ),
        size: 120,
      },
      {
        id: "actions",
        header: "",
        pinning: "right",
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-[10px] bg-white dark:bg-card opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="outline"
              mode="icon"
              onClick={() => onView(row.original)}
              title="View"
            >
              <EyeIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              mode="icon"
              asChild
              title="View on Storefront"
            >
              <a
                href={`${STOREFRONT_URL}/product/${row.original.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLinkIcon className="h-4 w-4" />
              </a>
            </Button>
            {onEdit && (
              <Button
                variant="outline"
                mode="icon"
                onClick={() => onEdit(row.original)}
                title="Edit"
              >
                <Edit2Icon className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                mode="icon"
                onClick={() => onDelete(row.original.id)}
                title="Delete"
              >
                <Trash2Icon className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        ),
        size: 180,
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
