import React, { useMemo, useState } from "react";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";

import { Skeleton } from "@/components/common/ui/skeleton";
import { Button } from "@/components/common/ui/button";
import { Edit2Icon, Eye, Ban, CheckCircle2 } from "lucide-react";

export const useUsersList = ({ onEdit, onToggleStatus, onViewPermission } = {}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

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
          <DataGridColumnHeader title="ID" column={column} />
        ),
        accessorFn: (row) => row.id,
        cell: ({ row }) => (
          <span className="text-sm font-medium">{row.getValue("id")}</span>
        ),
        size: 50,
        enableSorting: false,
        meta: { skeleton: <Skeleton className="h-4 w-[60px]" /> },
      },
      {
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Name" column={column} />
        ),
        accessorFn: (row) => row.name,
        cell: ({ row }) => (
          <span className="text-sm font-medium">{row.getValue("name")}</span>
        ),
        size: 230,
        enableSorting: false,
        meta: { skeleton: <Skeleton className="h-4 w-[125px]" /> },
      },
      {
        id: "email",
        header: ({ column }) => (
          <DataGridColumnHeader title="Email" column={column} />
        ),
        accessorFn: (row) => row.email,
        cell: ({ row }) => {
          const email = row.getValue("email") || "-";
          return (
            <span title={email} className="block truncate text-sm font-medium">
              {email}
            </span>
          );
        },
        size: 230,
        enableSorting: false,
        meta: { skeleton: <Skeleton className="h-4 w-[125px]" /> },
      },
      // {
      //   id: "password",
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="Password" column={column} />
      //   ),
      //   accessorFn: (row) => row.password,
      //   cell: ({ row }) => {
      //     const [visible, setVisible] = React.useState(false);
      //     const value = row.getValue("password");

      //     return (
      //       <span
      //         className="text-sm font-medium cursor-pointer select-none"
      //         title={
      //           visible ? "Click to hide password" : "Click to show password"
      //         }
      //         onClick={() => setVisible((prev) => !prev)}
      //       >
      //         {visible ? value : "••••••••"}
      //       </span>
      //     );
      //   },
      //   size: 100,
      //   enableSorting: false,
      //   meta: { skeleton: <Skeleton className="h-4 w-[125px]" /> },
      // },
      {
        id: "roles",
        header: ({ column }) => (
          <DataGridColumnHeader title="Role Name" column={column} />
        ),
        accessorFn: (row) => row.roles?.[0].name ?? "-",
        cell: ({ row }) => {
          return (
            <span className="text-sm font-medium">
              {row.original.roles?.[0].name}
            </span>
          );
        },
        size: 130,
        enableSorting: false,
        meta: { skeleton: <Skeleton className="h-4 w-[125px]" /> },
      },
      {
        id: "department",
        header: ({ column }) => (
          <DataGridColumnHeader title="Department Name" column={column} />
        ),
        accessorFn: (row) => row?.department?.name ?? "-",
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {row?.original?.department?.name}
          </span>
        ),
        size: 130,
        enableSorting: false,
        meta: { skeleton: <Skeleton className="h-4 w-[125px]" /> },
      },
      {
        id: "designation",
        header: ({ column }) => (
          <DataGridColumnHeader title="Designation Name" column={column} />
        ),
        accessorFn: (row) => row?.designation,
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {row.getValue("designation")}
          </span>
        ),
        size: 130,
        enableSorting: false,
        meta: { skeleton: <Skeleton className="h-4 w-[125px]" /> },
      },
      {
        id: "is_manager",
        header: ({ column }) => (
          <DataGridColumnHeader title="Manager" column={column} />
        ),
        accessorFn: (row) => (row?.is_manager ? "Yes" : "No"),
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {row.getValue("is_manager")}
          </span>
        ),
        size: 120,
        enableSorting: false,
        meta: { skeleton: <Skeleton className="h-4 w-[125px]" /> },
      },
      {
        // "Delete" on a user is actually a soft-delete (users.service.ts sets
        // isActive:false, never removes the row) — surface it explicitly so
        // a deactivated account isn't indistinguishable from an active one
        // in this list (previously invisible, which is why a deactivated
        // account looked "still there" while login silently rejected it).
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        accessorFn: (row) => (row?.isActive === false ? "Inactive" : "Active"),
        cell: ({ row }) => {
          const active = row.original?.isActive !== false;
          return (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                active
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 dark:bg-secondary text-gray-600 dark:text-muted-foreground"
              }`}
            >
              {active ? "Active" : "Inactive"}
            </span>
          );
        },
        size: 100,
        enableSorting: false,
        meta: { skeleton: <Skeleton className="h-4 w-[70px]" /> },
      },
      {
        id: "action",
        header: ({ column }) => (
          <DataGridColumnHeader title="Action" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              className="!cursor-pointer"
              aria-label="View Permissions"
              onClick={() => onViewPermission && onViewPermission(row.original)}
            >
              <Eye size={16} />
              <span className="hidden md:inline">View Permissions</span>
            </Button>

            <Button
              mode="icon"
              variant="outline"
              aria-label="Edit user"
              onClick={() => onEdit && onEdit(row.original)}
            >
              <Edit2Icon size={16} />
            </Button>

            <Button
              mode="icon"
              variant="outline"
              className="!cursor-pointer"
              aria-label={row.original?.isActive === false ? "Activate user" : "Deactivate user"}
              onClick={() => onToggleStatus && onToggleStatus(row.original)}
            >
              {row.original?.isActive === false ? (
                <CheckCircle2 size={16} />
              ) : (
                <Ban size={16} />
              )}
            </Button>
          </div>
        ),
        size: 130,
        enableSorting: false,
      },
    ],
    [onEdit, onToggleStatus, onViewPermission]
  );

  return { columns, dialogOpen, setDialogOpen };
};
