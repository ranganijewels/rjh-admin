import { useMemo } from "react";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Button } from "@/components/common/ui/button";

export const useBrowseColumns = ({ onClick, onView }) => {
  return useMemo(
    () => [
      {
        accessorKey: "id",
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        size: 48,
      },
      {
        id: "image",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Variant Image"
            column={column}
            onClick={() => onClick("Variants")}
          />
        ),
        accessorFn: (row) => row.image,
        cell: ({ row }) => (
          <img
            src={row.original.data ? row.original.data.product[0].image : ""} // this now comes from variant
            // alt={row.original.designno}
            className="w-[50px] h-[50px] object-cover rounded"
          />
        ),
        enableSorting: true,
        size: 100,
        meta: {
          skeleton: <Skeleton className="h-4 w-[125px]" />,
        },
      },
      {
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Variant Name" column={column} />
        ),
        accessorFn: (row) => row.category,
        cell: ({ row }) => <p>{row.original.category}</p>,
        enableSorting: true,
        size: 135,
      },
      {
        id: "base_price",
        header: ({ column }) => (
          <DataGridColumnHeader title="Base Price" column={column} />
        ),
        accessorFn: (row) => row.baseprice,
        cell: ({ row }) => <span>{row.original.baseprice}</span>,
        size: 135,
      },
      {
        id: "selling_price",
        header: ({ column }) => (
          <DataGridColumnHeader title="Selling Price" column={column} />
        ),
        accessorFn: (row) => row.selling_price,
        cell: ({ row }) => <span>{row.original.selling_price}</span>,
        size: 135,
      },
      {
        id: "metal",
        header: ({ column }) => (
          <DataGridColumnHeader title="Metal" column={column} />
        ),
        accessorFn: (row) => row.metal_color,
        cell: ({ row }) => {
          const metals = Array.isArray(row.original.metal_color)
            ? row.original.metal_color
            : typeof row.original.metal_color === "string"
            ? [row.original.metal_color]
            : [];

          const colorMap = {
            WHITE: "#ffffff",
            YELLOW: "#FFD700",
            ROSE: "#E75480",
            "WHITE/YELLOW": "linear-gradient(135deg, #ffffff 50%, #FFD700 50%)",
            "WHITE/ROSE": "linear-gradient(135deg, #ffffff 50%, #E75480 50%)",
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

          const getInitial = (value) => {
            if (!value) return "?";
            if (value.includes("/")) {
              return value
                .split("/")
                .map((part) => part.trim().charAt(0).toUpperCase())
                .join("/");
            }
            return value.trim().charAt(0).toUpperCase();
          };

          return (
            <div className="flex gap-1">
              {metals.map((color, index) => (
                <div
                  key={index}
                  title={color}
                  aria-label={`Metal color: ${color || "unknown"}`}
                  className="flex items-center justify-center w-[18px] h-[18px] rounded-sm border border-gray-400 dark:border-border"
                  style={{
                    background: getBackground(color),
                  }}
                >
                  <span className="text-[8px] font-semibold leading-none text-black/70 mix-blend-difference">
                    {getInitial(color)}
                  </span>
                </div>
              ))}
            </div>
          );
        },
        size: 135,
      },
      {
        id: "actions",
        header: "Actions",
        // pinning: "right",
        cell: ({ row }) => (
          <div className="flex gap-[10px]">
            <Button
              variant="outline"
              mode="icon"
              // onClick={() => setEditingCell(row.original)}
            >
              Add to Cart
            </Button>
          </div>
        ),
        size: 100,
      },
    ],
    [onView, onClick]
  );
};
