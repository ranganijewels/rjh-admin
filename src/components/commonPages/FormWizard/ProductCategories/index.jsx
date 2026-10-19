"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/common/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/cards/card";
import { HexagonBadge } from "@/components/common/ui/badges/hexagon-badge";
import { Page, PageHeader } from "@/components/common/ui/page";
import { Skeleton } from "@/components/common/ui/skeleton";
import { Switch } from "@/components/common/ui/switch";
import { useCrudApi } from "@/hooks/useCrudApi";
import { useWizardPaths } from "@/hooks/useWizardPaths";

const ProductCategories = () => {
  const [categoriesData, setCategoriesData] = useState([]);
  const [categoryStatus, setCategoryStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const { fetchAll, create } = useCrudApi("/api/store-categories");

  const router = useRouter();
  const { next, previous } = useWizardPaths();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetchAll();
      setCategoriesData(res.data || []);

      const statusObj = {};
      (res.data || []).forEach((cat) => {
        statusObj[cat.id] = false;
      });
      setCategoryStatus(statusObj);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      toast.error(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedCount = useMemo(
    () =>
      Object.values(categoryStatus).filter((enabled) => enabled === true).length,
    [categoryStatus]
  );

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
      toast.error(error.message || "Failed to save the selected categories");
    }
  };

  return (
    <Page>
      <PageHeader
        title="Product Categories"
        description="Choose the categories your customers can browse and buy from."
        actions={
          <>
            <Button
              variant="ghost"
              size="md"
              type="button"
              onClick={() => handleSubmit("draft")}
            >
              Save Draft
            </Button>
            <Button size="md" type="button" onClick={() => handleSubmit("next")}>
              Next
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-foreground">
            Product categories
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {selectedCount} of {categoriesData?.length ?? 0} categories
            selected
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-[50px] w-full" />
              ))}
            </div>
          ) : categoriesData?.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
              <LayoutGrid className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">
                No categories available
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Categories will show up here as soon as they are added to your
                catalogue.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {categoriesData?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2.5 py-3.5"
                >
                  <div className="flex items-center gap-3.5">
                    <HexagonBadge
                      stroke="stroke-input"
                      fill="fill-muted/30"
                      size="size-[50px]"
                      badge={
                        <LayoutGrid className="text-xl text-muted-foreground" />
                      }
                    />

                    <span className="text-sm font-medium text-foreground">
                      {item.name}
                    </span>
                  </div>

                  <Switch
                    size="sm"
                    id={`category-${item.id}`}
                    aria-label={`Enable ${item.name}`}
                    checked={categoryStatus[item.id] || false}
                    onCheckedChange={(checked) => {
                      setCategoryStatus((prev) => ({
                        ...prev,
                        [item.id]: checked,
                      }));
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="ghost"
            size="md"
            type="button"
            onClick={() => handleSubmit("draft")}
          >
            Save Draft
          </Button>
          <Button
            variant="outline"
            size="md"
            type="button"
            onClick={() => router.push(previous.path)}
          >
            Previous
          </Button>
          <Button size="md" type="button" onClick={() => handleSubmit("next")}>
            Next
          </Button>
        </CardFooter>
      </Card>
    </Page>
  );
};

export default ProductCategories;
