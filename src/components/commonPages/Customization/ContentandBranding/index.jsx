"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { Card } from "@/components/common/ui/cards/card";
import {
  FormControl,
  FormItem,
  FormField,
  FormMessage,
} from "@/components/common/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/common/ui/radio-group";
import { Textarea } from "@/components/common/ui/textarea";
import { Label } from "@/components/common/ui/label";
import { Button } from "@/components/common/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const ContentandBranding = () => {
  const form = useForm();
  const router = useRouter();
  const [logoPreview, setLogoPreview] = useState(null);
  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data) => {
    try {
      console.log("Submitted data:", data);
      toast.success("Content & branding saved.");
      router.push("/policies");
    } catch (error) {
      toast.error(
        error?.message || "Something went wrong while saving. Please try again."
      );
    }
  };

  return (
    <Card className={"w-full"}>
      <h2 className="text-center text-2xl font-semibold mb-6 mt-2">
        Content & Branding
      </h2>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-6 space-y-6"
          aria-busy={isSubmitting}
        >
          <FormField
            control={form.control}
            name="brandStory"
            rules={{ required: "Brand story is required" }}
            render={({ field }) => (
              <FormItem>
                <span className="text-base font-medium text-foreground ps-0">
                  Brand Story
                </span>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Share your unique journey and vision..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="craftmanshipDetails"
            rules={{ required: "Craftmanship details are required" }}
            render={({ field }) => (
              <FormItem>
                <span className="text-base font-medium text-foreground">
                  Craftmanship Details
                </span>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Describe your techniques and materials..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-3.5">
            <span className="text-base font-medium text-foreground">
              Testimonials
            </span>
            <RadioGroup defaultValue="no" className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="testimonials-yes" />
                <Label htmlFor="testimonials-yes">Yes</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex flex-col gap-3.5">
            <span className="text-base font-medium text-foreground">
              Blog Integration
            </span>
            <RadioGroup defaultValue="no" className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="blog-yes" />
                <Label htmlFor="blog-yes">Yes</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex flex-col gap-3.5 mb-7">
            <span className="text-base font-medium text-foreground">Logo Upload</span>
            <RadioGroup defaultValue="no" className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="blog-yes" />
                <Label htmlFor="blog-yes">Yes (Upload)</Label>
              </div>
            </RadioGroup>
            <div className="w-full">
              <div className="flex bg-center lg:p-7 bg-no-repeat bg-[length:550px] border border-input rounded-xl border-dashed branding-bg">
                <div className="flex flex-col place-items-center place-content-center text-center rounded-xl w-full">
                  <div className="flex items-center mb-2.5">
                    <div className="relative size-11 shrink-0">
                      <img
                        src="/images/customization/upload.svg"
                        alt="Upload Icon"
                      />
                    </div>
                  </div>
                  <label
                    htmlFor="logo-upload"
                    className="text-foreground text-xs font-medium cursor-pointer"
                  >
                    Drag and drop your logo here, or click to select
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const previewUrl = URL.createObjectURL(file);
                        setLogoPreview(previewUrl);
                      }
                    }}
                  />
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="mt-4 h-24 object-contain rounded"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3.5 mb-7">
            <span className="text-base font-medium text-foreground pb-0.5">
              Font and Style Preferences
            </span>
            <div className="w-full max-w-[800px]">
              <RadioGroup defaultValue="no" className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="yes" id="option-yes" />
                    <Label htmlFor="option-yes">
                      Yes (Specify or upload brand guideline)
                    </Label>
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="no" id="option-no" />
                    <Label htmlFor="option-no">No</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3 mb-5 mr-3 mt-5">
            <Link href="#" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                Save Draft
              </Button>
            </Link>
            <Link href="/theme-customization" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-[#F1F1F2]"
                disabled={isSubmitting}
              >
                Previous
              </Button>
            </Link>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Saving...
                </>
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Card>
  );
};

export default ContentandBranding;
