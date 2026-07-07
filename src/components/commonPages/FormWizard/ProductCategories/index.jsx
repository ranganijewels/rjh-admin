"use client";

import React, { useEffect, useState } from "react";
import { Switch } from "@/components/common/ui/switch";
import { Button } from "@/components/common/ui/button";
import { Card, CardContent } from "@/components/common/ui/cards/card";
import { LayoutGrid } from "lucide-react";
import { HexagonBadge } from "@/components/common/ui/badges/hexagon-badge";
import { useCrudApi } from "@/hooks/useCrudApi";
import { useRouter } from "next/navigation";
import { useWizardPaths } from "@/hooks/useWizardPaths";
import { toast } from "sonner";

const ProductCategories = () => {
  const [categoriesData, setCategoriesData] = useState([]);
  const [categoryStatus, setCategoryStatus] = useState({});
  const { fetchAll, create } = useCrudApi("/api/store-categories");

  const router = useRouter();
  const { next, previous } = useWizardPaths();

  const fetchData = async () => {
    try {
      const res = await fetchAll();
      setCategoriesData(res.data);

      const statusObj = {};
      res.data.forEach((cat) => {
        statusObj[cat.id] = false;
      });
      setCategoryStatus(statusObj);
    } catch (err) {
      console.log(err.message || "Error fetching data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (type) => {
    if (type === "draft") {
      const confirmed = window.confirm(
        "Save the current selection as a draft?"
      );
      if (!confirmed) return;
    }

    const selectedCategoryIds = Object.entries(categoryStatus)
      .filter(([id, enabled]) => enabled)
      .map(([id]) => Number(id));

    const payload = {
      is_enable: selectedCategoryIds.length > 0 ? 1 : 0,
      category_ids: selectedCategoryIds,
      submitted: 1,
    };

    try {
      await create(payload);

      if (type === "next") {
        router.push(next.path);
      } else {
        toast.success("Draft saved successfully!");
      }
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };

  return (
    <Card className="w-full p-6 sm:p-8 rounded-xl shadow-sm">
      <h2 className="text-center text-xl font-semibold mb-8">
        Product Categories Selection
      </h2>

      <div className="space-y-4 mx-auto md:w-1/2 w-full">
        {categoriesData?.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            No categories available.
          </div>
        ) : (
          categoriesData?.map((item) => (
            <Card key={item.id}>
              <CardContent className="border-b border-border flex items-center justify-between py-4 gap-2.5">
                <div className="flex items-center gap-3.5">
                  <HexagonBadge
                    stroke="stroke-input"
                    fill="fill-muted/30"
                    size="size-[50px]"
                    badge={
                      <LayoutGrid className="text-xl text-muted-foreground" />
                    }
                  />

                  <div className="flex flex-col gap-1.5">
                    <span className="flex items-center gap-1.5 leading-none font-medium text-sm text-mono">
                      {item.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Switch
                    size="sm"
                    id="auto-update"
                    checked={categoryStatus[item.id] || false}
                    onCheckedChange={(checked) => {
                      setCategoryStatus((prev) => ({
                        ...prev,
                        [item.id]: checked,
                      }));
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 mt-10">
        <Button variant="ghost" onClick={() => handleSubmit("draft")}>
          Save Draft
        </Button>
        <Button variant="outline" onClick={() => router.push(previous.path)}>
          Previous
        </Button>
        <Button onClick={() => handleSubmit("next")}>Next</Button>
      </div>
    </Card>
  );
};

export default ProductCategories;
