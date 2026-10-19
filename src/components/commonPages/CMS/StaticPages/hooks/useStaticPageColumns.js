import { useMemo } from "react";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";
import { Edit2Icon, EyeIcon, FileText, Trash2Icon } from "lucide-react";
import { Button } from "@/components/common/ui/button";
import { RiDeleteBin5Line } from "@remixicon/react";
import ActiveToggleCell from "@/components/common/ui/ActiveToggleCell";
import { useCrudApi } from "@/hooks/useCrudApi";

export const useStaticPageColumns = ({
  onClick = () => {},
  onView = () => {},
  onFile = () => {},
  onEdit = () => {},
  onDelete = () => {},
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
        id: "srno",
        header: ({ column }) => (
          <DataGridColumnHeader title="ID" column={column} />
        ),
        accessorFn: (row) => row.id,
        cell: ({ row }) => <p>{row.original.id}</p>,
        enableSorting: true,
        size: 130,
      },
      {
        id: "Page Title",
        header: ({ column }) => (
          <DataGridColumnHeader title="Page Title" column={column} />
        ),
        accessorFn: (row) => row.page_title,
        cell: ({ row }) => {
          const t = row.original.page_title || "-";
          return (
            <span title={t} className="block truncate">
              {t}
            </span>
          );
        },
        size: 230,
      },
      {
        id: "Page Slug",
        header: ({ column }) => (
          <DataGridColumnHeader title="Slug" column={column} />
        ),
        accessorFn: (row) => row.page_slug,
        cell: ({ row }) => <span>{row.original.page_slug}</span>,
        size: 165,
      },

      {
        id: "content",
        header: ({ column }) => (
          <DataGridColumnHeader title="Content" column={column} />
        ),
        accessorFn: (row) => row.content,
        cell: ({ row }) => (
          <div className="flex justify-start ml-4">
            <Button
              mode="icon"
              variant="outline"
              onClick={() => onFile(row.original)}
            >
              <FileText />
            </Button>
          </div>
        ),
        size: 165,
      },
      {
        id: "active",
        header: ({ column }) => (
          <DataGridColumnHeader title="Active" column={column} />
        ),
        cell: ({ row }) => (
          <ActiveToggleCell
            id={row.original.id}
            isActive={row.original.is_active}
            // toggleStatus={toggleStatus}
          />
        ),
        size: 165,
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataGridColumnHeader title="Actions" column={column} />
        ),
        accessorFn: (row) => row.actions,
        cell: ({ row }) => (
          <div className="flex gap-2.5">
            <Button
              mode="icon"
              variant="outline"
              onClick={() => onEdit(row.original)}
            >
              <Edit2Icon />
            </Button>
            <Button
              mode="icon"
              variant="outline"
              className="!cursor-pointer"
              onClick={() => onDelete(row.original.id)}
            >
              <RiDeleteBin5Line />
            </Button>
          </div>
        ),
        size: 165,
      },
    ],
    [onClick, onView, onFile, onEdit, onDelete]
  );

  return columns;
};
