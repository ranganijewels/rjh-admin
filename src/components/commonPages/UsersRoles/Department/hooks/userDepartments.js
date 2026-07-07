import { useMemo } from "react";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Button } from "@/components/common/ui/button";
import { Edit2Icon } from "lucide-react";
import { RiDeleteBin5Line } from "@remixicon/react";

export const userDepartments = ({ onEdit, onDelete }) => {
  return useMemo(
    () => [
      // {
      //   accessorKey: "select",
      //   header: () => <DataGridTableRowSelectAll />,
      //   cell: ({ row }) => <DataGridTableRowSelect row={row} />,
      //   enableSorting: false,
      //   enableHiding: false,
      //   size: 30,
      // },
      {
        id: "id",
        header: ({ column }) => (
          <DataGridColumnHeader title="ID" column={column} />
        ),
        accessorFn: (row) => row.id,
        cell: ({ row }) => (
          <span className="text-sm font-medium">{row.getValue("id")}</span>
        ),
        size: 100,
        enableSorting: false,
        meta: {
          skeleton: <Skeleton className="h-4 w-[60px]" />,
        },
      },
      {
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Department Name" column={column} />
        ),
        accessorFn: (row) => row.name,
        cell: ({ row }) => {
          const t = row.getValue("name");
          return (
            <span
              title={t}
              className="block truncate text-sm font-medium"
            >
              {t}
            </span>
          );
        },
        size: 230,
        enableSorting: false,
        meta: {
          skeleton: <Skeleton className="h-4 w-[125px]" />,
        },
      },
      {
        id: "action",
        header: ({ column }) => (
          <DataGridColumnHeader title="Action" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex gap-2.5">
            <Button
              mode="icon"
              variant="outline"
              onClick={() => onEdit && onEdit(row.original)}
            >
              <Edit2Icon />
            </Button>
            <Button
              mode="icon"
              variant="outline"
              className="!cursor-pointer"
              onClick={() => onDelete && onDelete(row.original.id)}
            >
              <RiDeleteBin5Line />
            </Button>
          </div>
        ),
        size: 120,
        enableSorting: false,
      },
    ],
    [onEdit, onDelete]
  );
};
