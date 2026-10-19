import React, { useMemo, useState } from "react";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";

import { Skeleton } from "@/components/common/ui/skeleton";
import { Button } from "@/components/common/ui/button";
import { StatusBadge } from "@/components/common/ui/badge";
import { ShortId, TruncatedText } from "@/components/common/ui/short-id";
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
        meta: { headerTitle: "Select" },
      },
      {
        id: "id",
        header: ({ column }) => (
          <DataGridColumnHeader title="ID" column={column} />
        ),
        accessorFn: (row) => row.id,
        cell: ({ row }) => <ShortId value={row.getValue("id")} label="User ID" />,
        size: 130,
        enableSorting: false,
        meta: {
          headerTitle: "User ID",
          skeleton: <Skeleton className="h-4 w-[60px]" />,
        },
      },
      {
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Name" column={column} />
        ),
        accessorFn: (row) => row.name,
        cell: ({ row }) => (
          <TruncatedText value={row.getValue("name")} className="font-medium text-foreground" />
        ),
        size: 230,
        enableSorting: false,
        meta: {
          headerTitle: "Name",
          identity: true,
          truncate: true,
          skeleton: <Skeleton className="h-4 w-[125px]" />,
        },
      },
      {
        id: "email",
        header: ({ column }) => (
          <DataGridColumnHeader title="Email" column={column} />
        ),
        accessorFn: (row) => row.email,
        cell: ({ row }) => (
          <TruncatedText value={row.getValue("email")} className="font-medium text-foreground" />
        ),
        size: 230,
        enableSorting: false,
        meta: {
          headerTitle: "Email",
          truncate: true,
          skeleton: <Skeleton className="h-4 w-[125px]" />,
        },
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
        meta: {
          headerTitle: "Role",
          skeleton: <Skeleton className="h-4 w-[125px]" />,
        },
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
        meta: {
          headerTitle: "Department",
          skeleton: <Skeleton className="h-4 w-[125px]" />,
        },
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
        meta: {
          headerTitle: "Designation",
          skeleton: <Skeleton className="h-4 w-[125px]" />,
        },
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
        meta: {
          headerTitle: "Manager",
          skeleton: <Skeleton className="h-4 w-[125px]" />,
        },
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
          return <StatusBadge status={active ? "active" : "inactive"} />;
        },
        size: 110,
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerTitle: "Status",
          skeleton: <Skeleton className="h-4 w-[70px]" />,
        },
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
              aria-label="View permissions"
              title="View permissions"
              onClick={(event) => {
                event.stopPropagation();
                onViewPermission && onViewPermission(row.original);
              }}
            >
              <Eye size={16} />
              <span className="hidden md:inline">View Permissions</span>
            </Button>

            <Button
              mode="icon"
              variant="outline"
              aria-label="Edit user"
              title="Edit user"
              onClick={(event) => {
                event.stopPropagation();
                onEdit && onEdit(row.original);
              }}
            >
              <Edit2Icon size={16} />
            </Button>

            <Button
              mode="icon"
              variant="outline"
              className="!cursor-pointer"
              aria-label={row.original?.isActive === false ? "Activate user" : "Deactivate user"}
              title={row.original?.isActive === false ? "Activate user" : "Deactivate user"}
              onClick={(event) => {
                event.stopPropagation();
                onToggleStatus && onToggleStatus(row.original);
              }}
            >
              {row.original?.isActive === false ? (
                <CheckCircle2 size={16} />
              ) : (
                <Ban size={16} />
              )}
            </Button>
          </div>
        ),
        size: 180,
        enableSorting: false,
        enableHiding: false,
        meta: { headerTitle: "Action" },
      },
    ],
    [onEdit, onToggleStatus, onViewPermission]
  );

  return { columns, dialogOpen, setDialogOpen };
};
