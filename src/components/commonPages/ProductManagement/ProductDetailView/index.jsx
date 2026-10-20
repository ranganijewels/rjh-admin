"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/ui/cards/card";
import { StatusBadge } from "@/components/common/ui/badge";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";
import { Page, PageHeader } from "@/components/common/ui/page";
import { ArrowLeft, ImageOff, Pencil, Trash2 } from "lucide-react";
import { toTitleCase, formatDateLong } from "@/lib/utils";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { MediaPreview, detectType } from "../ProductForm/MediaManager";
import { toast } from "sonner";
import { getAuthToken } from "@/lib/auth-token";

const authHeaders = () => {
  const token =
    getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export default function ProductDetailView({ id }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/product-management/${id}`, { headers: authHeaders() });
        const json = await res.json();
        setProduct(json?.data || json);
      } catch {
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    try {
      await fetch(`/api/product-management/${id}`, { method: "DELETE", headers: authHeaders() });
      toast.success("Product deleted");
      router.push("/dashboard/product-management/my-products");
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading) return <ContentLoader />;

  if (!product) {
    return (
      <Page>
        <PageHeader title="Product not found" description="This product may have been deleted." />
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t find a product with this id.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/product-management/my-products")}
            >
              <ArrowLeft className="size-4" />
              Back to Product Master List
            </Button>
          </CardContent>
        </Card>
      </Page>
    );
  }

  const p = product;
  const media = Array.isArray(p.media) ? p.media : [];
  const details = [
    ["Design No", p.design_no],
    ["Category", toTitleCase(p.category)],
    ["Style / Sub Category", toTitleCase(p.subcategory)],
    ["Collection", toTitleCase(p.collection)],
    ["Occasion", toTitleCase(p.occasion)],
    ["Gender", toTitleCase(p.gender)],
    ["Brand", p.brand],
    ["Designer", p.designer],
    ["Metal", toTitleCase(p.metal)],
    ["Metal Purity", p.metal_purity],
    ["Metal Color", toTitleCase(p.metal_color)],
    ["Diamond Shape", toTitleCase(p.shape)],
    ["Diamond Quality", p.diamond_quality],
    ["Gross Weight", p.gross_weight],
    ["Net Weight", p.net_weight],
    ["Diamond Weight", p.diamond_wt],
    ["Diamond Pcs", p.diamond_pcs],
    ["Length (mm)", p.length],
    ["Width (mm)", p.width],
    ["Labour / Making", p.labour_amount],
    ["Created", p.created_at ? formatDateLong(p.created_at) : null],
    ["Updated", p.updated_at ? formatDateLong(p.updated_at) : null],
  ].filter(([, v]) => v !== null && v !== undefined && v !== "");

  const materials = Array.isArray(p.materials) ? p.materials : [];
  const title = toTitleCase(p.title) || p.design_no || "Product";

  return (
    <Page>
      <PageHeader
        title={title}
        description={p.title_line || p.design_no || "Product details"}
        actions={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={() => router.push("/dashboard/product-management/my-products")}
              aria-label="Back to Product Master List"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => router.push(`/dashboard/product-management/edit/${id}`)}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="md"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        {/* Left: gallery */}
        <Card className="lg:col-span-1">
          <CardHeader className="min-h-0 py-3.5">
            <CardTitle className="text-sm font-semibold text-foreground">
              Media
            </CardTitle>
            <StatusBadge status={p.is_active ? "Active" : "Inactive"} />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30">
              {p.product_image || media[0]?.url ? (
                <MediaPreview
                  url={p.product_image || media[0]?.url}
                  type={detectType(p.product_image || media[0]?.url)}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageOff className="size-8" aria-hidden="true" />
                  <span className="text-xs">No image uploaded</span>
                </div>
              )}
            </div>
            {media.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {media.map((m, i) => {
                  const t = m.mediaType && m.mediaType !== "image" ? m.mediaType : detectType(m.url);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPreview({ url: m.url, type: t })}
                      className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted/30 transition-colors hover:border-primary/40"
                      title={m.metalColor ? `${m.metalColor} · ${m.altText || "gallery"}` : "Open media"}
                      aria-label={m.altText || `Media ${i + 1}`}
                    >
                      <MediaPreview url={m.url} type={t} className="h-full w-full object-cover" />
                      {t !== "image" && (
                        <span className="absolute bottom-0.5 left-0.5 rounded bg-black/60 px-1 text-[9px] uppercase text-white">
                          {t}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: details */}
        <div className="space-y-5 lg:col-span-2 lg:space-y-6">
          {p.description && (
            <Card>
              <CardHeader className="min-h-0 py-3.5">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="min-h-0 py-3.5">
              <CardTitle className="text-sm font-semibold text-foreground">
                Specifications
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {details.length} field{details.length === 1 ? "" : "s"}
              </span>
            </CardHeader>
            <CardContent>
              {details.length ? (
                <div className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2 md:grid-cols-3">
                  {details.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between gap-2 border-b border-border/60 pb-1.5"
                    >
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <span className="text-right text-sm font-medium text-foreground">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No specifications recorded for this product.
                </p>
              )}
            </CardContent>
          </Card>

          {materials.length > 0 && (
            <Card>
              <CardHeader className="min-h-0 py-3.5">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Material details
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  {materials.length} row{materials.length === 1 ? "" : "s"}
                </span>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/60">
                      <tr className="text-left">
                        {["Component", "Metal/Stone", "Shape", "Quality", "Color", "Size", "Setting", "Pcs", "Wt"].map((h) => (
                          <th
                            key={h}
                            className="whitespace-nowrap p-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((m, i) => (
                        <tr key={i} className="border-t border-border">
                          {["component", "metalStoneType", "shape", "quality", "color", "size", "setting", "pcs", "wt"].map((k) => (
                            <td key={k} className="whitespace-nowrap p-2 text-foreground">
                              {m[k] || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {preview && (
        <div
          onClick={() => setPreview(null)}
          className="fixed inset-0 z-[9999] flex cursor-zoom-out items-center justify-center bg-black/80 p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Media preview"
        >
          <div
            className="h-[80vh] w-[80vw] max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <MediaPreview
              url={preview.url}
              type={preview.type}
              className="h-full w-full rounded-md object-contain"
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This cannot be undone."
      />
    </Page>
  );
}
