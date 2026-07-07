// "use client";

// import React, { useEffect, useState } from "react";
// import { Card } from "@/components/common/ui/cards/card";
// import { ChevronRight, Folder } from "lucide-react";
// import {
//   Toolbar,
//   ToolbarHeading,
//   ToolbarDescription,
//   ToolbarPageTitle,
// } from "@/components/common/ui/toolbar";
// import { Skeleton } from "@/components/common/ui/skeleton";
// import { useCrudApi } from "@/hooks/useCrudApi";
// import { toTitleCase } from "@/lib/utils";
// import { toast } from "sonner";
// import FolderCollections from "./FolderCollections"; // ← import folder view

// export const BrowseOtherProducts = () => {
//   const { fetchAll } = useCrudApi("/api/pricing-margin/by-category/categories");

//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [selectedCategory, setSelectedCategory] = useState(null);

//   useEffect(() => {
//     const loadCategories = async () => {
//       try {
//         const res = await fetchAll();

//         if (res?.status && Array.isArray(res.data)) {
//           setCategories(res.data);
//         } else {
//           toast.error(res?.message || "Failed to fetch categories");
//         }
//       } catch (error) {
//         toast.error("Something went wrong while loading categories");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadCategories();
//   }, [fetchAll]);

//   // When a category is clicked → open FolderCollections
//   const openFolder = (category) => {
//     setSelectedCategory(category);
//   };

//   // If category is selected → show FolderCollections
//   if (selectedCategory) {
//     return (
//       <FolderCollections
//         category={selectedCategory}
//         onBack={() => setSelectedCategory(null)}
//       />
//     );
//   }

//   // 👉 Otherwise show categories list
//   return (
//     <>
//       <div className="mt-6 ml-5">
//         <Toolbar>
//           <ToolbarHeading>
//             <ToolbarPageTitle
//               text="Product Categories"
//               className="font-semibold !text-foreground text-lg"
//             />
//             <ToolbarDescription className="mt-1 text-sm">
//               Browse products by category
//             </ToolbarDescription>
//           </ToolbarHeading>
//         </Toolbar>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
//         {loading ? (
//           Array.from({ length: 6 }).map((_, i) => (
//             <Skeleton key={i} className="h-24 rounded-xl" />
//           ))
//         ) : categories.length > 0 ? (
//           categories.map((category) => (
//             <Card
//               key={category.id}
//               onClick={() => openFolder(category)}
//               className="p-6 rounded-xl border border-gray-200 transition-all cursor-pointer group bg-white hover:border-primary hover:shadow-md"
//             >
//               <div className="flex items-center gap-4">
//                 <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
//                   <Folder className="w-8 h-8 text-primary" />
//                 </div>

//                 <div className="flex-1">
//                   <h3 className="text-gray-900 mb-1 font-medium group-hover:text-primary">
//                     {toTitleCase(category.custom_title || category.name)}
//                   </h3>
//                   <p className="text-sm text-gray-500">
//                     {category.product_count || category.product_count}{" "}
//                     Products
//                   </p>
//                 </div>

//                 <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary" />
//               </div>
//             </Card>
//           ))
//         ) : (
//           <p className="col-span-full text-center text-gray-500">
//             No categories found.
//           </p>
//         )}
//       </div>
//     </>
//   );
// };

// export default BrowseOtherProducts;

"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCrudApi } from "@/hooks/useCrudApi";
import FolderCollections from "./FolderCollections";
import ProductPricingCard from "./ProductPricingCard";
import { ChevronRight, Folder } from "lucide-react";
import { toTitleCase } from "@/lib/utils";
import {
  Toolbar,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/components/common/ui/toolbar";
import { Skeleton } from "@/components/common/ui/skeleton";

export default function BrowseOtherProducts() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category_id");

  const { fetchAll } = useCrudApi("/api/product-management/browse-other");

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchAll();
        if (res?.status) {
          setCollections(res.data?.categories || []);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openFolder = (category) => {
    setSelectedSubCategory(null);
    setSelectedCategory(category);
  };

  // Folder view with inline product cards
  if (selectedCategory) {
    return (
      <>
        {/* Show FolderCollections ONLY when no subcategory selected */}
        {!selectedSubCategory && (
          <FolderCollections
            category={selectedCategory}
            onBack={() => {
              setSelectedSubCategory(null);
              setSelectedCategory(null);
            }}
            onSelectSubCategory={(sub) => setSelectedSubCategory(sub)}
          />
        )}

        {/* Show product cards when subcategory is selected */}
        {selectedSubCategory && (
          <div className="mt-8 ml-5">
            <ProductPricingCard
              category={selectedCategory}
              subCategory={selectedSubCategory}
              onBack={() => setSelectedSubCategory(null)}
            />
          </div>
        )}
      </>
    );
  }

  // Category list
  return (
    <>
      <div className="mt-6 ml-5">
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle
              text="Product Categories"
              className="font-semibold !text-foreground text-lg"
            />
            <ToolbarDescription className="mt-1 text-sm">
              Browse products by category
            </ToolbarDescription>
          </ToolbarHeading>
        </Toolbar>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          : collections.map((category) => (
              <div
                key={category.id}
                onClick={() => openFolder(category)}
                className="p-6 rounded-xl border border-gray-200 transition-all cursor-pointer group bg-white hover:border-primary hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Folder className="w-8 h-8 text-primary" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-1 font-medium group-hover:text-primary">
                      {toTitleCase(category?.name)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {category.product_count || 0} Products
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                </div>
              </div>
            )) || (
              <p className="col-span-full text-center text-gray-500">
                No categories found.
              </p>
            )}
      </div>
    </>
  );
}
