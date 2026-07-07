"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader } from "@/components/common/ui/cards/card";
import { useStockSelections } from "@/components/commonPages/StockSelections/hooks/useStockSelections";
import { useFilteredStoreData } from "@/components/commonPages/StockSelections/hooks/useFilteredData";
import { Button } from "@/components/common/ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { useCrudApi } from "@/hooks/useCrudApi";
import { toTitleCase } from "@/lib/utils";
import { Skeleton } from "@/components/common/ui/skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";

const BrowseProducts = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category_id") || ""
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [filters, setFilters] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState([]);
  const { fetchAll: fetchCategories } = useCrudApi(
    "/api/stock-selection/categories"
  );
  const { fetchAll: fetchFilterOptions } = useCrudApi(
    "/api/stock-selection/stock-filter-options"
  );

  const { create } = useCrudApi("/api/stock-selection/add-to-bag");
  const { fetchAll: fetchProducts } = useCrudApi(
    "/api/product-management/browse-product"
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const categoriesRes = await fetchCategories();
      if (Array.isArray(categoriesRes?.data)) setCategories(categoriesRes.data);

      const filterOptionsRes = await fetchFilterOptions();
      if (filterOptionsRes?.data) {
        const dropdownData = Object.entries(filterOptionsRes.data).map(
          ([key, arr]) => ({
            key: key || `filter-${Math.random()}`,
            label: key ? toTitleCase(key.replace(/_/g, " ")) : "Unnamed Filter",
            options: Array.isArray(arr)
              ? arr.map((item, idx) => ({
                  value: String(item.id || idx),
                  label: item.name || item.value || `Option ${idx + 1}`,
                }))
              : [],
          })
        );
        setFilters({ data: dropdownData });
      }
    } catch (err) {
      console.error("Error fetching categories/filters:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCategory) return;

    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);

        // Build params object
        const params = {
          category_id: selectedCategory,
        };
        if (selectedSubCategory) {
          params.category_id = selectedSubCategory;
        }

        // Use fetchProducts from useCrudApi
        const productsRes = await fetchProducts({
          category_id: selectedCategory,
          // sub_category_id: selectedSubCategory,
        });

        if (productsRes?.data) {
          setProductsData(productsRes.data);
          setSelectedVariants([]);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [selectedCategory, selectedSubCategory]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddToBag = async (row) => {
    try {
      const payload = {
        items: [
          {
            product_id: row.original.product_id,
            variant_id: row.original.variant_id,
            price: parseFloat(row.original.selling_price || 0),
            category_id: selectedCategory,
          },
        ],
      };

      const res = await create(payload);

      if (res?.status || res?.status === 200) {
        toast.success(res?.message || "Variant added to bag successfully!");
      } else {
        toast.error(res?.message || "Failed to add to bag.");
      }
    } catch (err) {
      console.error("Add to bag error:", err);
      alert("Error adding variant to bag.");
    }
  };

  const handleVariantSelection = (variants) => setSelectedVariants(variants);

  const columns = useStockSelections({
    onClick: handleAddToBag,
    onSelectChange: setSelectedVariants,
  });

  const handleCategoryChange = (val) => {
    setSelectedCategory(val);

    // Update search params in URL
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("category_id", val); // add or replace category_id
    params.delete("page");

    router.replace(`?${params.toString()}`);
  };

  const handleSubCategoryChange = (val) => {
    setSelectedSubCategory(val);

    // Update search params in URL
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("subcat", val); // add or replace category_id
    params.delete("page");

    router.replace(`?${params.toString()}`);
  };
  return (
    <>
      {/* Category & Sub-Category Selectors */}
      <div className="flex items-center gap-2 px-4 pt-4">
        <Button variant="ghost" size="icon">
          <img src="/images/icons/arrow-left.svg" alt="Back" />
        </Button>

        <div className="relative">
          {loading ? (
            <Skeleton className="h-10 w-[150px]" />
          ) : (
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-fit min-w-[150px]">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((item, idx) => (
                  <SelectItem
                    key={item.id || `cat-${idx}`}
                    value={item.id?.toString() || `cat-${idx}`}
                  >
                    {toTitleCase(item.name || `Category ${idx + 1}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {selectedCategory && productsData?.sub_categories?.length > 0 && (
          <div className="relative">
            <Select
              value={selectedSubCategory}
              onValueChange={handleSubCategoryChange}
            >
              <SelectTrigger className="w-fit min-w-[150px]">
                <SelectValue placeholder="Select Sub Category" />
              </SelectTrigger>
              <SelectContent>
                {productsData.sub_categories.map((sub, idx) => (
                  <SelectItem
                    key={sub.id || `sub-${idx}`}
                    value={sub.id?.toString() || `sub-${idx}`}
                  >
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-6 px-4 py-3 text-sm font-medium text-muted-foreground">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={`filter-skel-${i}`} className="h-10 w-[150px]" />
            ))
          : filters.data?.map((filter, idx) => (
              <div
                key={filter.key || `filter-${idx}`}
                className="flex items-center gap-2 relative"
              >
                <label className="text-muted-foreground">{filter.label}</label>
                <div className="relative">
                  <Select
                    onValueChange={(val) => {
                      console.log("Filter selected:", val);
                    }}
                  >
                    <SelectTrigger className="w-fit min-w-[150px]">
                      <SelectValue placeholder={filter.label} />
                    </SelectTrigger>
                    <SelectContent>
                      {filter.options.map((option, optIdx) => (
                        <SelectItem
                          key={`${filter.key || "filter"}-${
                            option.value || optIdx
                          }`}
                          value={option.value || `opt-${optIdx}`}
                        >
                          {toTitleCase(option.label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
      </div>

      {/* Product List */}
      <Card className="grid grid-cols-1 gap-4 w-full p-[30px] mt-[30px]">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div key={`prod-skel-${idx}`} className="p-4">
                <Skeleton className="h-[200px] w-full rounded-lg mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))
          : productsData?.products?.map((product, idx) => (
              <div key={product.product_id || `prod-${idx}`} className="p-4">
                <div className="flex flex-col">
                  <div className="flex items-start text-start gap-[40px]">
                    <img
                      src={product?.product_image}
                      alt={product.title || "Product"}
                      className="rounded-lg h-[200px] object-contain border border-muted/30 mb-4 bg-[#FCFCFC]"
                    />
                    <div className="flex flex-col gap-2">
                      <h3 className="text-base font-medium">
                        {product.design_no || "N/A"}
                      </h3>
                      <h2 className="text-lg font-semibold">
                        {product.title || "Untitled Product"}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Style: {toTitleCase(product.sub_category || "N/A")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Collection: {toTitleCase(product.collection || "N/A")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Category: {toTitleCase(product.category || "N/A")}
                      </p>
                    </div>
                  </div>

                  {/* Variants Table */}
                  <ListWithCardToggle
                    title="Select Variants"
                    data={product?.variants}
                    columns={columns}
                    useFilteredData={useFilteredStoreData}
                    // onSelectionChange={handleVariantSelection}
                    onSelectionChange={setSelectedVariants}
                  />
                </div>
              </div>
            ))}
      </Card>

      {/* Selected Variants Card */}
      {!loading && (
        <Card className="w-full mt-4 sticky bottom-0 z-50">
          <CardHeader className="bg-white py-5 px-6 shadow-sm border rounded-md">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
              <span className="flex items-center gap-x-2 text-sm font-normal text-secondary-foreground">
                Variants Selected: {selectedVariants.length} /{" "}
                {selectedVariants.length || 5}
              </span>

              <span className="text-sm font-normal text-secondary-foreground text-center">
                Estimated Price: $
                {selectedVariants
                  .reduce(
                    (total, v) => total + parseFloat(v.selling_price || 0),
                    0
                  )
                  .toFixed(2)}
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
      )}
    </>
  );
};

export default BrowseProducts;
