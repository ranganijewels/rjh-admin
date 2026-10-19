"use client";

import React, { useMemo, useState } from "react";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import {
  StatusFilter,
  buildStatusOptions,
} from "@/components/common/ui/status-filter";
import { Button } from "@/components/common/ui/button";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { Plus } from "lucide-react";
import StaticPageModel from "./StaticPageModel";
import { useStaticPageColumns } from "./hooks/useStaticPageColumns";
import { useCrudListWithPagination } from "@/hooks/useCrudListWithPagination";
import { usePermissions } from "@/provider/permission-provider";

const StaticPageManager = () => {
  const { can } = usePermissions();
  const [previewData, setPreviewData] = useState(null);
  const [pageInfo, setPageInfo] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDialog, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const {
    list,
    pagination,
    fetchData,
    remove,
    setDeleteId,
    setConfirmOpen,
    confirmOpen,
    handleDelete,
  } = useCrudListWithPagination("/api/cms/page-manager");

  const columns = useStaticPageColumns({
    canEdit: can("cms", "edit"),
    canDelete: can("cms", "delete"),
    onFile: (row) => setPreviewData(row),
    onEdit: (row) => {
      setEditRow(row);
      setDialogOpen(true);
    },
    onDelete: (id) => {
      setDeleteId(id); // <-- works now
      setConfirmOpen(true); // <-- show confirmation
    },
  });

  const filterFunction = (data, query) => {
    const q = query.toLowerCase();
    return data.filter((item) =>
      ["title", "category", "slug", "page_title"].some((key) =>
        item[key]?.toString().toLowerCase().includes(q)
      )
    );
  };

  const statusOptions = useMemo(
    () =>
      buildStatusOptions(
        list,
        (page) => (page?.is_active ? "Active" : "Inactive"),
        { allLabel: "All pages", order: ["Active", "Inactive"] }
      ),
    [list]
  );

  const scopedList = useMemo(
    () =>
      statusFilter === "all"
        ? list
        : (list || []).filter(
            (page) => (page?.is_active ? "Active" : "Inactive") === statusFilter
          ),
    [list, statusFilter]
  );

  return (
    <div className="space-y-4">
      <StatusFilter
        options={statusOptions}
        value={statusFilter}
        onChange={setStatusFilter}
        ariaLabel="Page status"
      />

      <ListWithCardToggle
        resizableColumns
        title="Static Page List"
        titleAs="h2"
        description="Manage your static pages here"
        data={scopedList}
        columns={columns}
        filterFunction={filterFunction}
        pagination={pageInfo}
        onPaginationChange={setPageInfo}
        pageCount={pagination?.totalPages || 1}
        totalCount={pagination?.total || list.length}
        paginationLinks={pagination?.links}
        serverSidePagination={false}
        infiniteScroll
        bulkActions={can("cms", "delete") ? [
          {
            key: "delete",
            label: "Delete",
            variant: "destructive",
            confirmMessage:
              "Delete the selected page(s)? This cannot be undone.",
            onRun: async (rows) => {
              await Promise.all(rows.map((r) => remove(r.id)));
              fetchData({ page: 1, pageSize: pageInfo.pageSize });
            },
          },
        ] : []}
        searchQuery={searchQuery}
        onSearchChange={(query) => setSearchQuery(query)}
        createBtn={
          can("cms", "create") ? (
            <Button
              onClick={() => {
                setEditRow(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Page
            </Button>
          ) : null
        }
      />

      <StaticPageModel
        open={openDialog}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditRow(null);
        }}
        editRow={editRow}
        onSuccess={fetchData}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this page?"
      />
    </div>
  );
};

export default StaticPageManager;
