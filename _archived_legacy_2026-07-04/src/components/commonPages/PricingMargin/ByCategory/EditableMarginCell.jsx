"use client";
import React, { useState } from "react";
import { Input } from "@/components/common/ui/input";
import { useMarginService } from "@/services/marginService";

export const EditableMarginCell = ({ row, onRefresh }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(row.original?.store_margin ?? 0);
  const { updateSingleMargin } = useMarginService();

  const handleSave = async () => {
    const success = await updateSingleMargin({
      product_id: row.original.id,
      category_id: row.original.category_id,
      store_margin: value,
    });

    if (success) {
      setIsEditing(false);
      onRefresh?.();
    }
  };

  return (
    <div onDoubleClick={() => setIsEditing(true)}>
      {isEditing ? (
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") setIsEditing(false);
          }}
          className="w-20 text-sm text-center"
          autoFocus
        />
      ) : (
        <span className="!text-sm">{value}%</span>
      )}
    </div>
  );
};
