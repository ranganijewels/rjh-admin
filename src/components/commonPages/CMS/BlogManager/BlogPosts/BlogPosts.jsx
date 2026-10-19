"use client";

import React, { useMemo, useState } from "react";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import {
  StatusFilter,
  buildStatusOptions,
} from "@/components/common/ui/status-filter";
import { Button } from "@/components/common/ui/button";
import { Alert, AlertDescription } from "@/components/common/ui/alert";
import { Plus } from "lucide-react";

import { useCrudList } from "@/hooks/useCrudList";
import { useCrudApi } from "@/hooks/useCrudApi";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";
import BlogPostModel from "./BlogPostModel";
import { useBlogPostColumns } from "./hooks/useBlogPostColumns";
import { usePermissions } from "@/provider/permission-provider";

const BlogPosts = ({ storeId = "default" }) => {
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
  } = useCrudList(`/api/cms/blog/${storeId}/posts`);
  const { remove } = useCrudApi(`/api/cms/blog/${storeId}/posts`);

  const [selectedPostId, setSelectedPostId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // Columns (Edit / Delete Actions)
  const columns = useBlogPostColumns({
    canEdit: can("cms", "edit"),
    canDelete: can("cms", "delete"),
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


  const statusOptions = useMemo(
    () =>
      buildStatusOptions(list, (post) => (post?.isPublished ? "Published" : "Draft"), {
        allLabel: "All posts",
        order: ["Published", "Draft"],
      }),
    [list]
  );

  const scopedList = useMemo(
    () =>
      statusFilter === "all"
        ? list
        : (list || []).filter((post) =>
            (post?.isPublished ? "Published" : "Draft") === statusFilter
          ),
    [list, statusFilter]
  );

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
      <StatusFilter
        options={statusOptions}
        value={statusFilter}
        onChange={setStatusFilter}
        ariaLabel="Post status"
      />

      <ListWithCardToggle
        resizableColumns
        title="Blog Posts"
        titleAs="h2"
        description="Manage your blog posts here."
        data={scopedList}
        columns={columns}
        filterFunction={filterOptions}
        infiniteScroll
        bulkActions={can("cms", "delete") ? [
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
        ] : []}
        createBtn={
          can("cms", "create") ? (
            <Button
              onClick={() => {
                setDialogOpen(true);
                setEditData(null);
                setSelectedPostId(null);
              }}
            >
              <Plus className="size-4" />
              Add Post
            </Button>
          ) : null
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
