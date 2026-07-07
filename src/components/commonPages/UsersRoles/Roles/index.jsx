"use client";

import React, { useState } from "react";
import { Button } from "@/components/common/ui/button";
import { Plus } from "lucide-react";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { useCrudList } from "@/hooks/useCrudList";
import AddRoleModel from "./AddRoleModel";
import { userRolesData } from "./hooks/userRolesData";

const Roles = () => {
  const {
    list,
    loading,
    error,
    editData,
    setEditData,
    setDeleteId,
    dialogOpen,
    setDialogOpen,
    confirmOpen,
    setConfirmOpen,
    fetchData,
    handleDelete,
  } = useCrudList("/api/users-roles");

  const columns = userRolesData({
    onEdit: (item) => {
      setEditData(item);
      setDialogOpen(true);
    },

    onDelete: (id) => {
      setDeleteId(id);
      setConfirmOpen(true);
    },
  });

  const filterFunction = (data, searchTerm) => {
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter((item) =>
      item.name?.toLowerCase().includes(lowerSearch)
    );
  };

  if (loading) return <ContentLoader />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <ListWithCardToggle
        title="All Roles"
        data={list}
        columns={columns}
        resizableColumns
        filterFunction={filterFunction}
        createBtn={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User Role
          </Button>
        }
      />

      <AddRoleModel
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditData(null);
        }}
        editData={editData}
        onSuccess={fetchData}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone."
      />
    </div>
  );
};

export default Roles;
