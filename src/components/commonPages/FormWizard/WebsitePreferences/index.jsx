"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/common/ui/button";
import { useWizardPaths } from "@/hooks/useWizardPaths";
import { useRouter } from "next/navigation";
import { PreferencesCard } from "@/components/common/ui/cards/PreferencesCard";
import { useCrudApi } from "@/hooks/useCrudApi";
import { toast } from "sonner";

const WebsitePreferences = () => {
  const [templateData, setTemplateData] = useState({ data: [] });
  const [selectedCardId, setSelectedCardId] = useState(null);
  const { fetchAll, create } = useCrudApi("/api/store-template");
  const router = useRouter();
  const { next, previous } = useWizardPaths();

  const fetchData = async () => {
    try {
      const res = await fetchAll();
      console.log("res", res);
      res?.data && Array.isArray(res.data) && setTemplateData(res);
    } catch (err) {
      console.log(err.message || "Error fetching data");
    } finally {
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
      onSuccess?.();
    } catch (err) {
    } finally {
    }
  };

  return (
    <>
      <div className="text-center mb-8 text-xl font-medium">
        Website Design Preferences
      </div>

      <div className="grid grid-cols-1 gap-5 lg:gap-7.5 xl:max-w-[75%] mx-auto">
        {templateData.data?.length > 0 ? (
          templateData.data?.map((item, idx) => {
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
                className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
              >
                <PreferencesCard
                  key={item.id || `template-${idx}`}
                  data={item}
                  selected={isSelected}
                />
              </div>
            );
          })
        ) : (
          <div className="text-center text-muted-foreground">
            Loading templates...
          </div>
        )}
      </div>

      <div className="w-full sticky bottom-0 bg-background px-4 py-4 mt-8 max-w-[75%] mx-auto">
        <div className="flex flex-col md:flex-row gap-3 justify-end">
          <Link href="#" className="w-full md:w-auto">
            <Button variant="outline" className="w-full md:w-auto">
              Save Draft
            </Button>
          </Link>

          <Button
            variant="outline"
            className="bg-muted w-full md:w-auto"
            onClick={() => router.push(previous.path)}
          >
            Previous
          </Button>

          <Button className="w-full md:w-auto" onClick={handleSubmit}>
            Next
          </Button>
        </div>
      </div>
    </>
  );
};

export default WebsitePreferences;
