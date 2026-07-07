import { Card } from "@/components/common/ui/cards/card";
import { Checkbox } from "@/components/common/ui/checkbox";
import { toTitleCase } from "@/lib/utils";
import React from "react";

const MarginCard = ({
  id,
  productImg,
  designNo,
  category,
  diamond_base_price,
  diamondStorePrice,
  diamondSellingPrice,
  metal_base_price,
  metalStorePrice,
  metalSellingPrice,
  labour_base_price,
  labourStorePrice,
  labourSellingPrice,
  total_base_price,
  totalStorePrice,
  totalSellingPrice,
}) => {
  return (
    <div className="mt-13">
      <Card className="shadow-none">
        <div className="rounded-t-xl relative p-[17px] w-auto h-[196px] bg-[#FCFCFC]">
          {/* <div className="absolute left-[17px]">
            <Checkbox />
          </div> */}
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
                {toTitleCase(category)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full">
            <div className="text-[12px] text-secondary-foreground font-[400]">
              Diamond Base Price
              <p className="text-[14px] font-[500] text-foreground">
                {diamond_base_price}
              </p>
            </div>

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

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-[12px] text-secondary-foreground font-[400]">
              Metal Base Price
              <p className="text-[14px] font-[500] text-foreground">
                {metal_base_price}
              </p>
            </div>
            <div className="text-[12px] text-secondary-foreground font-[400]">
              Metal Store Price
              <p className="text-[14px] font-[500] text-foreground">
                {metalStorePrice}
              </p>
            </div>
            <div className="text-[12px] text-secondary-foreground font-[400]">
              Selling Price
              <p className="text-[14px] font-[500] text-foreground">
                {metal_base_price}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-[12px] text-secondary-foreground font-[400]">
              Labour Base Price
              <p className="text-[14px] font-[500] text-foreground">
                {labour_base_price}
              </p>
            </div>
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

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-[12px] text-secondary-foreground font-[400]">
              Total Base Price
              <p className="text-[14px] font-[500] text-primary">
                {total_base_price}
              </p>
            </div>
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

export default MarginCard;
