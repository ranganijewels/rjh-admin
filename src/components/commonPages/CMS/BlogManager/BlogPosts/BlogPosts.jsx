"use client";

import React, { useState } from "react";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { Button } from "@/components/common/ui/button";
import { Alert, AlertDescription } from "@/components/common/ui/alert";
import { Plus } from "lucide-react";

import { useCrudList } from "@/hooks/useCrudList";
import { useCrudApi } from "@/hooks/useCrudApi";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";
import BlogPostModel from "./BlogPostModel";
import { useBlogPostColumns } from "./hooks/useBlogPostColumns";

const BlogPosts = ({ storeId = "default" }) => {
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
  } = useCrudList(`/api/cms/blog/${storeId}/posts`);
  const { remove } = useCrudApi(`/api/cms/blog/${storeId}/posts`);

  const [selectedPostId, setSelectedPostId] = useState(null);

  // Columns (Edit / Delete Actions)
  const columns = useBlogPostColumns({
    onEdit: async (item) => {
      try {
        setDialogOpen(true);
        setSelectedPostId(item.id);

        const data = await fetchById(item.id);
        setEditData(data?.data);
      } catch (err) {
        console.error("Failed to fetch blog post for editing", err);
      }
    },
    onDelete: (id) => {
      setDeleteId(id);
      setConfirmOpen(true);
    },
    storeId,
  });

  // Search Filter
  const filterOptions = (data, query) => {
    const q = query.toLowerCase();
    return data.filter((item) => item?.title?.toLowerCase().includes(q));
  };

  if (loading) return <ContentLoader />;
  if (error)
    return (
      <Alert variant="destructive" appearance="light">
        <AlertDescription className="flex items-center justify-between gap-4">
          <span>Failed to load blog posts. {error}</span>
          <Button size="sm" variant="destructive" onClick={fetchData}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );

  return (
    <div className="space-y-4">
      <ListWithCardToggle
        resizableColumns
        title="Blog Posts"
        description="Manage your blog posts here."
        data={list}
        columns={columns}
        filterFunction={filterOptions}
        infiniteScroll
        bulkActions={[
          {
            key: "delete",
            label: "Delete",
            variant: "destructive",
            confirmMessage:
              "Delete the selected blog post(s)? This cannot be undone.",
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
              setSelectedPostId(null);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Post
          </Button>
        }
      />

      {/* Add/Edit Dialog */}
      <BlogPostModel
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditData(null);
          setSelectedPostId(null);
        }}
        onSuccess={fetchData}
        editData={editData}
        storeId={storeId}
        postId={selectedPostId}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        message="Are you sure you want to delete this blog post? This action cannot be undone."
      />
    </div>
  );
};

export default BlogPosts;
