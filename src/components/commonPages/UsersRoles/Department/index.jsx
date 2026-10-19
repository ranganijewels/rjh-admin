"use client";

import React from "react";
import { Button } from "@/components/common/ui/button";
import { Page, PageHeader } from "@/components/common/ui/page";
import { Plus } from "lucide-react";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";
import { useCrudList } from "@/hooks/useCrudList";
import { useCrudApi } from "@/hooks/useCrudApi";
import { useUserDepartments } from "./hooks/useUserDepartments";
import AddDepartmentModel from "./AddDepartmentsModel";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { usePermissions } from "@/provider/permission-provider";

const Department = () => {
  const { can } = usePermissions();
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
  const { remove } = useCrudApi("/api/departments");
  const columns = useUserDepartments({
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
    <Page>
      <PageHeader
        title="Departments"
        description="The departments a team member can belong to. Departments scope the product catalogue and reporting."
        actions={
          can("users_roles", "create") ? (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="size-4" /> Add Department
            </Button>
          ) : null
        }
      />

      <ListWithCardToggle
        titleAs="none"
        data={list?.data}
        columns={columns}
        resizableColumns
        filterFunction={filterOptions}
        infiniteScroll
        bulkActions={
          can("users_roles", "delete")
            ? [
                {
                  key: "delete",
                  label: "Delete",
                  variant: "destructive",
                  confirmMessage:
                    "Delete the selected department(s)? This cannot be undone.",
                  onRun: async (rows) => {
                    await Promise.all(rows.map((r) => remove(r.id)));
                    fetchData();
                  },
                },
              ]
            : []
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
    </Page>
  );
};

export default Department;
