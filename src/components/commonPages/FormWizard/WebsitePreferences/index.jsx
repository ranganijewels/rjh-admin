"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutTemplate } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/common/ui/button";
import {
  Card,
  CardFooter,
} from "@/components/common/ui/cards/card";
import { PreferencesCard } from "@/components/common/ui/cards/PreferencesCard";
import { Page, PageHeader } from "@/components/common/ui/page";
import { Skeleton } from "@/components/common/ui/skeleton";
import { useCrudApi } from "@/hooks/useCrudApi";
import { useWizardPaths } from "@/hooks/useWizardPaths";

const WebsitePreferences = () => {
  const [templateData, setTemplateData] = useState({ data: [] });
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { fetchAll, create } = useCrudApi("/api/store-template");
  const router = useRouter();
  const { next, previous } = useWizardPaths();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetchAll();
      res?.data && Array.isArray(res.data) && setTemplateData(res);
    } catch (err) {
      console.error("Failed to fetch templates:", err);
      toast.error(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    try {
      const payload = {
        template_id: selectedCardId,
      };

      await create(payload);
      toast.success("Updated successfully");
      router.push(next.path);
    } catch (err) {
      console.error("Failed to save the selected template:", err);
      toast.error(err.message || "Failed to save the selected template");
    }
  };

  const templates = templateData.data || [];

  return (
    <Page>
      <PageHeader
        title="Website Design Preferences"
        description="Pick the storefront design that best matches your brand."
        actions={
          <Button size="md" type="button" onClick={handleSubmit}>
            Next
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-5 lg:gap-7.5">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-[420px] w-full rounded-xl" />
          ))}
        </div>
      ) : templates.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 lg:gap-7.5">
          {templates.map((item, idx) => {
            const isSelected = selectedCardId === item.id;

            return (
              <div
                key={item.id || `template-${idx}`}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedCardId(item.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedCardId(item.id);
                  }
                }}
                className="cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <PreferencesCard data={item} selected={isSelected} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <LayoutTemplate className="size-10 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">No templates found</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Storefront designs will show up here as soon as they are published.
          </p>
        </div>
      )}

      <Card>
        <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Link href="#" className="w-full sm:w-auto">
            <Button variant="ghost" size="md" className="w-full sm:w-auto">
              Save Draft
            </Button>
          </Link>

          <Button
            variant="outline"
            size="md"
            type="button"
            onClick={() => router.push(previous.path)}
          >
            Previous
          </Button>

          <Button size="md" type="button" onClick={handleSubmit}>
            Next
          </Button>
        </CardFooter>
      </Card>
    </Page>
  );
};

export default WebsitePreferences;
