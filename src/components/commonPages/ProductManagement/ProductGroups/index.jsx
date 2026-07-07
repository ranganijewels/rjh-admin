"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/ui/button";
import { ContentLoader } from "@/components/common/ui/Loader/content-loader";
import { Plus, Eye, Pencil, Layers } from "lucide-react";
import { toTitleCase } from "@/lib/utils";

const authHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authTokenStoreAdmin") : null;
  return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
};

const swatch = (c) =>
  c === "White" ? "bg-gray-200" : c === "Yellow" ? "bg-yellow-300" : c === "Rose" ? "bg-[#e6b8a2]" : "bg-muted";

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <ContentLoader />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5" /> Product Groups
          </h1>
          <p className="text-sm text-muted-foreground">
            A group is one design sold in several diamond shapes. Each shape is its
            own product; products with the same <b>Design Group</b> code are linked
            on the storefront shape selector.
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/product-management/add")}>
          <Plus className="h-4 w-4 mr-1" /> Add Product
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-10 text-center text-muted-foreground">
          <Layers className="h-8 w-8 mx-auto mb-3 opacity-40" />
          No design groups yet. To create one, add two or more products (one per
          diamond shape) and give them the <b>same Design Group code</b> in the
          product form.
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => (
            <div key={g.group} className="border border-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between bg-muted/40 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{g.group}</span>
                  <span className="text-xs text-muted-foreground">
                    {g.count} product{g.count !== 1 ? "s" : ""} · {g.shapes.length} shape
                    {g.shapes.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {g.shapes.map((s) => (
                    <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-background border border-border">
                      {toTitleCase(s)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-border">
                {g.products.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                    <img
                      src={p.mainImageUrl}
                      alt=""
                      className="w-10 h-10 rounded object-cover bg-muted shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{toTitleCase(p.productName)}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{p.productCode}</span>
                        {p.diamondShape && <span>· {toTitleCase(p.diamondShape)}</span>}
                        {p.metalColor && (
                          <span className="inline-flex items-center gap-1">
                            · <span className={`inline-block w-2.5 h-2.5 rounded-full border ${swatch(p.metalColor)}`} />
                            {p.metalColor}
                          </span>
                        )}
                        <span className={`px-1.5 rounded-full text-[10px] ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" mode="icon" size="sm" onClick={() => router.push(`/dashboard/product-management/view/${p.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" mode="icon" size="sm" onClick={() => router.push(`/dashboard/product-management/edit/${p.id}`)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
