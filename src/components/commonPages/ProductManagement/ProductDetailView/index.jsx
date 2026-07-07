"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/ui/button";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toTitleCase, formatDateLong } from "@/lib/utils";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { MediaPreview, detectType } from "../ProductForm/MediaManager";
import { toast } from "sonner";

const authHeaders = () => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("authTokenStoreAdmin")
      : null;
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
  if (!product) return <div className="p-6 text-red-500">Product not found.</div>;

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

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <Button variant="outline" mode="icon" onClick={() => router.push("/dashboard/product-management/my-products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{toTitleCase(p.title)}</h1>
            <p className="text-sm text-muted-foreground">{p.title_line || p.design_no}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/product-management/edit/${id}`)}>
            <Pencil className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button variant="outline" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="h-4 w-4 mr-1 text-red-500" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: gallery */}
        <div className="lg:col-span-1">
          <div className="aspect-square rounded-lg border border-border overflow-hidden bg-muted/30 flex items-center justify-center">
            <MediaPreview
              url={p.product_image || media[0]?.url}
              type={detectType(p.product_image || media[0]?.url)}
              className="w-full h-full object-contain"
            />
          </div>
          {media.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {media.map((m, i) => {
                const t = m.mediaType && m.mediaType !== "image" ? m.mediaType : detectType(m.url);
                return (
                  <button
                    key={i}
                    onClick={() => setPreview({ url: m.url, type: t })}
                    className="aspect-square rounded border border-border overflow-hidden bg-muted/30 relative"
                    title={m.metalColor ? `${m.metalColor} · ${m.altText || "gallery"}` : ""}
                  >
                    <MediaPreview url={m.url} type={t} className="w-full h-full object-cover" />
                    {t !== "image" && (
                      <span className="absolute bottom-0.5 left-0.5 text-[9px] px-1 rounded bg-black/60 text-white uppercase">
                        {t}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {p.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Right: details */}
        <div className="lg:col-span-2 space-y-6">
          {p.description && (
            <div>
              <h3 className="text-sm font-semibold mb-1">Description</h3>
              <p className="text-sm text-muted-foreground">{p.description}</p>
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold mb-2">Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2.5">
              {details.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-2 border-b border-border/60 pb-1.5">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium text-right">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          {materials.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Material Details</h3>
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr className="text-left">
                      {["Component", "Metal/Stone", "Shape", "Quality", "Color", "Size", "Setting", "Pcs", "Wt"].map((h) => (
                        <th key={h} className="p-2 font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((m, i) => (
                      <tr key={i} className="border-t border-border">
                        {["component", "metalStoneType", "shape", "quality", "color", "size", "setting", "pcs", "wt"].map((k) => (
                          <td key={k} className="p-2 whitespace-nowrap">{m[k] || "-"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {preview && (
        <div onClick={() => setPreview(null)} className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center cursor-zoom-out p-8">
          <div className="max-w-[90vw] max-h-[85vh] w-[80vw] h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <MediaPreview url={preview.url} type={preview.type} className="w-full h-full object-contain rounded-md" />
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
    </div>
  );
}
