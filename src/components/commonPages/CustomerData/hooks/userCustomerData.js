import { useMemo } from "react";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import { Skeleton } from "@/components/common/ui/skeleton";

export const useCustomerData = () => {
  return useMemo(
    () => [
      // {
      //   accessorKey: "id",
      //   header: () => <DataGridTableRowSelectAll />,
      //   cell: ({ row }) => <DataGridTableRowSelect row={row} />,
      //   enableSorting: false,
      //   enableHiding: false,
      //   size: 30,
      // },
      {
        id: "id",
        header: ({ column }) => (
          <DataGridColumnHeader title="Customer Id" column={column} />
        ),
        accessorFn: (row) => row.id,
        cell: ({ row }) => (
          <span className="text-sm font-medium">{row.getValue("id")}</span>
        ),
        enableSorting: false,
        size: 40,
        meta: {
          skeleton: <Skeleton className="h-4 w-[125px]" />,
        },
      },
      {
        id: "firstName",
        header: ({ column }) => (
          <DataGridColumnHeader title="First Name" column={column} />
        ),
        accessorFn: (row) => row.firstName,
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {row.getValue("firstName")}
          </span>
        ),
        enableSorting: true,
        size: 80,
        meta: {
          skeleton: <Skeleton className="h-4 w-[125px]" />,
        },
      },
      {
        id: "lastName",
        header: ({ column }) => (
          <DataGridColumnHeader title="Last Name" column={column} />
        ),
        accessorFn: (row) => row.lastName,
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {row.getValue("lastName")}
          </span>
        ),
        enableSorting: true,
        size: 80,
        meta: {
          skeleton: <Skeleton className="h-4 w-[125px]" />,
        },
      },
      {
        id: "email",
        header: ({ column }) => (
          <DataGridColumnHeader title="Email ID" column={column} />
        ),
        accessorFn: (row) => row.email,
        cell: ({ row }) => {
          const t = row.getValue("email");
          return (
            <span title={t} className="block truncate">
              {t}
            </span>
          );
        },
        size: 230,
        meta: {
          skeleton: <Skeleton className="h-4 w-[100px]" />,
        },
      },
    ],
    []
  );
};
