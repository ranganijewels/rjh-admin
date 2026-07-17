"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/common/ui/dialog";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { useCrudApi } from "@/hooks/useCrudApi";

const authHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authTokenStoreAdmin") : null;
  return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
};

const LINK_TYPES = [
  { value: "custom", label: "Custom URL" },
  { value: "collection", label: "Collection" },
  { value: "category", label: "Category" },
  { value: "style", label: "Style" },
  { value: "static_page", label: "Static Page" },
];

const EMPTY = { label: "", linkType: "custom", url: "", refValue: "", target: "_self", isActive: true };

// Add/edit modal for one navigation item. Link Type picks what the second
// field offers (a Collection/Category/Style/Static Page picker, or a plain
// URL box for Custom) and auto-computes the stored `url` — Custom URL is the
// only type where the admin edits `url` directly. `metadata.linkType`/
// `refValue` are stored alongside the computed url so re-opening this item
// for edit can restore "this points at Collection: Bridal" instead of just
// showing a raw URL under Custom.
const NavItemModel = ({ open, onClose, onSuccess, editData, parentId }) => {
  const { create, update } = useCrudApi("/api/cms/navigation");
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [collections, setCollections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [styles, setStyles] = useState([]);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const [colRes, catRes, styleRes, pageRes] = await Promise.all([
          fetch("/api/product-management/manage-collection", { headers: authHeaders() }).then((r) => (r.ok ? r.json() : { data: [] })),
          fetch("/api/catalog/masters?kind=category", { headers: authHeaders() }).then((r) => (r.ok ? r.json() : [])),
          fetch("/api/catalog/masters?kind=style", { headers: authHeaders() }).then((r) => (r.ok ? r.json() : [])),
          fetch("/api/cms/page-manager", { headers: authHeaders() }).then((r) => (r.ok ? r.json() : { data: [] })),
        ]);
        setCollections(Array.isArray(colRes?.data) ? colRes.data : Array.isArray(colRes) ? colRes : []);
        setCategories(Array.isArray(catRes) ? catRes : []);
        setStyles(Array.isArray(styleRes) ? styleRes : []);
        setPages(Array.isArray(pageRes?.data) ? pageRes.data : Array.isArray(pageRes) ? pageRes : []);
      } catch {
        /* Custom URL still works even if these lookups fail */
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (editData) {
      setForm({
        label: editData.label || "",
        linkType: editData.metadata?.linkType || "custom",
        url: editData.url || "",
        refValue: editData.metadata?.refValue || "",
        target: editData.target || "_self",
        isActive: editData.isActive ?? true,
      });
    } else {
      setForm(EMPTY);
    }
  }, [editData, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const computeUrl = (linkType, refValue) => {
    if (linkType === "collection") {
      const c = collections.find((x) => x.name === refValue);
      return c ? `/collections/${c.slug}` : "";
    }
    if (linkType === "category") return refValue ? `/product?category_id=${encodeURIComponent(refValue)}` : "";
    if (linkType === "style") return refValue ? `/product?subcat=${encodeURIComponent(refValue)}` : "";
    if (linkType === "static_page") {
      const p = pages.find((x) => x.slug === refValue);
      return p ? `/static-page/${p.slug}` : "";
    }
    return form.url;
  };

  const handleLinkTypeChange = (linkType) => {
    setForm((f) => ({ ...f, linkType, refValue: "", url: linkType === "custom" ? f.url : "" }));
  };

  const handleRefChange = (refValue) => {
    setForm((f) => ({ ...f, refValue, url: computeUrl(f.linkType, refValue) }));
  };

  const handleSubmit = async () => {
    if (!form.label.trim()) { toast.error("Label is required"); return; }
    if (!form.url.trim()) { toast.error("A link is required"); return; }
    setSaving(true);
    try {
      const payload = {
        label: form.label.trim(),
        url: form.url.trim(),
        target: form.target,
        isActive: form.isActive,
        parentId: editData ? editData.parentId ?? null : parentId ?? null,
        metadata: { linkType: form.linkType, refValue: form.refValue || undefined },
      };
      if (editData) {
        await update(editData.id, payload);
        toast.success("Navigation item updated");
      } else {
        await create(payload);
        toast.success("Navigation item created");
      }
      onClose();
      onSuccess();
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const refOptions =
    form.linkType === "collection" ? collections.map((c) => ({ value: c.name, label: c.name })) :
    form.linkType === "category" ? categories.map((c) => ({ value: c.name, label: c.name })) :
    form.linkType === "style" ? styles.map((s) => ({ value: s.name, label: s.name })) :
    form.linkType === "static_page" ? pages.map((p) => ({ value: p.slug, label: p.title || p.slug })) :
    [];

  const isSubLink = !!(parentId || editData?.parentId);
  const selectCls = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit" : "Add"} {isSubLink ? "Sub-Link" : "Navigation Item"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Label *</label>
            <Input value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="e.g. Sale" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Link Type</label>
            <select value={form.linkType} onChange={(e) => handleLinkTypeChange(e.target.value)} className={selectCls}>
              {LINK_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          {form.linkType === "custom" ? (
            <div>
              <label className="text-xs font-medium text-muted-foreground">URL</label>
              <Input value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="/customize or https://…" />
            </div>
          ) : (
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                {LINK_TYPES.find((t) => t.value === form.linkType)?.label}
              </label>
              <select value={form.refValue} onChange={(e) => handleRefChange(e.target.value)} className={selectCls}>
                <option value="">Select…</option>
                {refOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {form.url && <p className="text-[11px] text-muted-foreground mt-1">→ {form.url}</p>}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Open In</label>
              <select value={form.target} onChange={(e) => set("target", e.target.value)} className={selectCls}>
                <option value="_self">Same tab</option>
                <option value="_blank">New tab</option>
              </select>
            </div>
            <div className="flex items-end pb-1.5">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
                Active
              </label>
            </div>
          </div>
        </div>
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NavItemModel;
