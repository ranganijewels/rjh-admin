"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  FileText,
  LayoutTemplate,
  MessageSquareText,
  Palette,
  ShoppingBag,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/cards/card";
import { Page, PageHeader } from "@/components/common/ui/page";
import { THEME_CUSTOMIZATION_MENU } from "@/services/constant";
import { cn } from "@/lib/utils";

// The step titles and their routes live in one place (`services/constant.js`).
// This map only adds the icon and the one-line summary shown in the nav.
const SECTION_META = {
  "/theme-customization": {
    icon: LayoutTemplate,
    description: "Homepage banner, product layout, navigation and footer content.",
  },
  "/content-branding": {
    icon: Palette,
    description: "Brand story, craftsmanship details, logo and typography.",
  },
  "/policies": {
    icon: FileText,
    description: "Returns, shipping, warranty, packaging and privacy policy.",
  },
  "/product-shopping-experience": {
    icon: ShoppingBag,
    description: "Custom orders, filtering, stock handling, currency and payments.",
  },
  "/customer-engagement": {
    icon: MessageSquareText,
    description: "Newsletter, contact fields, social proof, loyalty and offers.",
  },
};

const Customization = () => {
  const pathname = usePathname();

  const sections = THEME_CUSTOMIZATION_MENU.map((item) => ({
    ...item,
    ...(SECTION_META[item.path] || {}),
  }));

  const isActive = (path) =>
    Boolean(path) &&
    (pathname === path || pathname?.startsWith(`${path}/`));

  return (
    <Page>
      <PageHeader
        title="Customization"
        description="Shape how your storefront looks and behaves — from the homepage theme down to customer engagement."
      />

      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold text-foreground">
              Customization steps
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Work through each section in order, or jump straight to the one you
              need.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <nav aria-label="Customization sections">
            <p className="uppercase text-[11px] font-semibold tracking-wider text-muted-foreground/70 px-5 pt-4 pb-2">
              Storefront setup
            </p>

            <ul className="divide-y divide-border">
              {sections.map((section) => {
                const active = isActive(section.path);
                const Icon = section.icon || LayoutTemplate;

                return (
                  <li key={section.path}>
                    <Link
                      href={section.path}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 px-5 py-3.5 transition-colors",
                        active
                          ? "bg-primary/5 text-primary"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg border border-border",
                          active ? "bg-card text-primary" : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">
                          {section.title}
                        </span>
                        {section.description && (
                          <span className="block text-xs text-muted-foreground">
                            {section.description}
                          </span>
                        )}
                      </span>

                      <ChevronRight
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </CardContent>
      </Card>
    </Page>
  );
};

export default Customization;
