"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/common/ui/cards/card";
import { Input } from "@/components/common/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Search } from "lucide-react";
import { useCrudApi } from "@/hooks/useCrudApi";

// Fallback list kept in sync with CATEGORIES in ProductMasterList.js /
// ProductForm/index.jsx, used only until the categories API responds.
const FALLBACK_CATEGORIES = [
  "Rings",
  "Necklaces",
  "Wedding Bands",
  "Bracelets",
  "Earrings",
  "Pendants",
  "Bangles",
];

const FilterChips = ({ filters, setFilters }) => {
  const { fetchAll } = useCrudApi("/api/product-management/product-details");
  const [categoryOptions, setCategoryOptions] = useState(FALLBACK_CATEGORIES);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const res = await fetchAll();
        const names = Array.isArray(res?.data)
          ? res.data
              .map((item) => item?.category_name)
              .filter(Boolean)
          : [];

        if (isMounted && names.length > 0) {
          setCategoryOptions(names);
        }
      } catch (error) {
        // Keep fallback list on failure
        console.error("Error fetching categories for filter:", error);
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [fetchAll]);

  return (
    <div>
      <Card className="p-4 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-card">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="pl-10 rounded-xl"
              />
            </div>
          </div>

          {/* Category Filter */}
          <Select
            value={filters.category}
            onValueChange={(value) =>
              setFilters({ ...filters, category: value })
            }
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryOptions.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Collection Filter */}
          <Select
            value={filters.collection}
            onValueChange={(value) =>
              setFilters({ ...filters, collection: value })
            }
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Collection" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Collections</SelectItem>
              <SelectItem value="Bridal Collection">Bridal</SelectItem>
              <SelectItem value="Classic Collection">Classic</SelectItem>
              <SelectItem value="Designer Collection">Designer</SelectItem>
            </SelectContent>
          </Select>

          {/* Metal Filter */}
          <Select
            value={filters.metal}
            onValueChange={(value) => setFilters({ ...filters, metal: value })}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Metal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Metals</SelectItem>
              <SelectItem value="White Gold">White Gold</SelectItem>
              <SelectItem value="Yellow Gold">Yellow Gold</SelectItem>
              <SelectItem value="Platinum">Platinum</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select
            value={filters.sort}
            onValueChange={(value) => setFilters({ ...filters, sort: value })}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
    </div>
  );
};

export default FilterChips;
