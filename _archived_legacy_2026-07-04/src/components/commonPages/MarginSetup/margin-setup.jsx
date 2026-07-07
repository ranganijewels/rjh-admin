"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/common/ui/checkbox";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
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
import { RadioGroup, RadioGroupItem } from "@/components/common/ui/radio-group";
import { PRICE_LIST } from "./constant";
import CustomMarginProducts from "./custom-margin-products";

// === UI FIELD COMPONENTS ===
const SelectField = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-2.5">
    <Label className="w-full max-w-56">{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const SliderField = ({ label, value, onChange, disabled }) => (
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
      disabled={disabled}
      max={10}
      min={0}
      step={1}
    >
      <SliderThumb />
    </Slider>
  </div>
);

const MarginSetup = () => {
  const [selectedStore, setSelectedStore] = useState("1");
  const [diamondPercentage, setDiamondPercentage] = useState(5);
  const [labourPercentage, setLabourPercentage] = useState(5);
  const [isDiamondCustom, setIsDiamondCustom] = useState(true);
  const [isLabourCustom, setIsLabourCustom] = useState(true);
  const [diamondTier, setDiamondTier] = useState("intermediate");

  const RadioGroupField = ({ label, value, onChange, options }) => (
    <div className="flex items-center gap-6 mb-6">
      <Label className="text-sm font-medium whitespace-nowrap">{label}</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex items-center gap-6"
      >
        {options.map((opt) => (
          <div key={opt.id} className="flex items-center space-x-2">
            <RadioGroupItem value={opt.value} id={opt.id} />
            <Label htmlFor={opt.id} className="text-xs font-medium">
              {opt.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );

  return (
    <>
      <CardTitle className="text-xl text-center text-[#1D2B4F] mb-4">
        Pricing and Margin
      </CardTitle>
      <RadioGroupField
        value={diamondTier}
        onChange={setDiamondTier}
        options={[
          { label: "Use Category Margin", value: "intermediate", id: "d1" },
          { label: "Custom Margin Per Product", value: "d2", id: "d2" },
        ]}
      />

      {diamondTier === "intermediate" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr] xl:grid-cols-[360px_1fr] gap-6">
          {/* LEFT PANEL */}
          <div>
            <Card>
              <CardHeader>Pricing Margin Configuration</CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <SelectField
                    label="Categories"
                    value={selectedStore}
                    onChange={setSelectedStore}
                    options={[
                      { label: "Ring", value: "1" },
                      { label: "Necklace", value: "2" },
                    ]}
                  />

                  <SliderField
                    label="Ring Margin (%)"
                    value={diamondPercentage}
                    onChange={setDiamondPercentage}
                    disabled={!isDiamondCustom}
                  />

                  <SliderField
                    label="Necklace Margin (%)"
                    value={labourPercentage}
                    onChange={setLabourPercentage}
                    disabled={!isLabourCustom}
                  />

                  <SliderField
                    label="Wedding Band Margin (%)"
                    value={labourPercentage}
                    onChange={setLabourPercentage}
                    disabled={!isLabourCustom}
                  />

                  <SliderField
                    label="Earrings Margin (%)"
                    value={labourPercentage}
                    onChange={setLabourPercentage}
                    disabled={!isLabourCustom}
                  />

                  <SliderField
                    label="Bracelet Margin (%)"
                    value={labourPercentage}
                    onChange={setLabourPercentage}
                    disabled={!isLabourCustom}
                  />

                  <SliderField
                    label="Mangalsutra Margin (%)"
                    value={labourPercentage}
                    onChange={setLabourPercentage}
                    disabled={!isLabourCustom}
                  />

                  <div className="flex justify-end">
                    <Button asChild>
                      <Link href="#">Save Changes</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT PANEL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {PRICE_LIST.map((item) => (
              <MarginCard key={item.id} {...item} />
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full h-full min-h-[75vh] rounded-xl p-4">
          <CustomMarginProducts />
        </div>
      )}

      {/* Footer Buttons */}
      <div className="flex flex-col md:flex-row justify-end items-end gap-3 mt-8 px-4">
        <Link href="#" className="w-full md:w-auto">
          <Button variant="outline" className="w-full">
            Save Draft
          </Button>
        </Link>

        <Link href="#" className="w-full md:w-auto">
          <Button variant="outline" className="w-full bg-[#F1F1F2]">
            Previous
          </Button>
        </Link>

        <Link href="#" className="w-full md:w-auto">
          <Button className="w-full">Next</Button>
        </Link>
      </div>
    </>
  );
};

// MarginCard stays the same
const MarginCard = ({
  id,
  productImg,
  designNo,
  category,
  diamondStorePrice,
  diamondSellingPrice,
  metalStorePrice,
  metalSellingPrice,
  labourStorePrice,
  labourSellingPrice,
  totalStorePrice,
  totalSellingPrice,
}) => {
  return (
    <div className="mt-13">
      <Card className="shadow-none">
        <div className="rounded-t-xl relative p-[17px] w-auto h-[196px] bg-[#FCFCFC]">
          <div className="absolute left-[17px]">
            <Checkbox />
          </div>
          <img
            src={productImg}
            alt="Product"
            className="h-[163px] w-[163px] mx-auto object-cover"
          />
        </div>

        <div className="card-border card-rounded-b px-3.5 pt-5 pb-3.5">
          <div className="grid grid-cols-2 gap-4 pb-4">
            <div className="text-[12px] text-secondary-foreground font-[400]">
              Design Number
              <p className="text-[14px] font-[500] text-foreground">
                {designNo}
              </p>
            </div>
            <div className="text-[12px] text-secondary-foreground font-[400]">
              Category
              <p className="text-[14px] font-[500] text-foreground">
                {category}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-[12px] text-secondary-foreground font-[400]">
              Diamond Store Price
              <p className="text-[14px] font-[500] text-foreground">
                {diamondStorePrice}
              </p>
            </div>
            <div className="text-[12px] text-secondary-foreground font-[400]">
              Selling Price
              <p className="text-[14px] font-[500] text-foreground">
                {diamondSellingPrice}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-[12px] text-secondary-foreground font-[400]">
              Metal Store Price
              <p className="text-[14px] font-[500] text-foreground">
                {metalStorePrice}
              </p>
            </div>
            <div className="text-[12px] text-secondary-foreground font-[400]">
              Selling Price
              <p className="text-[14px] font-[500] text-foreground">
                {metalSellingPrice}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-[12px] text-secondary-foreground font-[400]">
              Labour Store Price
              <p className="text-[14px] font-[500] text-foreground">
                {labourStorePrice}
              </p>
            </div>
            <div className="text-[12px] text-secondary-foreground font-[400]">
              Selling Price
              <p className="text-[14px] font-[500] text-foreground">
                {labourSellingPrice}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-[12px] text-secondary-foreground font-[400]">
              Total Store Price
              <p className="text-[14px] font-[500] text-primary">
                {totalStorePrice}
              </p>
            </div>
            <div className="text-[12px] text-secondary-foreground font-[400]">
              Total Selling Price
              <p className="text-[14px] font-[500] text-foreground">
                {totalSellingPrice}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MarginSetup;
