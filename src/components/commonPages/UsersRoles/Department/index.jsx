"use client";

import React from "react";
import { Button } from "@/components/common/ui/button";
import { Plus } from "lucide-react";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";
import { useCrudList } from "@/hooks/useCrudList";
import { userDepartments } from "./hooks/userDepartments";
import AddDepartmentModel from "./AddDepartmentsModel";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";

const Department = () => {
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
  } = useCrudList("/api/departments");
  const columns = userDepartments({
    onEdit: (item) => {
      setEditData(item);
      setDialogOpen(true);
    },
    onDelete: (id) => {
      setDeleteId(id);
      setConfirmOpen(true);
    },
  });

  // const filteredList = getListData(list);

  // const filterFunction = (data, searchTerm) => {
  //   const lowerSearch = searchTerm.toLowerCase();
  //   return data.filter((item) =>
  //     item.name?.toLowerCase().includes(lowerSearch)
  //   );
  // };
  const filterOptions = (data, query) => {
    const searchLower = query.toLowerCase();
    return data.filter((item) => {
      const name = item?.name?.toLowerCase() || "";
      return name.includes(searchLower);
    });
  };

  if (loading) return <ContentLoader />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <ListWithCardToggle
        title="All Departments"
        data={list?.data}
        columns={columns}
        resizableColumns
        filterFunction={filterOptions}
        createBtn={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Department
          </Button>
        }
      />

      <AddDepartmentModel
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
        title="Delete Department"
        message="Are you sure you want to delete this department? This action cannot be undone."
      />
    </div>
  );
};

export default Department;
