"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ShoppingCart } from "lucide-react";

import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { Button } from "@/components/common/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/cards/card";
import { Label } from "@/components/common/ui/label";
import { Page, PageHeader } from "@/components/common/ui/page";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { useStockSelections } from "@/components/commonPages/StockSelections/hooks/useStockSelections";
import { toTitleCase } from "@/lib/utils";
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

const StockSelections = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleView = useCallback((product) => {
    setSelectedProduct(product);
  }, []);

  // The "Add to Bag" cell action is not wired to an API yet — it only marks
  // the row as the one being worked on.
  const handleColumnClick = useCallback(() => {}, []);

  const columns = useStockSelections({
    onClick: handleColumnClick,
    onView: handleView,
  });

  return (
    <Page>
      <PageHeader
        title="Stock Selection"
        description="Choose the designs and variants you want to stock for your storefront."
        actions={
          <Button
            variant="outline"
            size="md"
            mode="icon"
            aria-label="Go back"
            title="Go back"
          >
            <ChevronLeft className="size-4" />
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-foreground">
            Filters
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Narrow the catalogue down before you pick your variants.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="stock-category">Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={(val) => setSelectedCategory(val)}
            >
              <SelectTrigger id="stock-category" className="w-fit min-w-[150px]">
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

          {FILTERS_CONFIG.map((filter) => (
            <div key={filter.key} className="grid gap-1.5">
              <Label htmlFor={`stock-filter-${filter.key}`}>
                {filter.label}
              </Label>
              <Select
                value={filterValues[filter.key] ?? ""}
                onValueChange={(val) =>
                  setFilterValues((prev) => ({ ...prev, [filter.key]: val }))
                }
              >
                <SelectTrigger
                  id={`stock-filter-${filter.key}`}
                  className="w-fit min-w-[150px]"
                >
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
          ))}
        </CardContent>
      </Card>

      {/* Products */}
      <div className="grid grid-cols-1 content-start gap-5 xl:grid-cols-2">
        {STOCK_PRODUCT_DETAIL.map((product) => {
          const isSelected = selectedProduct?.id === product.id;

          return (
            <div key={product.id} className="grid content-start gap-4">
              <Card className={isSelected ? "border-primary" : undefined}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Image
                      src={product.image}
                      alt={product.title}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-lg border border-border bg-muted/30 object-contain"
                    />
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-semibold text-foreground">
                        {toTitleCase(product.title)}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {product.id}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-1.5 text-xs text-muted-foreground">
                  <p>
                    Style:{" "}
                    <span className="font-medium text-foreground">
                      {toTitleCase(product.style)}
                    </span>
                  </p>
                  <p>
                    Collection:{" "}
                    <span className="font-medium text-foreground">
                      {toTitleCase(product.collection)}
                    </span>
                  </p>
                  <p>
                    Category:{" "}
                    <span className="font-medium text-foreground">
                      {toTitleCase(product.category)}
                    </span>
                  </p>
                </CardContent>
              </Card>

              <ListWithCardToggle
                title="Select Variants"
                titleAs="none"
                data={STOCK_DETAIL}
                columns={columns}
                filterFunction={filterStockSelections}
                resizableColumns
                infiniteScroll
              />
            </div>
          );
        })}
      </div>

      {/* Selection summary */}
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <span className="text-sm text-muted-foreground">
              Variants Selected: 3/5
            </span>

            <span className="text-sm text-muted-foreground">
              Estimated Price: $2400.43
            </span>

            <div className="flex flex-col items-center gap-2 sm:flex-row md:gap-3">
              <Button variant="outline" size="md" asChild>
                <Link href="#">
                  <ShoppingCart className="size-4" />
                  Add all to Cart
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Step navigation */}
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <span className="flex items-center gap-x-2 text-sm text-muted-foreground">
              Total Products Selected: 45
              <img
                src="/images/information-2.svg"
                alt="Information"
                className="size-4"
              />
            </span>

            <span className="text-sm text-muted-foreground">
              Budget Used:{" "}
              <span className="font-semibold text-foreground">
                15,45,000 / 4,00,00,000
              </span>
            </span>

            <div className="flex flex-col items-center gap-2 sm:flex-row md:gap-3">
              <Button variant="ghost" size="md" asChild>
                <Link href="#">Save Draft</Link>
              </Button>
              <Button variant="outline" size="md" asChild>
                <Link href="#">Previous</Link>
              </Button>
              <Button size="md" asChild>
                <Link href="#">Next</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Page>
  );
};

export default StockSelections;
