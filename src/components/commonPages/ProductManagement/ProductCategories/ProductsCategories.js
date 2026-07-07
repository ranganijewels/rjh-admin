"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Folder, ChevronRight } from "lucide-react";
import { Card } from "@/components/common/ui/cards/card";
import {
  Toolbar,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/components/common/ui/toolbar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/common/ui/breadcrumb";
import { useCrudApi } from "@/hooks/useCrudApi";
import { Skeleton } from "@/components/common/ui/skeleton"; // optional for loading shimmer
import { toTitleCase } from "@/lib/utils";
import { toast } from "sonner";

export const ProductsCategories = () => {
  const router = useRouter();

  // useCrudApi connected to your route
  const { fetchAll } = useCrudApi("/api/product-management/product-details");

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchAll();

        if (res?.status && Array.isArray(res.data)) {
          const formatted = res.data.map((item) => ({
            id: item.category_id,
            name: item.category_name,
            slug: item.category_name.toLowerCase(),
            product_count: item.total,
          }));

          setCategories(formatted);
        } else {
          toast.error(res?.message || "Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Something went wrong while loading categories");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [fetchAll]);

  const handleCategoryClick = (slug, id) => {
    router.push(`/dashboard/product-categories/${slug}?category_id=${id}`);
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="ml-5">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/product-management">
                Product Management
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Product Categories</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <div className="mt-6 ml-5">
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle
              text="Product Categories"
              className="font-semibold !text-foreground text-lg"
            />
            <ToolbarDescription className="mt-1 text-sm">
              Select a category to manage products
            </ToolbarDescription>
          </ToolbarHeading>
        </Toolbar>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <Card
              key={category.id}
              onClick={() => handleCategoryClick(category.slug, category?.id)}
              className="p-6 rounded-xl border border-gray-200 transition-all cursor-pointer group bg-white hover:border-primary hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center transition-all">
                  <Folder className="w-8 h-8 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-gray-900 mb-1 font-medium group-hover:text-primary">
                    {toTitleCase(category.custom_title || category.name)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {category.total_products_count || category.product_count}{" "}
                    Products
                  </p>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No categories found.
          </p>
        )}
      </div>
    </>
  );
};

export default ProductsCategories;
