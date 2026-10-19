'use client";';
import { useMemo } from "react";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Button } from "@/components/common/ui/button";
import { ShoppingCart } from "lucide-react";

export const useStockSelections = ({ onClick, onView }) => {
  return useMemo(
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
        id: "variantsimg",
        header: ({ column }) => (
          <DataGridColumnHeader title="Variants" column={column} />
        ),
        accessorFn: (row) => row.image,
        cell: ({ row }) => (
          <img src={row.original.image} className="w-[50px] h-[50px]" />
        ),
        enableSorting: true,
        size: 100,
        meta: {
          skeleton: <Skeleton className="h-4 w-[125px]" />,
        },
      },
      {
        id: "designno",
        header: ({ column }) => (
          <DataGridColumnHeader title="Design No" column={column} />
        ),
        accessorFn: (row) => row.designno,
        cell: ({ row }) => {
          return row.original.designno;
        },
        size: 120,
      },
      {
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Name" column={column} />
        ),
        accessorFn: (row) => row?.title,
        cell: ({ row }) => (
          <span title={row?.original?.title} className="block truncate">
            {row?.original?.title}
          </span>
        ),
        enableSorting: true,
        size: 230,
      },
      {
        id: "base_price",
        header: ({ column }) => (
          <DataGridColumnHeader title="Base Price" column={column} />
        ),
        accessorFn: (row) => row.base_price,
        cell: ({ row }) => <span>{row?.original?.base_price}</span>,
        size: 135,
      },
      {
        id: "store_margin",
        header: ({ column }) => (
          <DataGridColumnHeader title="Default Margin " column={column} />
        ),
        accessorFn: (row) => row.store_margin,
        cell: ({ row }) => <span>{row?.original?.store_margin}</span>,
        size: 135,
      },
      {
        id: "selling_price",
        header: ({ column }) => (
          <DataGridColumnHeader title="Selling Price" column={column} />
        ),
        accessorFn: (row) => row.selling_price,
        cell: ({ row }) => row.original.selling_price,
        size: 135,
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
                  className="w-[18px] h-[18px] rounded-sm border border-gray-300 dark:border-border"
                  style={{
                    background: getBackground(color),
                  }}
                ></div>
              ))}
            </div>
          );
        },
        size: 135,
      },
      {
        id: "actions",
        header: "Actions",
        pin: "right",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 px-3 py-1 text-sm"
              onClick={() => onClick(row)}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Add to Bag</span>
            </Button>
          </div>
        ),
        size: 150,
      },
    ],
    [onView, onClick]
  );
};
