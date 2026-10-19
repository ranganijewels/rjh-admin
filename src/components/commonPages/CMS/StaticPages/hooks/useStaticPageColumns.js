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
import { ShortId, TruncatedText } from "@/components/common/ui/short-id";
import { useCrudApi } from "@/hooks/useCrudApi";

export const useStaticPageColumns = ({
  onClick = () => {},
  onView = () => {},
  onFile = () => {},
  onEdit = () => {},
  onDelete = () => {},
  canEdit = true,
  canDelete = true,
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
        meta: { headerTitle: "Select" },
      },
      {
        id: "srno",
        header: ({ column }) => (
          <DataGridColumnHeader title="Page ID" column={column} />
        ),
        accessorFn: (row) => row.id,
        cell: ({ row }) => <ShortId value={row.original.id} label="Page ID" />,
        enableSorting: true,
        size: 130,
        meta: { headerTitle: "Page ID" },
      },
      {
        id: "Page Title",
        header: ({ column }) => (
          <DataGridColumnHeader title="Page Title" column={column} />
        ),
        accessorFn: (row) => row.page_title,
        cell: ({ row }) => (
          <TruncatedText value={row.original.page_title} className="font-medium text-foreground" />
        ),
        size: 240,
        meta: { headerTitle: "Page Title", identity: true, truncate: true },
      },
      {
        id: "Page Slug",
        header: ({ column }) => (
          <DataGridColumnHeader title="Slug" column={column} />
        ),
        accessorFn: (row) => row.page_slug,
        cell: ({ row }) => <TruncatedText value={row.original.page_slug} />,
        size: 165,
        meta: { headerTitle: "Slug", truncate: true },
      },

      {
        id: "content",
        header: ({ column }) => (
          <DataGridColumnHeader title="Content" column={column} />
        ),
        accessorFn: (row) => row.content,
        cell: ({ row }) => (
          <div className="flex justify-start">
            <Button
              mode="icon"
              variant="outline"
              aria-label={`View content for ${row.original.page_title || "page"}`}
              title="View content"
              onClick={(event) => {
                event.stopPropagation();
                onFile(row.original);
              }}
            >
              <FileText />
            </Button>
          </div>
        ),
        enableSorting: false,
        size: 110,
        meta: { headerTitle: "Content" },
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
        enableHiding: false,
        size: 100,
        meta: { headerTitle: "Active" },
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataGridColumnHeader title="Actions" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex gap-2.5">
            {canEdit && (
              <Button
                mode="icon"
                variant="outline"
                aria-label="Edit page"
                title="Edit page"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(row.original);
                }}
              >
                <Edit2Icon />
              </Button>
            )}
            {canDelete && (
              <Button
                mode="icon"
                variant="outline"
                className="!cursor-pointer"
                aria-label="Delete page"
                title="Delete page"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(row.original.id);
                }}
              >
                <RiDeleteBin5Line />
              </Button>
            )}
          </div>
        ),
        enableHiding: false,
        size: 110,
        meta: { headerTitle: "Actions" },
      },
    ],
    [onClick, onView, onFile, onEdit, onDelete, canEdit, canDelete]
  );

  return columns;
};
