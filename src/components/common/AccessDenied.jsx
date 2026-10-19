"use client";

import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/common/ui/button";
import { usePermissions } from "@/provider/permission-provider";
import { getModuleForPath } from "@/config/rbac";

export default function AccessDenied({ pathname }) {
  const { roleMeta, moduleForPath } = usePermissions();
  const moduleKey = (moduleForPath || getModuleForPath)(pathname);
  const label =
    {
      dashboard: "Dashboard",
      products: "Product Management",
      pricing: "Pricing Engine",
      orders: "Order Management",
      custom_jewelry: "Custom Jewelry",
      customers: "Customer Data",
      coupons: "Coupons Management",
      communication: "Communication",
      cms: "CMS",
      enterprise: "Advanced (Enterprise)",
      settings: "Settings",
      users_roles: "Users, Roles & Departments",
    }[moduleKey] || "this section";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldX className="size-6" />
      </div>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Access denied</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Your role ({roleMeta.name}) does not have permission to view{" "}
          {label}. Contact an administrator if you need access.
        </p>
      </div>
      <Button asChild variant="outline" size="md">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
