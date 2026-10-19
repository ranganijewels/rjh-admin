import { useMemo } from "react";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Button } from "@/components/common/ui/button";
import { Eye } from "lucide-react";
import { TruncatedText } from "@/components/common/ui/short-id";

export const useUserRolesData = ({ onViewPermissions } = {}) => {
  return useMemo(
    () => [
      {
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Role" column={column} />
        ),
        accessorFn: (row) => row.name,
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-foreground">
            {row.getValue("name")}
          </span>
        ),
        size: 200,
        enableSorting: false,
        meta: {
          identity: true,
          headerTitle: "Role",
          skeleton: <Skeleton className="h-4 w-[90px]" />,
        },
      },
      {
        id: "description",
        header: ({ column }) => (
          <DataGridColumnHeader title="Description" column={column} />
        ),
        accessorFn: (row) => row.description || "—",
        cell: ({ row }) => (
          <TruncatedText
            value={row.getValue("description")}
            className="text-muted-foreground"
          />
        ),
        size: 420,
        enableSorting: false,
        meta: {
          headerTitle: "Description",
          truncate: true,
          skeleton: <Skeleton className="h-4 w-[260px]" />,
        },
      },
      {
        id: "action",
        header: ({ column }) => (
          <DataGridColumnHeader title="Permissions" column={column} />
        ),
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            className="!cursor-pointer"
            aria-label={`View permissions for ${row.original.name || "role"}`}
            onClick={(event) => {
              event.stopPropagation();
              onViewPermissions?.(row.original);
            }}
          >
            <Eye className="size-3.5" />
            View Permissions
          </Button>
        ),
        size: 180,
        enableSorting: false,
        enableHiding: false,
        meta: { headerTitle: "Permissions" },
      },
    ],
    [onViewPermissions]
  );
};
