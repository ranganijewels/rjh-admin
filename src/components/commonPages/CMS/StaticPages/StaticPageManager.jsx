"use client";

import React, { useState } from "react";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { Button } from "@/components/common/ui/button";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { Plus } from "lucide-react";
import StaticPageModel from "./StaticPageModel";
import { useStaticPageColumns } from "./hooks/useStaticPageColumns";
import { useCrudListWithPagination } from "@/hooks/useCrudListWithPagination";

const StaticPageManager = () => {
  const [previewData, setPreviewData] = useState(null);
  const [pageInfo, setPageInfo] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const {
    list,
    pagination,
    fetchData,
    setDeleteId,
    setConfirmOpen,
    confirmOpen,
    handleDelete,
  } = useCrudListWithPagination("/api/cms/page-manager");

  const columns = useStaticPageColumns({
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

  return (
    <div>
      <ListWithCardToggle
        resizableColumns
        title="Static Page List"
        description="Manage your static pages here"
        data={list}
        columns={columns}
        filterFunction={filterFunction}
        pagination={pageInfo}
        onPaginationChange={setPageInfo}
        pageCount={pagination?.totalPages || 1}
        totalCount={pagination?.total || list.length}
        paginationLinks={pagination?.links}
        serverSidePagination={false}
        searchQuery={searchQuery}
        onSearchChange={(query) => setSearchQuery(query)}
        createBtn={
          <Button
            onClick={() => {
              setEditRow(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Page
          </Button>
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
