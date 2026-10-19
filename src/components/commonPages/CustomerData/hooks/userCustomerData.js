import { useMemo } from "react";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";
import { Skeleton } from "@/components/common/ui/skeleton";
import { ShortId, TruncatedText } from "@/components/common/ui/short-id";

export const useCustomerData = () => {
  return useMemo(
    () => [
      {
        id: "select",
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        size: 48,
        meta: { headerTitle: "Select" },
      },
      {
        id: "id",
        header: ({ column }) => (
          <DataGridColumnHeader title="Customer ID" column={column} />
        ),
        accessorFn: (row) => row.id,
        cell: ({ row }) => (
          <ShortId value={row.getValue("id")} label="Customer ID" />
        ),
        enableSorting: false,
        size: 140,
        meta: {
          headerTitle: "Customer ID",
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
          <TruncatedText
            value={row.getValue("firstName")}
            className="font-medium text-foreground"
          />
        ),
        enableSorting: true,
        size: 160,
        meta: {
          headerTitle: "First Name",
          identity: true,
          truncate: true,
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
          <TruncatedText
            value={row.getValue("lastName")}
            className="font-medium text-foreground"
          />
        ),
        enableSorting: true,
        size: 160,
        meta: {
          headerTitle: "Last Name",
          truncate: true,
          skeleton: <Skeleton className="h-4 w-[125px]" />,
        },
      },
      {
        id: "email",
        header: ({ column }) => (
          <DataGridColumnHeader title="Email ID" column={column} />
        ),
        accessorFn: (row) => row.email,
        cell: ({ row }) => <TruncatedText value={row.getValue("email")} />,
        size: 240,
        meta: {
          headerTitle: "Email",
          truncate: true,
          skeleton: <Skeleton className="h-4 w-[100px]" />,
        },
      },
    ],
    []
  );
};
