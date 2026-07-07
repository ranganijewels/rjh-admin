"use client";

import React, { useState } from "react";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import ManageCollectionModel from "./ManageCollectionModel";
import { useManageCollectionColumns } from "../hooks/useManageCollectionColumns";
import { useCrudList } from "@/hooks/useCrudList";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";

const ManageCollection = () => {
  const {
    list,
    editData,
    setEditData,
    setDeleteId,
    dialogOpen,
    setDialogOpen,
    confirmOpen,
    setConfirmOpen,
    fetchData,
    handleDelete,
  } = useCrudList("/api/product-management/manage-collection");

  const [search, setSearch] = useState("");

  // Your custom search function
  const filterOptions = (data, query) => {
    const searchLower = query.toLowerCase();
    return data.filter((item) => {
      const category = item?.code?.toLowerCase() || "";
      return category.includes(searchLower);
    });
  };

  // Filtered list
  const filteredList = search ? filterOptions(list, search) : list;

  const columns = useManageCollectionColumns({
    setEditingCell: (item) => {
      setEditData(item);
      setDialogOpen(true);
    },
    onDelete: (id) => {
      setDeleteId(id);
      setConfirmOpen(true);
    },
  });

  return (
    <div className="space-y-4">
      <ListWithCardToggle
        title="Collection List"
        description="Manage and view all collections"
        data={filteredList}
        columns={columns}
        serverSidePagination={false} // IMPORTANT
        onSearch={(value) => setSearch(value)}
        resizableColumns
      />

      <ManageCollectionModel
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditData(null);
        }}
        onSuccess={fetchData}
        editData={editData}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ManageCollection;
