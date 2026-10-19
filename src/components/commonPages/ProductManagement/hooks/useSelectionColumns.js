// "use client";

// import { useMemo } from "react";
// import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
// import { Button } from "@/components/common/ui/button";
// import { PlusIcon, Trash2Icon } from "lucide-react";
// import { StatusBadge } from "@/components/common/ui/badge";

// export const useSelectionColumns = (bestSellerIds = [], onView) => {
//   const columns = useMemo(
//     () => [
//       {
//         id: "category",
//         header: ({ column }) => (
//           <DataGridColumnHeader title="Collection ID" column={column} />
//         ),
//         accessorFn: (row) => row.category,
//         cell: ({ row }) => row.original.category || "-",
//         size: 100,
//       },
//       {
//         id: "storeId",
//         header: ({ column }) => (
//           <DataGridColumnHeader title="Store ID" column={column} />
//         ),
//         accessorFn: (row) => row.storeId,
//         cell: ({ row }) => row.original.storeId || "-",
//         size: 100,
//       },
//       {
//         id: "productIds",
//         header: ({ column }) => (
//           <DataGridColumnHeader title="Product IDs" column={column} />
//         ),
//         accessorFn: (row) => row.productIds.join(", "),
//         cell: ({ row }) => {
//           const ids = row.original.productIds || [];
//           return (
//             <div className="flex flex-wrap gap-1">
//               {ids.map((id) => (
//                 <StatusBadge
//                   key={id}
//                   size="sm"
//                   appearance={bestSellerIds.includes(id) ? "solid" : "outline"}
//                   status={`#${id}`}
//                 />
//               ))}
//             </div>
//           );
//         },
//         size: 200,
//       },
//       {
//         id: "sortOrder",
//         header: ({ column }) => (
//           <DataGridColumnHeader title="Sort Order" column={column} />
//         ),
//         accessorFn: (row) => row.sortOrder,
//         cell: ({ row }) => row.original.sortOrder ?? "-",
//         size: 80,
//       },
//       {
//         id: "actions",
//         header: "Actions",
//         cell: ({ row }) => (
//           <div className="flex gap-2">
//             <Button
//               variant="outline"
//               mode="icon"
//               onClick={() => onView?.(row.original)}
//             >
//               <PlusIcon className="h-4 w-4" />
//             </Button>
//             <Button
//               variant="outline"
//               mode="icon"
//               onClick={() => console.log("Delete", row.original.collectionId)}
//             >
//               <Trash2Icon className="h-4 w-4" />
//             </Button>
//           </div>
//         ),
//         size: 100,
//       },
//     ],
//     [bestSellerIds, onView]
//   );

//   return columns;
// };

"use client";

import { useMemo } from "react";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Button } from "@/components/common/ui/button";
import { Edit2Icon, EyeIcon } from "lucide-react";
import { toTitleCase } from "@/lib/utils";

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
        size: 48,
      },
      {
        id: "id",
        header: ({ column }) => (
          <DataGridColumnHeader title="Id" column={column} />
        ),
        accessorFn: (row) => row.id,
        cell: ({ row }) => row.original.id || "-",
        size: 60,
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
              className="w-[50px] h-[50px] object-cover rounded"
              alt="product"
              onError={(e) => {
                e.currentTarget.src = "/images/products/1.png";
              }}
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
          return (
            <span title={t} className="block truncate">
              {t}
            </span>
          );
        },
        size: 230,
      },
      {
        id: "design_no",
        header: ({ column }) => (
          <DataGridColumnHeader title="Design No" column={column} />
        ),
        accessorFn: (row) => row.design_no,
        cell: ({ row }) => row.original.design_no || "-",
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
        cell: ({ row }) => row.original.shape,
        size: 120,
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
      },
      {
        id: "salesPrice",
        header: ({ column }) => (
          <DataGridColumnHeader title="Sales Price" column={column} />
        ),
        accessorFn: (row) => row.sales_price,
        cell: ({ row }) => `$${row.original.sales_price || 0}`,
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
        cell: ({ row }) =>
          row.original.created_at
            ? new Date(row.original.created_at).toLocaleDateString()
            : "-",
        size: 160,
      },
      {
        id: "lastUpdatedDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="Last Updated" column={column} />
        ),
        accessorFn: (row) => row.updated_at,
        cell: ({ row }) =>
          row.original.updated_at
            ? new Date(row.original.updated_at).toLocaleDateString()
            : "-",
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
      // {
      //   id: "actions",
      //   header: "Actions",
      //   pinning: "right",
      //   cell: ({ row }) => (
      //     <div className="flex gap-[10px]">
      //       <Button
      //         variant="outline"
      //         mode="icon"
      //         onClick={() => onView(row.original)}
      //       >
      //         <EyeIcon className="h-4 w-4" />
      //       </Button>
      //       <Button
      //         variant="outline"
      //         mode="icon"
      //         onClick={() => setEditingCell(row.original)}
      //       >
      //         <Edit2Icon className="h-4 w-4" />
      //       </Button>
      //     </div>
      //   ),
      //   size: 100,
      // },
    ],
    [editingCell, setEditingCell, editedValue, handleSaveEdit, onView, onClick]
  );

  return columns;
};
