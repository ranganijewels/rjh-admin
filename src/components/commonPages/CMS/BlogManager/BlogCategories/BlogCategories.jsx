"use client";

import React, { useMemo, useState } from "react";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import {
  StatusFilter,
  buildStatusOptions,
} from "@/components/common/ui/status-filter";
import { Button } from "@/components/common/ui/button";
import { Plus } from "lucide-react";
import { useCrudList } from "@/hooks/useCrudList";
import { useCrudApi } from "@/hooks/useCrudApi";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";

import BlogCategoriesModel from "./BlogCategoriesModel";
import { useBlogCategoriesColumns } from "./hooks/useBlogCategoriesColumns";
import { usePermissions } from "@/provider/permission-provider";

const BlogCategories = ({ storeId = "default" }) => {
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
    fetchById,
  } = useCrudList(`/api/cms/blog/${storeId}/categories`);
  const { remove } = useCrudApi(`/api/cms/blog/${storeId}/categories`);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const columns = useBlogCategoriesColumns({
    canEdit: can("cms", "edit"),
    canDelete: can("cms", "delete"),
    onEdit: async (item) => {
      try {
        setDialogOpen(true);
        setSelectedCategoryId(item.id);

        const data = await fetchById(item.id);
        setEditData(data?.data);
      } catch (err) {
        console.error("Failed to fetch category for editing", err);
      }
    },
    onDelete: (id) => {
      setDeleteId(id);
      setConfirmOpen(true);
    },
    storeId,
  });

  const filterOptions = (data, query) => {
    const q = query.toLowerCase();
    return data.filter((item) => item?.valueLabel?.toLowerCase().includes(q));
  };


  const statusOptions = useMemo(
    () =>
      buildStatusOptions(
        list,
        (category) => (category?.is_active ? "Active" : "Inactive"),
        { allLabel: "All categories", order: ["Active", "Inactive"] }
      ),
    [list]
  );

  const scopedList = useMemo(
    () =>
      statusFilter === "all"
        ? list
        : (list || []).filter(
            (category) =>
              (category?.is_active ? "Active" : "Inactive") === statusFilter
          ),
    [list, statusFilter]
  );

  if (loading) return <ContentLoader />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <StatusFilter
        options={statusOptions}
        value={statusFilter}
        onChange={setStatusFilter}
        ariaLabel="Category status"
      />

      <ListWithCardToggle
        title="Blog Categories"
        titleAs="h2"
        description="Manage your blog categories here."
        data={scopedList}
        columns={columns}
        resizableColumns
        filterFunction={filterOptions}
        infiniteScroll
        bulkActions={can("cms", "delete") ? [
          {
            key: "delete",
            label: "Delete",
            variant: "destructive",
            confirmMessage:
              "Delete the selected categor(ies)? This cannot be undone.",
            onRun: async (rows) => {
              await Promise.all(rows.map((r) => remove(r.id)));
              fetchData();
            },
          },
        ] : []}
        createBtn={
          can("cms", "create") ? (
            <Button
              onClick={() => {
                setDialogOpen(true);
                setEditData(null);
                setSelectedCategoryId(null);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          ) : null
        }
      />

      {/* Add/Edit Modal */}
      <BlogCategoriesModel
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditData(null);
          setSelectedCategoryId(null);
        }}
        onSuccess={fetchData}
        editData={editData}
        storeId={storeId}
        categoryId={selectedCategoryId}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
      />
    </div>
  );
};

export default BlogCategories;
