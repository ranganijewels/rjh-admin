"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/common/ui/input";
import { Textarea } from "@/components/common/ui/textarea";
import { Page, PageHeader } from "@/components/common/ui/page";
import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import {
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from "@/components/common/ui/data-grid-table";
import { StatusBadge } from "@/components/common/ui/badge";
import { ProductThumb } from "@/components/common/ui/product-thumb";
import { usePermissions } from "@/provider/permission-provider";
import { Button } from "@/components/common/ui/button";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import ImageUpload from "../ProductForm/ImageUpload";
import { Plus, Pencil, Trash2, Boxes, ExternalLink, X, Search } from "lucide-react";

const STOREFRONT_URL =
  process.env.NEXT_PUBLIC_STOREFRONT_URL || "https://ranganijewelry.com";

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

const slugify = (s) =>
  (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const EMPTY = { name: "", slug: "", description: "", heroImage: "", sortOrder: 0, status: "active", variantMode: false };

export default function ManageCollection() {
  // Collections live under Product Management, so the same product
  // permissions apply: a viewer may look, but not create, edit or delete.
  const { can } = usePermissions();
  const canCreate = can("products", "create");
  const canEdit = can("products", "edit");
  const canDelete = can("products", "delete");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // create/edit panel
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  // delete
  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Row selection for the bulk delete is handled by the shared grid; the
  // product assignment dialog keeps its own `selectedIds` below.

  // product assignment dialog
  const [assignFor, setAssignFor] = useState(null); // collection row
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [productSearch, setProductSearch] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSaving, setAssignSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/product-management/manage-collection", {
        headers: authHeaders(),
        cache: "no-store",
      });
      const json = await res.json();
      const list = Array.isArray(json) ? json : json?.data || [];
      setRows(list);
    } catch {
      toast.error("Failed to load collections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleBulkDeleteCollections = async (selected) => {
    await Promise.all(
      selected.map((row) =>
        fetch(`/api/product-management/manage-collection/${row.id}`, {
          method: "DELETE",
          headers: authHeaders(),
        })
      )
    );
    toast.success(
      `${selected.length} collection(s) deleted (products were kept)`
    );
    load();
  };

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        size: 48,
        meta: { headerTitle: "Select" },
      },
      {
        id: "collection",
        header: ({ column }) => (
          <DataGridColumnHeader title="Collection" column={column} />
        ),
        accessorFn: (row) => row.name,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <ProductThumb
                src={item.heroImage}
                alt=""
                className="h-9 w-9 shrink-0 rounded-md border border-border object-cover"
              />
              <div className="min-w-0">
                <div className="truncate font-medium text-foreground">
                  {item.name}
                </div>
                {item.description && (
                  <div className="truncate text-xs text-muted-foreground">
                    {item.description}
                  </div>
                )}
              </div>
            </div>
          );
        },
        enableSorting: false,
        size: 280,
        meta: { identity: true, headerTitle: "Collection" },
      },
      {
        id: "slug",
        header: ({ column }) => (
          <DataGridColumnHeader title="Page (slug)" column={column} />
        ),
        accessorFn: (row) => row.slug,
        cell: ({ row }) => (
          <a
            href={`${STOREFRONT_URL}/collections/${row.original.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-mono hover:underline"
          >
            /collections/{row.original.slug}
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        ),
        enableSorting: false,
        size: 220,
        meta: { headerTitle: "Page (slug)" },
      },
      {
        id: "products",
        header: ({ column }) => (
          <DataGridColumnHeader title="Products" column={column} />
        ),
        accessorFn: (row) => row.productCount ?? 0,
        cell: ({ row }) => (
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
            {row.original.productCount ?? 0} products
          </span>
        ),
        enableSorting: false,
        size: 130,
        meta: { headerTitle: "Products" },
      },
      {
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        accessorFn: (row) => row.status,
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status === "inactive" ? "Inactive" : "Active"}
          />
        ),
        enableSorting: false,
        size: 120,
        meta: { headerTitle: "Status" },
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataGridColumnHeader title="Actions" column={column} />
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => openAssign(item)}
                >
                  <Boxes className="size-3.5" /> Products
                </Button>
              )}
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  mode="icon"
                  aria-label={`Edit collection ${item.name}`}
                  title="Edit collection"
                  onClick={() => openEdit(item)}
                >
                  <Pencil className="size-3.5" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  mode="icon"
                  aria-label={`Delete collection ${item.name}`}
                  title="Delete collection"
                  onClick={() => {
                    setDeleteId(item.id);
                    setConfirmOpen(true);
                  }}
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              )}
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
        size: 190,
        meta: { headerTitle: "Actions" },
      },
    ],
    [canEdit, canDelete]
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY);
    setSlugTouched(false);
    setPanelOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      name: row.name || "",
      slug: row.slug || "",
      description: row.description || "",
      heroImage: row.heroImage || "",
      sortOrder: row.sortOrder ?? 0,
      status: row.status || "active",
      variantMode: !!row.variantMode,
    });
    setSlugTouched(true);
    setPanelOpen(true);
  };

  const setField = (k, v) =>
    setForm((f) => {
      const next = { ...f, [k]: v };
      // Slug follows the name until the admin edits the slug directly.
      if (k === "name" && !slugTouched) next.slug = slugify(v);
      return next;
    });

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Collection name is required");
      return;
    }
    setSaving(true);
    try {
      const url = editingId
        ? `/api/product-management/manage-collection/${editingId}`
        : "/api/product-management/manage-collection";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          name: form.name.trim(),
          slug: slugify(form.slug || form.name),
          description: form.description || "",
          heroImage: form.heroImage || "",
          sortOrder: Number(form.sortOrder) || 0,
          status: form.status,
          variantMode: !!form.variantMode,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || "Save failed");
      }
      toast.success(editingId ? "Collection updated" : "Collection created");
      setPanelOpen(false);
      load();
    } catch (e) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(
        `/api/product-management/manage-collection/${deleteId}`,
        { method: "DELETE", headers: authHeaders() }
      );
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Collection deleted (products were kept)");
      load();
    } catch (e) {
      toast.error(e.message || "Delete failed");
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  // ── Product assignment ───────────────────────────────────────────────────
  const openAssign = async (row) => {
    setAssignFor(row);
    setAssignLoading(true);
    setProductSearch("");
    try {
      // The products list caps at limit=100, so page through until exhausted.
      const fetchAllProducts = async () => {
        const acc = [];
        for (let page = 1; page <= 50; page++) {
          const r = await fetch(`/api/product-management?limit=100&page=${page}`, {
            headers: authHeaders(),
          });
          if (!r.ok) break;
          const j = await r.json();
          const batch = j?.data || (Array.isArray(j) ? j : []);
          if (!batch.length) break;
          acc.push(...batch);
          if (batch.length < 100) break;
        }
        return acc;
      };
      const [list, colRes] = await Promise.all([
        fetchAllProducts(),
        fetch(`/api/product-management/manage-collection/${row.id}`, {
          headers: authHeaders(),
        }),
      ]);
      const colJson = await colRes.json();
      setProducts(Array.isArray(list) ? list : []);
      const members = (colJson?.products || colJson?.data?.products || []).map((p) => p.id);
      setSelectedIds(new Set(members));
    } catch {
      toast.error("Failed to load products");
      setAssignFor(null);
    } finally {
      setAssignLoading(false);
    }
  };

  const toggleProduct = (id) =>
    setSelectedIds((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const saveAssignment = async () => {
    if (!assignFor) return;
    setAssignSaving(true);
    try {
      const res = await fetch(
        `/api/product-management/manage-collection/${assignFor.id}/products`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({ productIds: [...selectedIds] }),
        }
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || "Failed to save products");
      }
      toast.success(`${selectedIds.size} product(s) in "${assignFor.name}"`);
      setAssignFor(null);
      load();
    } catch (e) {
      toast.error(e.message || "Failed to save products");
    } finally {
      setAssignSaving(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        (p.title || "").toLowerCase().includes(q) ||
        (p.design_no || "").toLowerCase().includes(q) ||
        (p.collection || "").toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  return (
    <Page>
      {/* Header */}
      <PageHeader
        title="Collections"
        description={
          <>
            Create collections, assign products, and share the page link. Each
            collection is live at{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              /collections/&lt;slug&gt;
            </code>{" "}
            — paste that path into CMS menus or banners to link it.
          </>
        }
        actions={
          canCreate && (
            <Button onClick={openAdd} className="gap-1.5">
              <Plus className="size-4" /> New Collection
            </Button>
          )
        }
      />

      {/* Create / edit panel */}
      {panelOpen && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">
              {editingId ? "Edit Collection" : "New Collection"}
            </h3>
            <button
              onClick={() => setPanelOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Bridal"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Slug (page URL)
              </label>
              <Input
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setField("slug", slugify(e.target.value));
                }}
                placeholder="bridal"
              />
              <p className="text-[11px] text-muted-foreground truncate">
                {STOREFRONT_URL}/collections/{form.slug || "…"}
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                <option value="active">Active (visible)</option>
                <option value="inactive">Inactive (hidden)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Variant Mode</label>
              <select
                value={form.variantMode ? "true" : "false"}
                onChange={(e) => setField("variantMode", e.target.value === "true")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                <option value="false">Off — normal collection</option>
                <option value="true">On — products are variants of each other</option>
              </select>
              <p className="text-[11px] text-muted-foreground">
                On treats every product here as a variant of every other (e.g. an Initials
                collection where A/B/C/... are one family) — each product&apos;s page then
                shows a switcher to jump between siblings. Set each product&apos;s &quot;Variant
                Label&quot; in the Product Form to control what shows on the switcher.
              </p>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">
                Description
              </label>
              <Textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Shown at the top of the collection page"
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Banner Image (optional)
              </label>
              <ImageUpload
                compact
                value={form.heroImage}
                onChange={(v) => setField("heroImage", v)}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : editingId ? "Update" : "Create"}
            </Button>
            <Button variant="outline" onClick={() => setPanelOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Collections list — the shared grid, so the spacing, the pinned
          identity column and the row density match every other list. */}
      <ListWithCardToggle
        titleAs="none"
        data={rows}
        columns={columns}
        resizableColumns
        emptyMessage="No collections yet — create one to group products."
        bulkActions={
          canDelete
            ? [
                {
                  key: "delete",
                  label: "Delete",
                  variant: "destructive",
                  confirmMessage:
                    "Delete the selected collections? Their products are kept (only detached).",
                  onRun: handleBulkDeleteCollections,
                },
              ]
            : []
        }
      />

      {/* Product assignment dialog */}
      {assignFor && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <div>
                <h3 className="font-semibold">Products in “{assignFor.name}”</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedIds.size} selected — assigning a product here also sets
                  it as the product&apos;s collection.
                </p>
              </div>
              <button
                onClick={() => setAssignFor(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-border">
              <div className="relative">
                <Search className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search by name, design no, collection…"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3">
              {assignLoading ? (
                <p className="py-8 text-center text-muted-foreground text-sm">Loading products…</p>
              ) : filteredProducts.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground text-sm">No products found.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {filteredProducts.map((p) => (
                    <li key={p.id}>
                      <label className="flex items-center gap-3 py-2 cursor-pointer hover:bg-muted/40 px-1.5 rounded">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(p.id)}
                          onChange={() => toggleProduct(p.id)}
                        />
                        {p.product_image ? (
                           
                          <img
                            src={p.product_image}
                            alt=""
                            className="w-9 h-9 rounded object-cover border border-border"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded bg-muted" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm truncate">{p.title}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {p.design_no || "—"}
                            {p.collection ? ` · currently in: ${p.collection}` : ""}
                          </div>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="px-5 py-3.5 border-t border-border flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAssignFor(null)}>
                Cancel
              </Button>
              <Button onClick={saveAssignment} disabled={assignSaving || assignLoading}>
                {assignSaving ? "Saving…" : `Save (${selectedIds.size})`}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Collection"
        message="Delete this collection? Its products are kept (only detached)."
      />

    </Page>
  );
}
