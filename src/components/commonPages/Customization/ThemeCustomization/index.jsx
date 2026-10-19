"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

import { Button } from "@/components/common/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/cards/card";
import { Checkbox } from "@/components/common/ui/checkbox";
import { Label } from "@/components/common/ui/label";
import { Page, PageHeader } from "@/components/common/ui/page";
import {
  BANNER_PREFERENCE,
  FEATURED_COLLECTIONS,
  FOOTER_CONTENT,
  NAVIGATION_MENU_STRUCTURE,
  PRODUCT_DISPLAY,
} from "./constant";
import { cn } from "@/lib/utils";

/**
 * A selectable theme option (homepage banner / product display style).
 * The tile is a button-like card: click, Enter or Space all select it.
 */
const ThemeOptionTile = ({ work, isSelected, onSelect }) => (
  <div
    role="button"
    tabIndex={0}
    aria-pressed={isSelected}
    onClick={onSelect}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect();
      }
    }}
    className={cn(
      "relative cursor-pointer overflow-hidden rounded-xl border transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      isSelected
        ? "border-primary ring-1 ring-primary/20"
        : "border-border hover:border-primary/40"
    )}
  >
    {isSelected && (
      <div className="absolute right-2 top-2 z-10 rounded-full">
        <img
          src="/images/customization/right symbol.svg"
          alt="Selected"
          className="size-8"
          width={32}
          height={32}
        />
      </div>
    )}

    <div className="relative aspect-[16/9] overflow-hidden bg-muted/40">
      <img
        src={work.image}
        alt={work.title}
        width={768}
        height={432}
        className="absolute inset-0 size-full object-cover"
      />
    </div>

    <div className="flex items-center justify-center gap-2 border-t border-border bg-card px-4 py-3">
      {work.logo && (
        <img
          src={work.logo}
          alt=""
          width={24}
          height={24}
          className="inline-block size-6 shrink-0"
        />
      )}
      <span className="text-sm font-medium text-foreground">{work.title}</span>
    </div>
  </div>
);

/**
 * Lightweight preview overlay for a chosen option.
 */
const PreviewOverlay = ({ open, image, title, alt, onClose, closeLabel }) => {
  if (!open || !image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-xl border border-border bg-card p-5 shadow-lg">
        <Button
          variant="ghost"
          mode="icon"
          size="sm"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
          }}
          aria-label={closeLabel}
          title="Close (Esc)"
          className="absolute end-3 top-3"
        >
          <X className="size-4" aria-hidden="true" />
        </Button>

        <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>

        <div className="overflow-hidden rounded-xl border border-border bg-muted/40">
          <img
            src={image}
            alt={alt}
            width={768}
            height={432}
            className="h-auto w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export const ThemeCustomization = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [bannerPreviewImage, setBannerPreviewImage] = useState(null);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [productPreviewImage, setProductPreviewImage] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  return (
    <Page>
      <PageHeader
        title="Website Theme & Layout Customization"
        description="Choose the homepage banner, product display, navigation menu and footer content for your storefront."
        actions={
          <Button asChild>
            <Link href="/content-branding">Next</Link>
          </Button>
        }
      />

      {/* Homepage banner preference */}
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold text-foreground">
              Homepage Banner Preference
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              What type of banner would you like on your homepage?
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {BANNER_PREFERENCE?.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {BANNER_PREFERENCE.map((work) => {
                const isSelected = selectedId === work.id;

                return (
                  <ThemeOptionTile
                    key={work.id}
                    work={work}
                    isSelected={isSelected}
                    onSelect={() => {
                      setSelectedId(work.id);
                      setBannerPreviewImage(work.image);
                      setShowBannerModal(true);
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No banner options available yet.
            </p>
          )}
        </CardContent>
      </Card>

      <PreviewOverlay
        open={showBannerModal}
        image={bannerPreviewImage}
        title="Preview Banner"
        alt="Banner Preview"
        closeLabel="Close banner preview"
        onClose={() => setShowBannerModal(false)}
      />

      {/* Featured collections */}
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold text-foreground">
              Featured Collections Display
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Which collections should be highlighted on the homepage?
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FEATURED_COLLECTIONS.map((item) => {
              const id = `featured-${item.id}`;

              return (
                <div key={item.id} className="flex items-center gap-2.5">
                  <Checkbox id={id} />
                  <Label htmlFor={id} className="text-sm text-foreground">
                    {item.title}
                  </Label>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Product display style */}
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold text-foreground">
              Product Display Style
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              How should your products be displayed?
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {PRODUCT_DISPLAY?.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {PRODUCT_DISPLAY.map((work) => {
                const isSelected = selectedId === work.id;

                return (
                  <ThemeOptionTile
                    key={work.id}
                    work={work}
                    isSelected={isSelected}
                    onSelect={() => {
                      setSelectedId(work.id);
                      setProductPreviewImage(work.image);
                      setShowProductModal(true);
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No product display options available yet.
            </p>
          )}
        </CardContent>
      </Card>

      <PreviewOverlay
        open={showProductModal}
        image={productPreviewImage}
        title="Preview Product Display"
        alt="Product Preview"
        closeLabel="Close product display preview"
        onClose={() => setShowProductModal(false)}
      />

      {/* Navigation menu structure */}
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold text-foreground">
              Navigation Menu Structure
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Which categories should appear in your main navigation?
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {NAVIGATION_MENU_STRUCTURE.map((item) => {
              const id = `navigation-${item.id}`;

              return (
                <div key={item.id} className="flex items-center gap-2.5">
                  <Checkbox id={id} />
                  <Label htmlFor={id} className="text-sm text-foreground">
                    {item.title}
                  </Label>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Footer content */}
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold text-foreground">
              Footer Content
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              What would you like to include in your website footer?
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {FOOTER_CONTENT.map((item) => {
              const id = `footer-${item.id}`;

              return (
                <div key={item.id} className="flex items-center gap-2.5">
                  <Checkbox id={id} />
                  <Label htmlFor={id} className="text-sm text-foreground">
                    {item.title}
                  </Label>
                </div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled
            title="Save Draft is not available yet"
          >
            Save Draft
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled
            title="Previous is not available yet"
          >
            Previous
          </Button>
        </CardFooter>
      </Card>
    </Page>
  );
};

export default ThemeCustomization;
