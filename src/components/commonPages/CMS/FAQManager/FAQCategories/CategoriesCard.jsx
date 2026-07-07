"use client";

import React from "react";
import { Edit2Icon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/common/ui/button";
import { Card } from "@/components/common/ui/cards/card";
import ActiveToggleCell from "@/components/common/ui/ActiveToggleCell";
import { useCrudApi } from "@/hooks/useCrudApi";

export const CategoriesCard = ({
  data,
  handleEditClick,
  handleDeleteClick,
  storeId,
}) => {
  // const { toggleStatus } = useCrudApi(`/api/cms/faq/${storeId}/categories`);
  const { toggleStatus } = useCrudApi(`/api/cms/faq/${storeId}/categories`);

  return (
    <Card className="p-5 rounded-xl space-y-4 justify-between">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{data?.faq_category_title}</h3>

        <ActiveToggleCell
          id={data.id}
          isActive={data.is_active}
          toggleStatus={(id, newStatus) => toggleStatus(id, newStatus)}
        />
      </div>
      <p className="text-sm">{data.headtitle}</p>
      <p className="text-sm">{data.description}</p>

      <div className="flex gap-2">
        <Button variant="outline" onClick={handleEditClick} className="flex-1">
          <Edit2Icon className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button mode="icon" variant="outline" onClick={handleDeleteClick}>
          <Trash2Icon />
        </Button>
      </div>
    </Card>
  );
};
