"use client";

import React, { useState } from "react";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { Button } from "@/components/common/ui/button";
import { Plus } from "lucide-react";
import { useCrudList } from "@/hooks/useCrudList";
import { useCrudApi } from "@/hooks/useCrudApi";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";

import BlogCategoriesModel from "./BlogCategoriesModel";
import { useBlogCategoriesColumns } from "./hooks/useBlogCategoriesColumns";

const BlogCategories = ({ storeId = "default" }) => {
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

  const columns = useBlogCategoriesColumns({
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

  if (loading) return <ContentLoader />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <ListWithCardToggle
        title="Blog Categories"
        description="Manage your blog categories here."
        data={list}
        columns={columns}
        resizableColumns
        filterFunction={filterOptions}
        infiniteScroll
        bulkActions={[
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
        ]}
        createBtn={
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
