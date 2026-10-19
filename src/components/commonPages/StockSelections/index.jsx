"use client";

import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/cards/card";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { useStockSelections } from "@/components/commonPages/StockSelections/hooks/useStockSelections";
import { Button } from "@/components/common/ui/button";
import { ShoppingCart, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { cn, toTitleCase } from "@/lib/utils";
import { FILTERS_CONFIG, STOCK_DETAIL, STOCK_PRODUCT_DETAIL } from "./constant";

const filterStockSelections = (data, query) => {
  if (!query) return data;
  const q = query.toLowerCase();
  return data.filter(
    (item) =>
      (item.designNo && item.designNo.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.style && item.style.toLowerCase().includes(q)) ||
      (item.status && item.status.toLowerCase().includes(q))
  );
};

// Single product card
const StockSelectionCard = ({ product, onView, selectedProduct }) => {
  const isSelected = selectedProduct?.id === product.id;
  return (
    <Card
      onClick={() => onView(product)}
      className={cn(
        "w-full max-w-[240px] p-4 text-center shadow-sm hover:shadow-md transition rounded-xl cursor-pointer",
        isSelected
          ? "bg-primary/10 border-2 border-primary"
          : "border border-muted/30"
      )}
    >
      <img
        src={product.image}
        alt={product.title}
        className="mx-auto mb-4 h-[200px] sm:h-[300px] lg:h-[360px] object-contain border border-muted/30 shadow-sm hover:shadow-md transition rounded-lg"
      />
      <CardContent className="p-0 space-y-1 text-left">
        <div className="text-sm font-medium text-muted-foreground">
          {product.id}
        </div>
        <CardTitle>{product.title}</CardTitle>
        <div className="flex flex-col gap-5">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Style:</span>{" "}
            <span className="#27314B">{product.style}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Collection:</span>{" "}
            <span className="#27314B">{product.collection}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Category:</span>{" "}
            <span className="#27314B">{product.category}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StockSelections = () => {
  const [openProductDetailSheet, setOpenProductDetailSheet] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleView = useCallback((product) => {
    setSelectedProduct(product);
    setOpenProductDetailSheet(true);
  }, []);

  const handleColumnClick = (columnId) => {
    console.log("Column clicked:", columnId);
  };

  const columns = useStockSelections({
    onClick: handleColumnClick,
    onView: handleView,
  });

  return (
    <>
      <div className="flex flex-col space-y-[10px]">
        {/* Top Category Selector */}
        <div className="flex items-center gap-2 px-4 pt-4">
          <Button variant="ghost" size="icon" aria-label="Go back">
            <ChevronLeft size={20} />
          </Button>

          <div className="relative">
            <Select
              value={selectedCategory}
              onValueChange={(val) => setSelectedCategory(val)}
            >
              <SelectTrigger className="w-fit min-w-[150px]">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {STOCK_PRODUCT_DETAIL.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {toTitleCase(item.title)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-[25px] px-4 py-3 text-sm font-medium text-muted-foreground">
          {FILTERS_CONFIG.map((filter) => (
            <div key={filter.key} className="flex items-center gap-2 relative">
              <label className="text-muted-foreground">{filter.label}</label>
              <div className="relative">
                <Select
                  onValueChange={(val) => console.log(`${filter.key}: ${val}`)}
                >
                  <SelectTrigger className="w-fit min-w-[150px]">
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {toTitleCase(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <Card className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full p-[30px] mt-[30px]">
        {STOCK_PRODUCT_DETAIL.map((product) => (
          <div key={product.id} className="p-4">
            <div className="flex flex-col">
              <div className="flex items-start text-start gap-[40px]">
                <Image
                  src={product.image}
                  alt={product.title}
                  width={200}
                  height={200}
                  className="rounded-lg h-[200px] w-auto object-contain border border-muted/30 mb-4 bg-[#FCFCFC]"
                />
                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-medium">{product.id}</h3>
                  <h2 className="text-lg font-semibold">{product.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    Style: {toTitleCase(product.style)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Collection: {toTitleCase(product.collection)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Category: {toTitleCase(product.category)}
                  </p>
                </div>
              </div>

              {/* Variants table */}
              <ListWithCardToggle
                title="Select Variants"
                data={STOCK_DETAIL}
                columns={columns}
                filterFunction={filterStockSelections}
                resizableColumns
                infiniteScroll
              />
            </div>
          </div>
        ))}
      </Card>

      {/* Summary Section */}
      <Card className="w-full mt-4">
        <CardHeader className="sticky top-0 z-10 bg-white dark:bg-card py-5 px-6 shadow-sm border rounded-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            <span className="flex items-center gap-x-2 text-sm font-normal text-secondary-foreground">
              Variants Selected: 3/5
            </span>

            <span className="text-sm font-normal text-secondary-foreground text-center">
              Estimated Price: $2400.43
            </span>

            <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3">
              <Link href="#" className="w-full sm:w-auto">
                <Button variant="outline" className="shrink-0">
                  <ShoppingCart className="mr-1 h-4 w-4" />
                  Add all to Cart
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Footer Section */}
      <Card className="w-full mt-4">
        <CardHeader className="sticky top-0 z-10 bg-white dark:bg-card py-5 px-6 shadow-sm border border-primary rounded-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            <span className="flex items-center gap-x-2 text-sm font-normal text-secondary-foreground">
              Total Products Selected: 45
              <img
                src="/images/information-2.svg"
                alt="Information"
                className="w-4 h-4"
              />
            </span>

            <span className="text-sm font-normal text-secondary-foreground text-center">
              Budget Used:{" "}
              <span className="font-semibold">15,45,000 / 4,00,00,000</span>
            </span>

            <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3">
              <Link href="#" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  Save Draft
                </Button>
              </Link>
              <Link href="#" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto bg-[#F1F1F2]"
                >
                  Previous
                </Button>
              </Link>
              <Link href="#" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-primary text-white">
                  Next
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
      </Card>
    </>
  );
};

export default StockSelections;

// "use client";

// import React, { useState, useCallback, useEffect } from "react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/common/ui/cards/card";
// import { ListWithCardToggle } from "@/components/common/ui/ListWithCardToggle";
// import { useStockSelections } from "@/components/commonPages/StockSelections/hooks/useStockSelections";
// import { useFilteredStoreData } from "@/components/commonPages/StockSelections/hooks/useFilteredData";
// import { Button } from "@/components/common/ui/button";
// import { ShoppingCart } from "lucide-react";
// import Link from "next/link";

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/common/ui/select";
// import { useCrudApi } from "@/hooks/useCrudApi";
// import { toTitleCase } from "@/lib/utils";
// import { Skeleton } from "@/components/common/ui/skeleton";

// const StockSelections = () => {
//   const [openProductDetailSheet, setOpenProductDetailSheet] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [selectedSubCategory, setSelectedSubCategory] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [selectedFilters, setSelectedFilters] = useState({});

//   const [filters, setFilters] = useState([]);
//   const [productsData, setProductsData] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const { fetchAll } = useCrudApi("/api/stock-selection/categories");
//   const { fetchAll: filterOptions } = useCrudApi(
//     "/api/stock-selection/stock-filter-options"
//   );
//   const { fetchAll: products } = useCrudApi("/api/stock-selection/products");

//   // Fetch categories & filters only
//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const categoriesRes = await fetchAll();
//       if (Array.isArray(categoriesRes?.data)) setCategories(categoriesRes.data);

//       const filterOptionsRes = await filterOptions();
//       if (filterOptionsRes?.data) {
//         const dropdownData = Object.entries(filterOptionsRes.data).map(
//           ([key, arr]) => ({
//             key: key || `filter-${Math.random()}`,
//             label: key
//               ? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
//               : "Unnamed Filter",
//             options: Array.isArray(arr)
//               ? arr.map((item, idx) => ({
//                   value: String(item.id || idx),
//                   label: item.name || item.value || `Option ${idx + 1}`,
//                 }))
//               : [],
//           })
//         );
//         setFilters({ data: dropdownData });
//       }
//     } catch (err) {
//       console.error("Error fetching categories/filters:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch products when selectedCategory changes
//   // useEffect(() => {
//   //   if (!selectedCategory) return;
//   //   const fetchProducts = async () => {
//   //     try {
//   //       setLoading(true);
//   //       console.log(`Fetching products for category_id: ${selectedCategory}`);
//   //       const productsRes = await products({
//   //         category_id: Number(selectedCategory),
//   //         sub_category_id: selectedSubCategory
//   //           ? [Number(selectedSubCategory)]
//   //           : [],
//   //       });

//   //       setProductsData(productsRes.data);
//   //     } catch (err) {
//   //       console.error("Error fetching products:", err);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   //   fetchProducts();
//   // }, [selectedCategory]);

//   useEffect(() => {
//     if (!selectedCategory) return;
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         console.log(
//           `Fetching products for category: ${selectedCategory}, sub-category: ${selectedSubCategory}`
//         );
//         const productsRes = await products({
//           category_id: Number(selectedCategory),
//           sub_category_id: selectedSubCategory
//             ? [Number(selectedSubCategory)]
//             : [],
//         });
//         setProductsData(productsRes.data);
//       } catch (err) {
//         console.error("Error fetching products:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [selectedCategory, selectedSubCategory]); // ✅ added here

//   // Initial load for categories & filters
//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleView = useCallback((product) => {
//     setSelectedProduct(product);
//     setOpenProductDetailSheet(true);
//   }, []);

//   const handleColumnClick = (columnId) => {
//     console.log("Column clicked:", columnId);
//   };

//   const columns = useStockSelections({
//     onClick: handleColumnClick,
//     onView: handleView,
//   });

//   return (
//     <>
//       <div className="flex flex-col space-y-[10px]">
//         {/* Top Category Selector */}
//         {/* <div className="flex items-center gap-2 px-4 pt-4">
//           <Button variant="ghost" size="icon">
//             <img src="/images/icons/arrow-left.svg" alt="Back" />
//           </Button>

//           <div className="relative">
//             {loading ? (
//               <Skeleton className="h-10 w-[150px]" />
//             ) : (
//               <Select
//                 value={selectedCategory}
//                 onValueChange={(val) => setSelectedCategory(val)}
//               >
//                 <SelectTrigger className="w-fit min-w-[150px]">
//                   <SelectValue placeholder="Select Category" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {categories.map((item, idx) => (
//                     <SelectItem
//                       key={item.id || `cat-${idx}`}
//                       value={item.id?.toString() || `cat-${idx}`}
//                     >
//                       {toTitleCase(item.name || `Category ${idx + 1}`)}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             )}
//           </div>
//         </div> */}
//         <div className="flex items-center gap-2 px-4 pt-4">
//           <Button variant="ghost" size="icon">
//             <img src="/images/icons/arrow-left.svg" alt="Back" />
//           </Button>

//           {/* Category Select */}
//           <div className="relative">
//             {loading ? (
//               <Skeleton className="h-10 w-[150px]" />
//             ) : (
//               <Select
//                 value={selectedCategory}
//                 onValueChange={(val) => {
//                   setSelectedCategory(val);
//                   setSelectedSubCategory(""); // reset sub-category
//                   setProductsData({ products: [], sub_categories: [] }); // clear old products
//                   console.log("Category selected:", val);
//                 }}
//               >
//                 <SelectTrigger className="w-fit min-w-[150px]">
//                   <SelectValue placeholder="Select Category" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {categories.map((item, idx) => (
//                     <SelectItem
//                       key={item.id || `cat-${idx}`}
//                       value={item.id?.toString() || `cat-${idx}`}
//                     >
//                       {toTitleCase(item.name || `Category ${idx + 1}`)}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             )}
//           </div>

//           {/* Sub-Category Select */}
//           {selectedCategory && productsData?.sub_categories?.length > 0 && (
//             <div className="relative">
//               <Select
//                 value={selectedSubCategory}
//                 onValueChange={(val) => {
//                   setSelectedSubCategory(val);
//                   console.log("Sub-category selected:", val);
//                 }}
//               >
//                 <SelectTrigger className="w-fit min-w-[150px]">
//                   <SelectValue placeholder="Select Sub Category" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {productsData.sub_categories.map((sub, idx) => (
//                     <SelectItem
//                       key={sub.id || `sub-${idx}`}
//                       value={sub.id?.toString() || `sub-${idx}`}
//                     >
//                       {toTitleCase(sub.name || `Sub Category ${idx + 1}`)}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           )}
//         </div>

//         {/* Filters Row */}
//         <div className="flex flex-wrap items-center gap-[25px] px-4 py-3 text-sm font-medium text-muted-foreground">
//           {loading
//             ? Array.from({ length: 3 }).map((_, i) => (
//                 <Skeleton key={`filter-skel-${i}`} className="h-10 w-[150px]" />
//               ))
//             : filters.data?.map((filter, filterIdx) => (
//                 <div
//                   key={filter.key || `filter-${filterIdx}`}
//                   className="flex items-center gap-2 relative"
//                 >
//                   <label className="text-muted-foreground">
//                     {filter.label}
//                   </label>
//                   <div className="relative">
//                     <Select
//                       onValueChange={(val) =>
//                         setSelectedFilters((prev) => ({
//                           ...prev,
//                           [filter.key]: val,
//                         }))
//                       }
//                     >
//                       <SelectTrigger className="w-fit min-w-[150px]">
//                         <SelectValue placeholder={filter.label} />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {filter.options.map((option, optIdx) => (
//                           <SelectItem
//                             key={`${filter.key || "filter"}-${
//                               option.value || optIdx
//                             }`} // ✅ Safe fallback
//                             value={option.value || `opt-${optIdx}`}
//                           >
//                             {toTitleCase(option.label)}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//               ))}
//         </div>
//       </div>

//       {/* Product List */}
//       <Card className="grid grid-cols-2 gap-4 w-full p-[30px] mt-[30px]">
//         {loading
//           ? Array.from({ length: 4 }).map((_, idx) => (
//               <div key={`prod-skel-${idx}`} className="p-4">
//                 <Skeleton className="h-[200px] w-full rounded-lg mb-4" />
//                 <Skeleton className="h-4 w-3/4 mb-2" />
//                 <Skeleton className="h-4 w-1/2 mb-2" />
//                 <Skeleton className="h-4 w-2/3" />
//               </div>
//             ))
//           : productsData?.products?.map((product, prodIdx) => (
//               <div
//                 key={product.product_id || `prod-${prodIdx}`}
//                 className="p-4"
//               >
//                 <div className="flex flex-col">
//                   <div className="flex items-start text-start gap-[40px]">
//                     <img
//                       src={product.product_image}
//                       alt={product.title || "Product"}
//                       className="rounded-lg h-[200px] object-contain border border-muted/30 mb-4 bg-[#FCFCFC]"
//                     />
//                     <div className="flex flex-col gap-2">
//                       <h3 className="text-base font-medium">
//                         {product.design_no || "N/A"}
//                       </h3>
//                       <h2 className="text-lg font-semibold">
//                         {product.title || "Untitled Product"}
//                       </h2>
//                       <p className="text-sm text-muted-foreground">
//                         Style: {toTitleCase(product.sub_category || "N/A")}
//                       </p>
//                       <p className="text-sm text-muted-foreground">
//                         Collection: {toTitleCase(product.collection || "N/A")}
//                       </p>
//                       <p className="text-sm text-muted-foreground">
//                         Category: {toTitleCase(product.category || "N/A")}
//                       </p>
//                     </div>
//                   </div>
//                   <ListWithCardToggle
//                     title="Select Variants"
//                     data={product?.variants}
//                     columns={columns}
//                     useFilteredData={useFilteredStoreData}
//                   />
//                 </div>
//               </div>
//             ))}
//       </Card>

//       {/* Variants Selected Card */}
//       {!loading && (
//         <Card className="w-full mt-4">
//           <CardHeader className="sticky top-0 z-10 bg-white dark:bg-card py-5 px-6 shadow-sm border rounded-md">
//             <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
//               <span className="flex items-center gap-x-2 text-sm font-normal text-secondary-foreground">
//                 Variants Selected: 3/5
//               </span>

//               <span className="text-sm font-normal text-secondary-foreground text-center">
//                 Estimated Price: $2400.43
//               </span>

//               <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3">
//                 <Link href="#" className="w-full sm:w-auto">
//                   <Button variant="outline" className="shrink-0">
//                     <ShoppingCart className="mr-1 h-4 w-4" />
//                     Add all to Cart
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           </CardHeader>
//         </Card>
//       )}

//       {/* Budget Card */}
//       {!loading && (
//         <Card className="w-full mt-4">
//           <CardHeader className="sticky top-0 z-10 bg-white dark:bg-card py-5 px-6 shadow-sm border border-primary rounded-md">
//             <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
//               <span className="flex items-center gap-x-2 text-sm font-normal text-secondary-foreground">
//                 Total Products Selected: 45
//                 <img
//                   src="/images/information-2.svg"
//                   alt="Information"
//                   className="w-4 h-4"
//                 />
//               </span>

//               <span className="text-sm font-normal text-secondary-foreground text-center">
//                 Budget Used:{" "}
//                 <span className="font-semibold">15,45,000 / 4,00,00,000</span>
//               </span>

//               <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3">
//                 <Link href="#" className="w-full sm:w-auto">
//                   <Button variant="outline" className="w-full sm:w-auto">
//                     Save Draft
//                   </Button>
//                 </Link>
//                 <Link href="#" className="w-full sm:w-auto">
//                   <Button
//                     variant="outline"
//                     className="w-full sm:w-auto bg-[#F1F1F2]"
//                   >
//                     Previous
//                   </Button>
//                 </Link>
//                 <Link href="#" className="w-full sm:w-auto">
//                   <Button className="w-full sm:w-auto bg-primary text-white">
//                     Next
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           </CardHeader>
//         </Card>
//       )}
//     </>
//   );
// };

// export default StockSelections;

// "use client";

// import React, { useState, useCallback, useEffect } from "react";
// import { Card, CardHeader, CardTitle } from "@/components/common/ui/cards/card";
// import { useStockSelections } from "@/components/commonPages/StockSelections/hooks/useStockSelections";
// import { useFilteredStoreData } from "@/components/commonPages/StockSelections/hooks/useFilteredData";
// import { Button } from "@/components/common/ui/button";
// import { ShoppingCart } from "lucide-react";
// import Link from "next/link";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/common/ui/select";
// import { useCrudApi } from "@/hooks/useCrudApi";
// import { toTitleCase } from "@/lib/utils";
// import { Skeleton } from "@/components/common/ui/skeleton";
// import { ListWithCardToggle } from "@/components/common/ui/ListWithCardToggle";

// const StockSelections = () => {
//   const [openProductDetailSheet, setOpenProductDetailSheet] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [selectedSubCategory, setSelectedSubCategory] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [selectedFilters, setSelectedFilters] = useState({});
//   const [filters, setFilters] = useState({ data: [] });
//   const [productsData, setProductsData] = useState({
//     products: [],
//     sub_categories: [],
//   });
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const { fetchAll } = useCrudApi("/api/stock-selection/categories");
//   const { fetchAll: filterOptions } = useCrudApi(
//     "/api/stock-selection/stock-filter-options"
//   );
//   const { fetchAll: products } = useCrudApi("/api/stock-selection/products");

//   // Fetch categories & filters
//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const categoriesRes = await fetchAll();
//       if (Array.isArray(categoriesRes?.data)) {
//         setCategories(categoriesRes.data);
//         if (categoriesRes.data.length > 0) {
//           setSelectedCategory(categoriesRes.data[0].id.toString());
//         }
//       }

//       const filterOptionsRes = await filterOptions();
//       console.log("Filter Options:", filterOptionsRes.data);
//       if (filterOptionsRes?.data) {
//         const dropdownData = Object.entries(filterOptionsRes.data).map(
//           ([key, arr]) => ({
//             key: key || `filter-${Math.random()}`,
//             label: key
//               ? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
//               : "Unnamed Filter",
//             options: Array.isArray(arr)
//               ? arr.map((item, idx) => ({
//                   value: String(item.id || idx),
//                   label: item.name || item.value || `Option ${idx + 1}`,
//                 }))
//               : [],
//           })
//         );
//         setFilters({ data: dropdownData });
//       }
//     } catch (err) {
//       console.error("Error fetching categories/filters:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch products
//   useEffect(() => {
//     if (!selectedCategory) return;
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         const params = {
//           category_id: Number(selectedCategory),
//           sub_category_id: selectedSubCategory
//             ? [Number(selectedSubCategory)]
//             : [],
//           ...selectedFilters,
//         };
//         console.log("Fetching products with params:", params);
//         const productsRes = await products(params);
//         setProductsData({
//           products: productsRes.data.products || [],
//           sub_categories: productsRes.data.sub_categories || [],
//         });
//       } catch (err) {
//         console.error("Error fetching products:", err);
//         setProductsData({ products: [], sub_categories: [] });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [selectedCategory, selectedSubCategory, selectedFilters]);

//   // Initial load
//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleView = useCallback((product) => {
//     setSelectedProduct(product);
//     setOpenProductDetailSheet(true);
//   }, []);

//   const handleColumnClick = (columnId) => {
//     console.log("Column clicked:", columnId);
//   };

//   const columns = useStockSelections({
//     onClick: handleColumnClick,
//     onView: handleView,
//   });

//   return (
//     <>
//       <div className="flex flex-col space-y-[10px]">
//         {/* Category and Subcategory Selectors */}
//         <div className="flex flex-wrap md:flex-nowrap items-center gap-2 px-4 pt-4">
//           <Button variant="ghost" size="icon">
//             <img src="/images/icons/arrow-left.svg" alt="Back" />
//           </Button>

//           {/* Category Select */}
//           <div className="relative">
//             {loading ? (
//               <Skeleton className="h-10 w-[150px]" />
//             ) : (
//               <Select
//                 value={selectedCategory}
//                 onValueChange={(val) => {
//                   setSelectedCategory(val);
//                   setSelectedSubCategory("");
//                   setProductsData({ products: [], sub_categories: [] });
//                   console.log("Category selected:", val);
//                 }}
//               >
//                 <SelectTrigger className="w-fit min-w-[150px]">
//                   <SelectValue placeholder="Select Category" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {categories.map((item, idx) => (
//                     <SelectItem
//                       key={item.id || `cat-${idx}`}
//                       value={item.id?.toString() || `cat-${idx}`}
//                     >
//                       {toTitleCase(item.name || `Category ${idx + 1}`)}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             )}
//           </div>

//           {/* Sub-Category Select */}
//           {selectedCategory && (
//             <div className="relative">
//               {loading ? (
//                 <Skeleton className="h-10 w-[150px]" />
//               ) : productsData?.sub_categories?.length > 0 ? (
//                 <Select
//                   value={selectedSubCategory}
//                   onValueChange={(val) => {
//                     setSelectedSubCategory(val);
//                     console.log("Sub-category selected:", val);
//                   }}
//                 >
//                   <SelectTrigger className="w-fit min-w-[150px]">
//                     <SelectValue placeholder="Select Sub Category" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {productsData.sub_categories.map((sub, idx) => (
//                       <SelectItem
//                         key={sub.id || `sub-${idx}`}
//                         value={sub.id?.toString() || `sub-${idx}`}
//                       >
//                         {toTitleCase(sub.name || `Sub Category ${idx + 1}`)}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               ) : (
//                 <div>No subcategories available</div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Filters Row */}
//         <div className="flex flex-wrap gap-4 px-4 py-3 text-sm font-medium text-muted-foreground">
//           {loading
//             ? Array.from({ length: 4 }).map((_, i) => (
//                 <Skeleton key={`filter-skel-${i}`} className="h-10 w-[150px]" />
//               ))
//             : filters.data?.map((filter, filterIdx) => (
//                 <div
//                   key={filter.key || `filter-${filterIdx}`}
//                   className="flex items-center gap-2 relative"
//                 >
//                   <label className="text-muted-foreground">
//                     {filter.label}
//                   </label>
//                   <div className="relative">
//                     <Select
//                       onValueChange={(val) =>
//                         setSelectedFilters((prev) => ({
//                           ...prev,
//                           [filter.key]: val,
//                         }))
//                       }
//                       value={selectedFilters[filter.key] || ""}
//                     >
//                       <SelectTrigger className="w-fit min-w-[150px]">
//                         <SelectValue placeholder={filter.label} />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {filter.options.length > 0 ? (
//                           filter.options.map((option, optIdx) => (
//                             <SelectItem
//                               key={`${filter.key || "filter"}-${
//                                 option.value || optIdx
//                               }`}
//                               value={option.value || `opt-${optIdx}`}
//                             >
//                               {toTitleCase(option.label)}
//                             </SelectItem>
//                           ))
//                         ) : (
//                           <SelectItem value="none" disabled>
//                             No options available
//                           </SelectItem>
//                         )}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//               ))}
//           <Button
//             variant="outline"
//             onClick={() => {
//               setSelectedFilters({});
//               setSelectedSubCategory("");
//               setSelectedCategory("");
//               setProductsData({ products: [], sub_categories: [] });
//             }}
//           >
//             Clear All Filters
//           </Button>
//         </div>
//       </div>

//       {/* Product List */}
//       <Card className="grid grid-cols sm:grid-cols-2 lg:grid-cols-2 gap-4 w-full p-4 sm:p-6 mt-6">
//         {loading ? (
//           Array.from({ length: 4 }).map((_, idx) => (
//             <div key={`prod-skel-${idx}`} className="p-4">
//               <Skeleton className="h-[200px] w-full rounded-lg mb-4" />
//               <Skeleton className="h-4 w-3/4 mb-2" />
//               <Skeleton className="h-4 w-1/2 mb-2" />
//               <Skeleton className="h-4 w-2/3" />
//             </div>
//           ))
//         ) : productsData?.products?.length > 0 ? (
//           productsData.products.map((product, prodIdx) => (
//             <div key={product.product_id || `prod-${prodIdx}`} className="p-4">
//               <div className="flex flex-col">
//                 <div className="flex flex-col md:flex-row items-start text-start gap-4 md:gap-[40px]">
//                   <img
//                     src={product.product_image}
//                     alt={product.title || "Product"}
//                     className=" rounded-lg w-full h-auto max-h-[200px] object-contain border border-muted/30 mb-4 bg-[#FCFCFC]"
//                   />
//                   <div className="flex flex-col gap-2">
//                     <h3 className="text-base font-medium">
//                       {product.design_no || "N/A"}
//                     </h3>
//                     <h2 className="text-lg font-semibold">
//                       {product.title || "Untitled Product"}
//                     </h2>
//                     <p className="text-sm text-muted-foreground">
//                       Style: {toTitleCase(product.sub_category || "N/A")}
//                     </p>
//                     <p className="text-sm text-muted-foreground">
//                       Collection: {toTitleCase(product.collection || "N/A")}
//                     </p>
//                     <p className="text-sm text-muted-foreground">
//                       Category: {toTitleCase(product.category || "N/A")}
//                     </p>
//                   </div>
//                 </div>
//                 <ListWithCardToggle
//                   title="Select Variants"
//                   data={product?.variants}
//                   columns={columns}
//                   useFilteredData={useFilteredStoreData}
//                 />
//               </div>
//             </div>
//           ))
//         ) : (
//           <div>No products found for the selected category.</div>
//         )}
//       </Card>

//       {/* Variants Selected Card */}
//       {!loading && (
//         <Card className="w-full mt-4">
//           <CardHeader className="sticky top-0 z-10 bg-white dark:bg-card py-5 px-6 shadow-sm border rounded-md">
//             <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
//               <span className="flex items-center gap-x-2 text-sm font-normal text-secondary-foreground">
//                 Variants Selected: 3/5
//               </span>
//               <span className="text-sm font-normal text-secondary-foreground text-center">
//                 Estimated Price: $2400.43
//               </span>
//               <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3">
//                 <Link href="#" className="w-full sm:w-auto">
//                   <Button variant="outline" className="shrink-0">
//                     <ShoppingCart className="mr-1 h-4 w-4" />
//                     Add all to Cart
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           </CardHeader>
//         </Card>
//       )}

//       {/* Budget Card */}
//       {!loading && (
//         <Card className="w-full mt-4">
//           <CardHeader className="sticky top-0 z-10 bg-white dark:bg-card py-5 px-6 shadow-sm border border-primary rounded-md">
//             <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
//               <span className="flex items-center gap-x-2 text-sm font-normal text-secondary-foreground">
//                 Total Products Selected: 45
//                 <img
//                   src="/images/information-2.svg"
//                   alt="Information"
//                   className="w-4 h-4"
//                 />
//               </span>
//               <span className="text-sm font-normal text-secondary-foreground text-center">
//                 Budget Used:{" "}
//                 <span className="font-semibold">15,45,000 / 4,00,00,000</span>
//               </span>
//               <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3">
//                 <Link href="#" className="w-full sm:w-auto">
//                   <Button variant="outline" className="w-full sm:w-auto">
//                     Save Draft
//                   </Button>
//                 </Link>
//                 <Link href="#" className="w-full sm:w-auto">
//                   <Button
//                     variant="outline"
//                     className="w-full sm:w-auto bg-[#F1F1F2]"
//                   >
//                     Previous
//                   </Button>
//                 </Link>
//                 <Link href="#" className="w-full sm:w-auto">
//                   <Button className="w-full sm:w-auto bg-primary text-white">
//                     Next
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           </CardHeader>
//         </Card>
//       )}
//     </>
//   );
// };

// export default StockSelections;
