"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { Loader2 } from "lucide-react";
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
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/common/ui/form";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import { Page, PageHeader } from "@/components/common/ui/page";
import { RadioGroup, RadioGroupItem } from "@/components/common/ui/radio-group";
import { Textarea } from "@/components/common/ui/textarea";

export const ContentandBranding = () => {
  const form = useForm();
  const router = useRouter();
  const [logoPreview, setLogoPreview] = useState(null);
  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async () => {
    try {
      toast.success("Content & branding saved.");
      router.push("/policies");
    } catch (error) {
      toast.error(
        error?.message || "Something went wrong while saving. Please try again."
      );
    }
  };

  return (
    <Page>
      <PageHeader
        title="Content & Branding"
        description="Tell customers who you are — your brand story, the craft behind it, your logo and your typography."
        actions={
          <Button
            type="submit"
            form="content-branding-form"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
                Saving...
              </>
            ) : (
              "Next"
            )}
          </Button>
        }
      />

      <FormProvider {...form}>
        <form
          id="content-branding-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5 lg:gap-6"
          aria-busy={isSubmitting}
        >
          {/* Brand story */}
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Brand Story &amp; Craftsmanship
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Share your journey, your vision and the techniques behind every
                  piece you make.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <FormField
                control={form.control}
                name="brandStory"
                rules={{ required: "Brand story is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Story</FormLabel>
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
                    <FormLabel>Craftmanship Details</FormLabel>
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
            </CardContent>
          </Card>

          {/* Content features */}
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Content Features
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Choose which customer content to publish on your storefront.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-col gap-2.5">
                <Label className="text-sm font-medium text-foreground">
                  Testimonials
                </Label>
                <RadioGroup defaultValue="no" className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="testimonials-yes" />
                    <Label htmlFor="testimonials-yes" variant="secondary">
                      Yes
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex flex-col gap-2.5">
                <Label className="text-sm font-medium text-foreground">
                  Blog Integration
                </Label>
                <RadioGroup defaultValue="no" className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="blog-yes" />
                    <Label htmlFor="blog-yes" variant="secondary">
                      Yes
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Logo upload */}
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Logo Upload
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Upload the logo that represents your brand on the storefront.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2.5">
                <Label className="text-sm font-medium text-foreground">
                  Use a custom logo
                </Label>
                <RadioGroup defaultValue="no" className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="logo-upload-yes" />
                    <Label htmlFor="logo-upload-yes" variant="secondary">
                      Yes (Upload)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="w-full">
                <div className="flex w-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 p-6 lg:p-7">
                  <div className="flex w-full flex-col place-items-center place-content-center rounded-xl text-center">
                    <div className="mb-2.5 flex items-center">
                      <div className="relative size-11 shrink-0">
                        <img
                          src="/images/customization/upload.svg"
                          alt="Upload Icon"
                        />
                      </div>
                    </div>
                    <Label
                      htmlFor="logo-upload"
                      className="cursor-pointer text-xs font-medium text-foreground"
                    >
                      Drag and drop your logo here, or click to select
                    </Label>
                    <Input
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
                        className="mt-4 h-24 rounded object-contain"
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Font and style preferences */}
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Font and Style Preferences
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Point us at your brand guidelines, or let us pick for you.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full max-w-[800px]">
                <RadioGroup defaultValue="no" className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="yes" id="option-yes" />
                      <Label htmlFor="option-yes">
                        Yes (Specify or upload brand guideline)
                      </Label>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="no" id="option-no" />
                      <Label htmlFor="option-no">No</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                title="Save Draft is not available yet"
              >
                Save Draft
              </Button>
              <Button
                asChild
                variant="outline"
                className={
                  isSubmitting ? "pointer-events-none opacity-50" : undefined
                }
              >
                <Link
                  href="/theme-customization"
                  aria-disabled={isSubmitting || undefined}
                >
                  Previous
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </form>
      </FormProvider>
    </Page>
  );
};

export default ContentandBranding;
