import { useMemo } from "react";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Button } from "@/components/common/ui/button";
import { TruncatedText } from "@/components/common/ui/short-id";

export const useBrowseColumns = ({ onClick, onView }) => {
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
        id: "image",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Variant Image"
            column={column}
            onClick={() => onClick("Variants")}
          />
        ),
        accessorFn: (row) => row.image,
        cell: ({ row }) => {
          const src = row.original.data
            ? row.original.data.product[0]?.image
            : row.original.image;
          return src ? (
            <img
              src={src}
              alt={row.original.category || "Variant image"}
              className="h-[50px] w-[50px] rounded object-cover"
            />
          ) : (
            <span className="text-muted-foreground">N/A</span>
          );
        },
        enableSorting: true,
        size: 110,
        meta: {
          headerTitle: "Variant Image",
          skeleton: <Skeleton className="h-4 w-[125px]" />,
        },
      },
      {
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Variant Name" column={column} />
        ),
        accessorFn: (row) => row.category,
        cell: ({ row }) => (
          <TruncatedText
            value={row.original.category}
            className="font-medium text-foreground"
          />
        ),
        enableSorting: true,
        size: 200,
        meta: { headerTitle: "Variant Name", identity: true, truncate: true },
      },
      {
        id: "base_price",
        header: ({ column }) => (
          <DataGridColumnHeader title="Base Price" column={column} />
        ),
        accessorFn: (row) => row.baseprice,
        cell: ({ row }) => <span>{row.original.baseprice ?? "—"}</span>,
        size: 130,
        meta: { headerTitle: "Base Price" },
      },
      {
        id: "selling_price",
        header: ({ column }) => (
          <DataGridColumnHeader title="Selling Price" column={column} />
        ),
        accessorFn: (row) => row.selling_price,
        cell: ({ row }) => <span>{row.original.selling_price ?? "—"}</span>,
        size: 130,
        meta: { headerTitle: "Selling Price" },
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
                  className="flex h-[18px] w-[18px] items-center justify-center rounded-sm border border-gray-400 dark:border-border"
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
        meta: { headerTitle: "Metal" },
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataGridColumnHeader title="Actions" column={column} />
        ),
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(row.original)}
            aria-label={`Add ${row.original.category || "variant"} to cart`}
          >
            Add to Cart
          </Button>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 130,
        meta: { headerTitle: "Actions" },
      },
    ],
    [onView, onClick]
  );
};
