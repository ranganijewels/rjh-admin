"use client";

import React, { useState } from "react";
import { Badge } from "@/components/common/ui/badge";
import { Button } from "@/components/common/ui/button";
import { Checkbox } from "@/components/common/ui/checkbox";
import { SafeImage } from "@/components/common/ui/safe-image";
import { Label } from "@/components/common/ui/label";
import { Separator } from "@/components/common/ui/separator";
import { Edit, Eye, Info } from "lucide-react";
import { Card } from "@/components/common/ui/cards/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/common/ui/tooltip";
import { ProductCardView } from "../ProductMasterList/ProductCardView";
import { toTitleCase } from "@/lib/utils";
import { useCrudApi } from "@/hooks/useCrudApi";

const ProductsGrid = ({
  products = [],
  selectedProducts = [],
  setHoveredProduct,
  handleSelectAll,
  handleProductSelect,
  hasMore,
  loadingMore,
  onLoadMore,
}) => {
  const [productdetails, setProductDetails] = useState(null);
  const { fetchById } = useCrudApi("/api/product-management");
  const [openProductDetailSheet, setOpenProductDetailSheet] = useState(false);

  const fetchProductDetail = async (productId) => {
    try {
      const res = await fetchById(productId, { category_id: selectedCategory });
      const data = await res.data;

      setProductDetails(data);
      setOpenProductDetailSheet(true);
    } catch (err) {
      console.error("Failed to fetch product detail:", err);
    } finally {
    }
  };

  const handleClose = () => {
    setOpenProductDetailSheet(false);
  };

  return (
    <div className="mt-6">
      {/* Select All */}
      {products.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <Checkbox
            checked={selectedProducts.length === products.length}
            onCheckedChange={handleSelectAll}
            id="select-all"
          />
          <Label htmlFor="select-all" className="text-sm cursor-pointer">
            Select All on This Page ({products.length})
          </Label>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product) => (
          <Card
            key={product.id}
            className="overflow-hidden rounded-xl border hover:shadow-xl transition-all group"
          >
            {/* Product Image */}
            <div
              className="relative h-80 bg-muted overflow-hidden"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <SafeImage
                src={product.product_image}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Checkbox */}
              <div className="absolute top-3 left-3 z-20">
                <div className="w-6 h-6 bg-card/95 rounded-lg shadow-lg flex items-center justify-center backdrop-blur-sm overflow-visible">
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={() => handleProductSelect(product.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-lg h-10 w-10 md:h-8 md:w-8 p-0 bg-card/90 hover:bg-card shadow-md"
                  aria-label="View product details"
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchProductDetail(product.id);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-lg h-10 w-10 md:h-8 md:w-8 p-0 bg-card/90 hover:bg-card shadow-md"
                  aria-label="Edit product"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>

              {/* Collection Badge */}
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <Badge className="bg-card/95 text-foreground border-0 backdrop-blur-sm shadow-lg text-xs">
                  {product.collection}
                </Badge>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-4 space-y-3">
              {/* Title + Code */}
              <div>
                <h3 className="text-foreground line-clamp-1 mb-1 text-[16px]">
                  {toTitleCase(product.title)}
                </h3>
                <code className="text-[12px] px-2 py-0.5 rounded-md border border-border bg-muted">
                  {product.design_no}
                </code>
              </div>

              {/* Info Row */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className="px-2 py-0.5">{product.shape}</span>

                <span className="px-2 py-0.5">{product.style}</span>

                <span className="px-2 py-0.5 rounded-md border border-border bg-muted">
                  {product.category}
                </span>
              </div>

              {/* Diamond Info */}
              <p className="text-[11px]">{product.diamondInfo}</p>

              {/* Metal Options */}
              <div className="flex flex-wrap gap-1">
                {product?.metal_colors?.map((metal, index) => (
                  <span
                    key={index}
                    className="text-[10px] px-2 py-0.5 rounded-md border border-border bg-muted"
                  >
                    {metal.replace("18K ", "").replace(" Gold", "")}
                  </span>
                ))}
              </div>
              <Separator />

              {/* Pricing */}
              <TooltipProvider>
                <div className="space-y-1.5">
                  {/* MRP */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between items-center cursor-help">
                        <span className="text-xs flex items-center gap-1">
                          MRP <Info className="w-2.5 h-2.5" />
                        </span>
                        <span className="text-xs text-foreground">
                          ${product.mrp}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p className="text-xs">
                        Market Retail Price - Suggested price
                      </p>
                    </TooltipContent>
                  </Tooltip>

                  {/* PRP */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between items-center cursor-help">
                        <span className="text-xs text-success flex items-center gap-1">
                          PRP <Info className="w-2.5 h-2.5" />
                        </span>
                        <span className="text-xs text-success">
                          ${product?.prp}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p className="text-xs">
                        Partner Retail Price - Your cost
                      </p>
                    </TooltipContent>
                  </Tooltip>

                  {/* SRP */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between items-center px-2 py-1.5 bg-gradient-to-r rounded-lg border border-accent-gold/20 cursor-help">
                        <span className="text-xs text-accent-gold flex items-center gap-1">
                          SRP <Info className="w-2.5 h-2.5" />
                        </span>
                        <span className="text-sm text-accent-gold">
                          ${product?.srp}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p className="text-xs">
                        Store Retail Price - Selling price
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          </Card>
        ))}

        <ProductCardView
          open={openProductDetailSheet}
          closeProductDetailSheet={handleClose}
          product={productdetails}
        />
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="px-6 py-2"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductsGrid;
