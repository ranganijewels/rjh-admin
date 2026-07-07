"use client";

import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/common/ui/breadcrumb";
import { Card } from "@/components/common/ui/cards/card";
import { Skeleton } from "@/components/common/ui/skeleton";
import { ChevronRight, Folder } from "lucide-react";
import { toTitleCase } from "@/lib/utils";
import { useCrudApi } from "@/hooks/useCrudApi";

const FolderCollections = ({
  category,
  onBack = () => {},
  onSelectSubCategory = () => {},
}) => {
  const { fetchAll: fetchSubCategories } = useCrudApi(
    "/api/product-management/sub-category"
  );

  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchSubCategories({ category_id: category?.id });

    if (res?.status) {
      setSubCategories(res?.data || []);
    } else {
      setSubCategories([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (category?.id) loadData();
  }, [category]);

  return (
    <>
      <div className="ml-5">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={onBack} className="cursor-pointer">
                Product Categories
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{toTitleCase(category.name)}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mt-4 ml-5">
        <h1 className="text-xl font-semibold">
          {toTitleCase(category.name)} Collections
        </h1>
        <p className="text-sm text-gray-500">
          {subCategories.length} Collections
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          : subCategories.map((item) => (
              <Card
                key={item.id}
                onClick={() => onSelectSubCategory(item, category)}
                className="p-6 rounded-xl border border-gray-200 transition-all cursor-pointer group bg-white hover:border-primary hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Folder className="w-8 h-8 text-primary" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-1 font-medium group-hover:text-primary">
                      {toTitleCase(item.name)} Collection
                    </h3>
                    <p className="text-sm text-gray-500">
                      {item.product_count || 0} Items
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                </div>
              </Card>
            ))}
      </div>
    </>
  );
};

export default FolderCollections;
