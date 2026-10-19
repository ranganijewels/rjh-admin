"use client";

import { useMemo } from "react";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Button } from "@/components/common/ui/button";
import { ShoppingCart } from "lucide-react";
import { TruncatedText } from "@/components/common/ui/short-id";

export const useStockSelections = ({ onClick, onView }) => {
  return useMemo(
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
        id: "variantsimg",
        header: ({ column }) => (
          <DataGridColumnHeader title="Variants" column={column} />
        ),
        accessorFn: (row) => row.image,
        cell: ({ row }) =>
          row.original.image ? (
            <img
              src={row.original.image}
              alt={row.original.title || "Variant image"}
              className="h-[50px] w-[50px] rounded object-cover"
            />
          ) : (
            <span className="text-muted-foreground">N/A</span>
          ),
        enableSorting: true,
        size: 100,
        meta: {
          headerTitle: "Variants",
          skeleton: <Skeleton className="h-4 w-[125px]" />,
        },
      },
      {
        id: "designno",
        header: ({ column }) => (
          <DataGridColumnHeader title="Design No" column={column} />
        ),
        accessorFn: (row) => row.designno,
        cell: ({ row }) => <TruncatedText value={row.original.designno || "—"} />,
        size: 140,
        meta: { headerTitle: "Design No", truncate: true },
      },
      {
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Name" column={column} />
        ),
        accessorFn: (row) => row?.title,
        cell: ({ row }) => (
          <TruncatedText
            value={row?.original?.title}
            className="font-medium text-foreground"
          />
        ),
        enableSorting: true,
        size: 240,
        meta: { headerTitle: "Name", identity: true, truncate: true },
      },
      {
        id: "base_price",
        header: ({ column }) => (
          <DataGridColumnHeader title="Base Price" column={column} />
        ),
        accessorFn: (row) => row.base_price,
        cell: ({ row }) => <span>{row?.original?.base_price ?? "—"}</span>,
        size: 130,
        meta: { headerTitle: "Base Price" },
      },
      {
        id: "store_margin",
        header: ({ column }) => (
          <DataGridColumnHeader title="Default Margin" column={column} />
        ),
        accessorFn: (row) => row.store_margin,
        cell: ({ row }) => <span>{row?.original?.store_margin ?? "—"}</span>,
        size: 140,
        meta: { headerTitle: "Default Margin" },
      },
      {
        id: "selling_price",
        header: ({ column }) => (
          <DataGridColumnHeader title="Selling Price" column={column} />
        ),
        accessorFn: (row) => row.selling_price,
        cell: ({ row }) => row.original.selling_price ?? "—",
        size: 130,
        meta: { headerTitle: "Selling Price" },
      },
      {
        id: "metal",
        header: ({ column }) => (
          <DataGridColumnHeader title="Metal" column={column} />
        ),
        accessorFn: (row) => row?.metal_color,
        cell: ({ row }) => {
          const metals = Array.isArray(row?.original?.metal_color)
            ? row?.original?.metal_color
            : typeof row?.original?.metal_color === "string"
            ? [row?.original?.metal_color]
            : [];

          const colorMap = {
            WHITE: "#ced0d0",
            YELLOW: "#dfc180",
            ROSE: "#d4a88b",
            "WHITE/YELLOW": "linear-gradient(135deg, #ced0d0 50%, #dfc180 50%)",
            "WHITE/ROSE": "linear-gradient(135deg, #ced0d0 50%, #d4a88b 50%)",
          };

          const getBackground = (value) => {
            if (!value) return "#ccc";
            const upper = value.toUpperCase();
            if (colorMap[upper]) return colorMap[upper];

            if (upper.includes("/")) {
              const [first, second] = upper.split("/");
              return `linear-gradient(135deg, ${
                colorMap[first] || "#ccc"
              } 50%, ${colorMap[second] || "#ccc"} 50%)`;
            }
            return colorMap[upper] || "#ccc";
          };

          return (
            <div className="flex gap-1">
              {metals?.map((color, index) => (
                <div
                  key={`${
                    row.original.product_id || row.original.variant_id || row.id
                  }-${index}`}
                  title={color}
                  aria-label={`Metal color: ${color || "unknown"}`}
                  className="h-[18px] w-[18px] rounded-sm border border-gray-300 dark:border-border"
                  style={{
                    background: getBackground(color),
                  }}
                ></div>
              ))}
            </div>
          );
        },
        size: 135,
        meta: { headerTitle: "Metal" },
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataGridColumnHeader title="Actions" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 px-3 py-1 text-sm"
              onClick={() => onClick(row)}
              aria-label={`Add ${
                row.original.title || row.original.designno || "product"
              } to bag`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Add to Bag</span>
            </Button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 150,
        meta: { headerTitle: "Actions" },
      },
    ],
    [onView, onClick]
  );
};
