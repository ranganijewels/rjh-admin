// "use client";

// import React, { useState } from "react";
// import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
// import { Button } from "@/components/common/ui/button";
// import { BLOG_CATEGORIES_DATA } from "../../constant";
// import { useBlogCategoriesColumns } from "./hooks/useBlogCategoriesColumns";
// import { Plus } from "lucide-react";
// import BlogCategoriesModel from "./BlogCategoriesModel";

// const BlogCategories = ({ storeId }) => {
//   const {
//     list,
//     loading,
//     editData,
//     setEditData,
//     setDeleteId,
//     dialogOpen,
//     setDialogOpen,
//     confirmOpen,
//     setConfirmOpen,
//     fetchData,
//     handleDelete,
//     fetchById,
//   } = useCrudList(`/api/cms/blog/${storeId}/categories`);

//   const columns = useBlogCategoriesColumns({
//     onEdit: (item) => {
//       setEditData(item);
//       setDialogOpen(true);
//     },
//     onDelete: (id) => console.log("Delete category ID:", id),
//   });

//   return (
//     <>
//       <ListWithCardToggle
//         title="Blog Categories"
//         description="Manage your blog categories here."
//         data={BLOG_CATEGORIES_DATA}
//         columns={columns}
//         createBtn={
//           <Button
//             onClick={() => {
//               setEditData(null); // reset edit data for Add mode
//               setDialogOpen(true);
//             }}
//           >
//             <Plus className="mr-2 h-4 w-4" />
//             Add Category
//           </Button>
//         }
//       />

//       {/* Modal */}
//       <BlogCategoriesModel
//         open={dialogOpen}
//         onClose={() => setDialogOpen(false)}
//         editData={editData}
//         onSuccess={() => {
//           console.log("Category saved successfully!");
//         }}
//       />
//     </>
//   );
// };

// export default BlogCategories;

"use client";

import React, { useState } from "react";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { Button } from "@/components/common/ui/button";
import { Plus } from "lucide-react";
import { useCrudList } from "@/hooks/useCrudList";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";

import BlogCategoriesModel from "./BlogCategoriesModel";
import { useBlogCategoriesColumns } from "./hooks/useBlogCategoriesColumns";

const BlogCategories = ({ storeId }) => {
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
  } = useCrudList(`/api/cms/blog/5/categories`);

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
    return data.filter((item) => item?.title?.toLowerCase().includes(q));
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
