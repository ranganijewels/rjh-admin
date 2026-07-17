import { Card } from "@/components/common/ui/cards/card";
import { Edit2, EyeIcon } from "lucide-react";
import React from "react";
import { Checkbox } from "@/components/common/ui/checkbox";
import { RiDeleteBinFill } from "@remixicon/react";
import ActiveToggleCell from "@/components/common/ui/ActiveToggleCell";
import { toTitleCase } from "@/lib/utils";
import { Button } from "@/components/common/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/common/ui/tooltip";

const ProductCard = ({
  id,
  product_image,
  design_no,
  category,
  style,
  shape,
  srp,
  mrp,
  collection,
  gender,
  active,
  onClick,
  onEdit,
  onDelete,
  hideActiveCell,
  isSelected,
  onToggleSelect,
  toggleStatus,
  SelectCard,
}) => {
  return (
    <Card className="shadow-none mb-5">
      <div className="rounded-t-xl relative p-[17px] w-auto h-[196px] bg-[#FCFCFC]">
        {SelectCard && (
          <div className="absolute left-[17px]">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(value) => {
                // Prevent the click from opening the card
                event?.stopPropagation();
                onToggleSelect(value);
              }}
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        )}
        {!hideActiveCell && (
          <div className="absolute right-[17px] text-sm font-normal flex items-center gap-[10px]">
            {/* Active {active} */}
            <ActiveToggleCell
              id={id}
              isActive={active}
              toggleStatus={toggleStatus}
            />
          </div>
        )}
        <img
          src={product_image}
          alt="product"
          className="h-[163px] w-[163px] mx-auto object-cover"
        />
      </div>
      <div className="card-border card-rounded-b px-3.5 pt-5 pb-3.5 ">
        <div className="grid grid-cols-2 items-center gap-4">
          <div className="text-xs text-secondary-foreground font-normal pb-4">
            Design No
            <p className="text-sm font-medium text-foreground">
              {design_no}
            </p>
          </div>
          <div>
            <div className="text-xs text-secondary-foreground font-normal pb-4">
              Category
              <p className="text-sm font-medium text-foreground">
                {toTitleCase(category)}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 items-center gap-4">
          <div className="text-xs text-secondary-foreground font-normal">
            Style
            <p className="text-sm font-medium text-foreground">
              {" "}
              {toTitleCase(style)}
            </p>
          </div>
          <div className="text-xs text-secondary-foreground font-normal">
            Shape
            <p className="text-sm font-medium text-foreground"> {shape}</p>
          </div>
          <div className="text-xs text-secondary-foreground font-normal">
            Collection
            <p className="text-sm font-medium text-foreground">
              {toTitleCase(collection)}
            </p>
          </div>

          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-xs text-secondary-foreground font-normal">
                  SRP
                  <p className="text-sm font-medium text-foreground">
                    ${srp}
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Store Retail Price - Selling price
              </TooltipContent>
            </Tooltip>
          </div>

          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-xs text-secondary-foreground font-normal">
                  MRP
                  <p className="text-sm font-medium text-foreground">
                    ${mrp}
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Market Retail Price - Suggested price
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="text-xs text-secondary-foreground font-normal">
            Gender
            <p className="text-sm font-medium text-foreground">
              {" "}
              {toTitleCase(gender)}
            </p>
          </div>

          {/* {created_at && (
            <div className="text-xs text-secondary-foreground font-normal">
              Created Date
              <p className="text-sm font-medium text-foreground">
                {created_at}
              </p>
            </div>
          )}
          {updated_at && (
            <div className="text-xs text-secondary-foreground font-normal">
              Last Update Date
              <p className="text-sm font-medium text-foreground">
                {updated_at}
              </p>
            </div>
          )} */}
        </div>

        <div className="flex gap-2 pt-[20px]">
          <Button
            className="flex-1 flex justify-center items-center gap-2 cursor-pointer"
            onClick={onClick}
            variant="outline"
          >
            <EyeIcon width={18} />
            <span className="text-2sm text-secondary-foreground font-normal">
              View
            </span>
          </Button>
          {onEdit && (
            <Button
              variant="outline"
              mode="icon"
              title="Edit"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              mode="icon"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <RiDeleteBinFill className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
