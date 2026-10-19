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
import { ShortId, TruncatedText } from "@/components/common/ui/short-id";

export const userDepartments = ({ onEdit, onDelete }) => {
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
        id: "id",
        header: ({ column }) => (
          <DataGridColumnHeader title="ID" column={column} />
        ),
        accessorFn: (row) => row.id,
        cell: ({ row }) => (
          <ShortId value={row.getValue("id")} label="Department ID" />
        ),
        size: 130,
        enableSorting: false,
        meta: {
          identity: true,
          headerTitle: "ID",
          skeleton: <Skeleton className="h-4 w-[60px]" />,
        },
      },
      {
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Department Name" column={column} />
        ),
        accessorFn: (row) => row.name,
        cell: ({ row }) => (
          <TruncatedText
            value={row.getValue("name")}
            className="font-medium text-foreground"
          />
        ),
        size: 260,
        enableSorting: false,
        meta: {
          headerTitle: "Department Name",
          truncate: true,
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
              aria-label={`Edit ${row.original.name || "department"}`}
              title="Edit department"
              onClick={(event) => {
                event.stopPropagation();
                onEdit && onEdit(row.original);
              }}
            >
              <Edit2Icon />
            </Button>
            <Button
              mode="icon"
              variant="outline"
              className="!cursor-pointer"
              aria-label={`Delete ${row.original.name || "department"}`}
              title="Delete department"
              onClick={(event) => {
                event.stopPropagation();
                onDelete && onDelete(row.original.id);
              }}
            >
              <RiDeleteBin5Line />
            </Button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 100,
        meta: { headerTitle: "Action" },
      },
    ],
    [onEdit, onDelete]
  );
};
