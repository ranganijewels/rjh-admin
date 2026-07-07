"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/common/ui/cards/card";
import { Button } from "@/components/common/ui/button";
import { Label } from "@/components/common/ui/label";
import { Slider, SliderThumb } from "@/components/common/ui/slider";
import { Badge } from "@/components/common/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/common/ui/select";
import { useCrudApi } from "@/hooks/useCrudApi";
import { toTitleCase } from "@/lib/utils";
import MarginCard from "./MarginCard";
import { toast } from "sonner";

/* -------------------- SelectField -------------------- */
const SelectField = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-2.5">
    <Label className="w-full max-w-56">{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt, idx) => (
          <SelectItem key={`${opt.value}-${idx}`} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

/* -------------------- SliderField -------------------- */
const SliderField = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-2.5">
    <div className="flex justify-between">
      <Label>{label}</Label>
      <Badge size="md" appearance="outline">
        {value}%
      </Badge>
    </div>
    <Slider
      value={[value]}
      onValueChange={([val]) => onChange(val)}
      max={10}
      min={0}
      step={1}
    >
      <SliderThumb />
    </Slider>
  </div>
);

/* -------------------- Main Component -------------------- */
const ByCategory = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("");
  const [productPricingList, setProductPricingList] = useState([]);

  // margin fields
  const [labourMargin, setLabourMargin] = useState(0);
  const [diamondMargin, setDiamondMargin] = useState(0);

  const { fetchAll: getCategories } = useCrudApi(
    "/api/pricing-margin/by-category/categories"
  );
  const { fetchAll: getByCategory, create } = useCrudApi(
    "/api/pricing-margin/by-category"
  );
  const { fetchById } = useCrudApi(
    "/api/pricing-margin/by-category/get-margin"
  );

  /* -------------------- Fetch categories -------------------- */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        const list = res?.data || [];

        // Format with "All" option on top
        const formatted = [
          { label: "All", value: "all" },
          ...list.map((cat) => ({
            label: toTitleCase(cat.name),
            value: String(cat.id),
          })),
        ];

        setCategories(formatted);

        if (!selectedCat) {
          setSelectedCat("all");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [getCategories]);

  /* -------------------- Fetch margin data when category changes -------------------- */
  useEffect(() => {
    const fetchMarginForCategory = async () => {
      if (!selectedCat) return;

      try {
        const res = await fetchById(selectedCat);
        const data = res?.data || {};

        setLabourMargin(data.store_labour_margin ?? 0);
        setDiamondMargin(data.store_diamond_margin ?? 0);
      } catch (error) {
        console.error("Error fetching margin:", error);
        setLabourMargin(0);
        setDiamondMargin(0);
      }
    };

    fetchMarginForCategory();
  }, [selectedCat, fetchById]);

  /* -------------------- Fetch product list -------------------- */
  useEffect(() => {
    if (!selectedCat) return;

    const fetchProducts = async () => {
      try {
        const res = await getByCategory({ category_id: selectedCat });
        setProductPricingList(res?.products || []);
      } catch (error) {
        console.error("Error fetching product pricing:", error);
      }
    };

    fetchProducts();
  }, [selectedCat, getByCategory]);

  /* -------------------- Save margin changes -------------------- */
  const handleSaveChanges = async () => {
    if (!selectedCat) {
      toast.error("Please select a category first.");
      return;
    }

    try {
      const payload =
        selectedCat === "all"
          ? {
              margin_type: 1,
              category_id: "all",
              store_margin: labourMargin,
              store_diamond_margin: diamondMargin,
            }
          : {
              margin_type: 1,
              categories: [
                {
                  category_id: Number(selectedCat),
                  store_margin: labourMargin,
                  store_diamond_margin: diamondMargin,
                },
              ],
            };

      await create(payload);
      toast.success("Margin configuration saved successfully!");

      await Promise.all([fetchUpdatedMargin(), fetchUpdatedProducts()]);
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.error("Failed to save configuration.");
    }
  };

  /* -------------------- Refresh data -------------------- */
  const fetchUpdatedMargin = async () => {
    try {
      const res = await fetchById(selectedCat);
      const data = res?.data || {};
      setLabourMargin(data.store_labour_margin ?? 0);
      setDiamondMargin(data.store_diamond_margin ?? 0);
    } catch (error) {
      console.error("Error refreshing margin:", error);
    }
  };

  const fetchUpdatedProducts = async () => {
    try {
      const res = await getByCategory({ category_id: selectedCat });
      setProductPricingList(res?.products || []);
    } catch (error) {
      console.error("Error refreshing products:", error);
    }
  };

  /* -------------------- Render Cards -------------------- */
  const renderedMarginCards = productPricingList.map((item, index) => (
    <MarginCard
      key={item?.id || `product-${index}`}
      productImg={item?.image}
      designNo={item?.design_number}
      category={item?.category_name}
      diamond_base_price={item?.diamond_base_price}
      diamondStorePrice={item?.diamond_store_price}
      diamondSellingPrice={item?.diamond_selling_price}
      metal_base_price={item?.metal_base_price}
      metalStorePrice={item?.metal_store_price}
      metalSellingPrice={item?.metal_selling_price}
      labour_base_price={item?.labour_base_price}
      labourStorePrice={item?.labour_store_price}
      labourSellingPrice={item?.labour_selling_price}
      total_base_price={item?.total_base_price}
      totalStorePrice={item?.total_store_price}
      totalSellingPrice={item?.total_selling_price}
    />
  ));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
      {/* LEFT PANEL */}
      <div>
        <Card className="mt-13 fixed w-[18%]">
          <CardHeader>Pricing Margin Configuration</CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Category Dropdown (always visible) */}
              <SelectField
                label="Categories"
                value={selectedCat}
                onChange={setSelectedCat}
                options={categories}
              />

              <SliderField
                label="Labour Margin (%)"
                value={labourMargin}
                onChange={setLabourMargin}
              />

              <SliderField
                label="Diamond Margin (%)"
                value={diamondMargin}
                onChange={setDiamondMargin}
              />

              <div className="flex justify-end">
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT PANEL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {renderedMarginCards}
      </div>
    </div>
  );
};

export default ByCategory;
