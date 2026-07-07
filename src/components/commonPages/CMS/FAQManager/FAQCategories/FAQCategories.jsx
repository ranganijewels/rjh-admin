"use client";

import React, { useState } from "react";
import { Button } from "@/components/common/ui/button";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/components/common/ui/toolbar";
import { Plus } from "lucide-react";
import { CategoriesCard } from "./CategoriesCard";
import FAQCategoriesModel from "./FAQCategoriesModel";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";

// IMPORT useCrudList HERE
import { useCrudList } from "@/hooks/useCrudList";

const FAQCategories = () => {
  const storeId = 5;
  // Using your API hook now
  const {
    list,
    loading,
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
  } = useCrudList(`/api/cms/faq/${storeId}/categories`);

  const [selectedCatId, setSelectedCatId] = useState(null);

  //  Add Category
  const handleAddClick = () => {
    setEditData(null);
    setSelectedCatId(null);
    setDialogOpen(true);
  };

  // Edit → Fetch API
  const handleEditClick = async (id) => {
    try {
      setDialogOpen(true);
      const { data } = await fetchById(id);
      setSelectedCatId(id);
      setEditData(data);
    } catch (err) {
      console.error("Failed to fetch category for editing", err);
    }
  };

  // Ask before delete
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  return (
    <div>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle
            text="FAQ Categories"
            className="font-semibold !text-foreground text-lg"
          />
          <ToolbarDescription className="mt-1 text-sm">
            Organize FAQs by category with page-specific assignments
          </ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </ToolbarActions>
      </Toolbar>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <p>Loading...</p>
        ) : list.length > 0 ? (
          list.map((cat) => (
            <CategoriesCard
              key={cat.id}
              data={cat}
              handleEditClick={() => handleEditClick(cat.id)}
              handleDeleteClick={() => handleDeleteClick(cat.id)}
              storeId={storeId}
            />
          ))
        ) : (
          <p>No categories found</p>
        )}
      </div>

      {/* Add/Edit Modal */}
      <FAQCategoriesModel
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditData(null);
        }}
        onSuccess={fetchData}
        editData={editData}
        categoryId={selectedCatId}
        storeId={5}
      />

      {/* Confirm Delete Dialog */}
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

export default FAQCategories;
