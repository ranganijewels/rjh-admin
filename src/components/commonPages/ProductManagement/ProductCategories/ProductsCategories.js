"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Folder } from "lucide-react";
import { toast } from "sonner";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/common/ui/breadcrumb";
import { Card, CardContent } from "@/components/common/ui/cards/card";
import { Page, PageHeader } from "@/components/common/ui/page";
import { Skeleton } from "@/components/common/ui/skeleton";
import { useCrudApi } from "@/hooks/useCrudApi";
import { toTitleCase } from "@/lib/utils";

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
      } catch {
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
    <Page>
      {/* Breadcrumb */}
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

      <PageHeader
        title="Product Categories"
        description="Select a category to manage the products inside it."
      />

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <Card
              key={category.id}
              role="button"
              tabIndex={0}
              onClick={() => handleCategoryClick(category.slug, category?.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCategoryClick(category.slug, category?.id);
                }
              }}
              className="group cursor-pointer transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Folder className="size-6 text-primary" aria-hidden="true" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                    {toTitleCase(category.custom_title || category.name)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {category.total_products_count || category.product_count}{" "}
                    Products
                  </p>
                </div>

                <ChevronRight
                  className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                  aria-hidden="true"
                />
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
            <Folder className="size-10 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">
              No categories found
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Categories appear here once products are grouped.
            </p>
          </div>
        )}
      </div>
    </Page>
  );
};

export default ProductsCategories;
