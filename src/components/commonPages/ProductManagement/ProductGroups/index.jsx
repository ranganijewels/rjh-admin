"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Layers, Pencil, Plus } from "lucide-react";
import { usePermissions } from "@/provider/permission-provider";

import { StatusBadge } from "@/components/common/ui/badge";
import { Button } from "@/components/common/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/common/ui/cards/card";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";
import { Page, PageHeader } from "@/components/common/ui/page";
import { cn, toTitleCase } from "@/lib/utils";

const authHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authTokenStoreAdmin") : null;
  return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
};

// Metal colour swatches show the literal product colour, so they use the
// colour palette rather than the interface tokens.
const swatch = (c) =>
  c === "White"
    ? "bg-gray-200 dark:bg-secondary"
    : c === "Yellow"
      ? "bg-yellow-300"
      : c === "Rose"
        ? "bg-rose-200"
        : "bg-muted";

// Manage product "design groups" — one design sold in multiple diamond shapes,
// each shape being its own product, linked by a shared group code.
export default function ProductGroups() {
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/product-management/design-groups", { headers: authHeaders() });
      const json = await res.json();
      setGroups(json?.data || []);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Product groups are products, so the product permissions apply.
  const { can } = usePermissions();
  const canCreate = can("products", "create");
  const canEdit = can("products", "edit");

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <ContentLoader />;

  return (
    <Page>
      <PageHeader
        title="Product Groups"
        description="A group is one design sold in several diamond shapes. Each shape is its own product; products with the same Design Group code are linked on the storefront shape selector."
        actions={
          canCreate && (
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push("/dashboard/product-management/add")}
            >
              <Plus className="size-4" aria-hidden="true" /> Add Product
            </Button>
          )
        }
      />

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <Layers className="size-10 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">No design groups yet</p>
          <p className="max-w-md text-sm text-muted-foreground">
            To create one, add two or more products (one per diamond shape) and
            give them the <b>same Design Group code</b> in the product form.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((g) => (
            <Card key={g.group}>
              <CardHeader className="py-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {g.group}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {g.count} product{g.count !== 1 ? "s" : ""} · {g.shapes.length}{" "}
                    shape{g.shapes.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {g.shapes.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {toTitleCase(s)}
                    </span>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {g.products.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-b-0"
                  >
                    <img
                      src={p.mainImageUrl}
                      alt=""
                      className="size-10 shrink-0 rounded object-cover bg-muted"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">
                        {toTitleCase(p.productName)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{p.productCode}</span>
                        {p.diamondShape && <span>· {toTitleCase(p.diamondShape)}</span>}
                        {p.metalColor && (
                          <span className="inline-flex items-center gap-1">
                            ·{" "}
                            <span
                              className={cn(
                                "inline-block size-2.5 rounded-full border border-border",
                                swatch(p.metalColor)
                              )}
                            />
                            {p.metalColor}
                          </span>
                        )}
                      </div>
                    </div>
                    {p.status ? (
                      <StatusBadge status={p.status} />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                    <Button
                      variant="outline"
                      mode="icon"
                      size="sm"
                      onClick={() => router.push(`/dashboard/product-management/view/${p.id}`)}
                      aria-label={`View ${p.productName}`}
                      title="View product"
                    >
                      <Eye className="size-4" />
                    </Button>
                    {canEdit && (
                      <Button
                        variant="outline"
                        mode="icon"
                        size="sm"
                        onClick={() => router.push(`/dashboard/product-management/edit/${p.id}`)}
                        aria-label={`Edit ${p.productName}`}
                        title="Edit product"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Page>
  );
}
