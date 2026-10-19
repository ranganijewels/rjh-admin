"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { StatusBadge } from "@/components/common/ui/badge";
import { Button } from "@/components/common/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/cards/card";
import { Checkbox } from "@/components/common/ui/checkbox";
import { DataGridColumnHeader } from "@/components/common/ui/data-grid-column-header";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import { Page, PageHeader } from "@/components/common/ui/page";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Skeleton } from "@/components/common/ui/skeleton";
import { TruncatedText } from "@/components/common/ui/short-id";
import { Textarea } from "@/components/common/ui/textarea";
import { authHeaders } from "@/components/commonPages/Catalog/_ui";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "Rings",
  "Necklaces",
  "Wedding Bands",
  "Bracelets",
  "Earrings",
  "Pendants",
  "Bangles",
];

const STATUSES = ["draft", "review", "approved", "published", "archived"];

const AXIS_TYPES = [
  "shape",
  "center_ct",
  "metal_type",
  "purity",
  "color",
  "side_quality",
  "ring_size",
];

const STATUS_FILTERS = ["all", ...STATUSES];

const PAGE_SIZE = 50;

const emptyAxis = () => ({
  axis: "shape",
  allowedValuesCsv: "",
  defaultValue: "",
  affectsWeight: true,
  affectsPrice: true,
});

const emptyForm = () => ({
  id: null,
  familyCode: "",
  name: "",
  category: "Rings",
  defaultShape: "",
  defaultMetalType: "",
  storyMd: "",
  status: "draft",
  axes: [emptyAxis()],
});

// Map an incoming axis (allowedValues:[]) into editor shape (allowedValuesCsv).
const axisToEditor = (a = {}) => ({
  axis: a.axis ?? "shape",
  allowedValuesCsv: Array.isArray(a.allowedValues)
    ? a.allowedValues.join(", ")
    : a.allowedValues ?? "",
  defaultValue: a.defaultValue ?? "",
  affectsWeight: a.affectsWeight !== false,
  affectsPrice: a.affectsPrice !== false,
});

// Small labelled field wrapper: shared Label + optional hint / error.
function FormField({
  label,
  htmlFor,
  hint,
  error,
  errorId,
  children,
  className,
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <span id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </span>
      ) : (
        hint && <span className="text-xs text-muted-foreground">{hint}</span>
      )}
    </div>
  );
}

export default function ProductFamilies() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm());

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  // The list is server-paginated, so the grid keeps a controlled pagination
  // that always mirrors the page size we ask the API for.
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const load = useCallback(
    async (nextOffset = 0, { append = false } = {}) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (statusFilter && statusFilter !== "all")
          params.set("status", statusFilter);
        params.set("limit", String(PAGE_SIZE));
        params.set("offset", String(nextOffset));
        const res = await fetch(`/api/catalog/families?${params.toString()}`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error(data?.message || "Failed to load families");
        const items = Array.isArray(data) ? data : data?.items || [];
        setFamilies((prev) => (append ? [...prev, ...items] : items));
        setHasMore(items.length >= PAGE_SIZE);
        setOffset(nextOffset);
      } catch (e) {
        setError(e?.message || "Failed to load families");
        if (!append) setFamilies([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [statusFilter]
  );

  useEffect(() => {
    load(0);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadMore = () => load(offset + PAGE_SIZE, { append: true });

  const [formErrors, setFormErrors] = useState({});

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "familyCode" || key === "name") {
      setFormErrors((prev) => ({
        ...prev,
        [key]: value?.trim() ? "" : prev[key],
      }));
    }
  };

  const openNew = () => {
    setForm(emptyForm());
    setFormErrors({});
    setEditorOpen(true);
  };

  const openEdit = useCallback((fam) => {
    setForm({
      id: fam.id,
      familyCode: fam.familyCode ?? "",
      name: fam.name ?? "",
      category: fam.category ?? "Rings",
      defaultShape: fam.defaultShape ?? "",
      defaultMetalType: fam.defaultMetalType ?? "",
      storyMd: fam.storyMd ?? "",
      status: fam.status ?? "draft",
      axes:
        Array.isArray(fam.axes) && fam.axes.length
          ? fam.axes.map(axisToEditor)
          : [emptyAxis()],
    });
    setFormErrors({});
    setEditorOpen(true);
  }, []);

  const closeEditor = () => {
    setEditorOpen(false);
    setForm(emptyForm());
    setFormErrors({});
  };

  // Axis row helpers
  const addAxis = () =>
    setForm((f) => ({ ...f, axes: [...f.axes, emptyAxis()] }));

  const removeAxis = (idx) =>
    setForm((f) => ({
      ...f,
      axes: f.axes.filter((_, i) => i !== idx),
    }));

  const setAxisField = (idx, key, value) =>
    setForm((f) => ({
      ...f,
      axes: f.axes.map((a, i) => (i === idx ? { ...a, [key]: value } : a)),
    }));

  const buildPayload = () => {
    const axes = (form.axes || [])
      .map((a) => ({
        axis: a.axis,
        allowedValues: String(a.allowedValuesCsv || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        defaultValue: a.defaultValue?.trim() || "",
        affectsWeight: a.affectsWeight !== false,
        affectsPrice: a.affectsPrice !== false,
      }))
      .filter((a) => a.axis);

    return {
      familyCode: form.familyCode?.trim() || "",
      name: form.name?.trim() || "",
      category: form.category || "",
      defaultShape: form.defaultShape?.trim() || "",
      defaultMetalType: form.defaultMetalType?.trim() || "",
      storyMd: form.storyMd || "",
      status: form.status || "draft",
      axes,
      masterProducts: [],
    };
  };

  const save = async () => {
    const nextErrors = {};
    if (!form.familyCode?.trim()) nextErrors.familyCode = "Family Code is required";
    if (!form.name?.trim()) nextErrors.name = "Name is required";
    if (Object.keys(nextErrors).length) {
      setFormErrors(nextErrors);
      toast.error(nextErrors.familyCode || nextErrors.name);
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      const isEdit = Boolean(form.id);
      const url = isEdit
        ? `/api/catalog/families/${form.id}`
        : `/api/catalog/families`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Save failed");
      toast.success(isEdit ? "Family updated" : "Family created");
      closeEditor();
      load();
    } catch (e) {
      toast.error(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = useCallback(
    async (fam) => {
      if (
        !confirm(
          `Delete family "${fam.familyCode || fam.name || fam.id}"? This cannot be undone.`
        )
      )
        return;
      try {
        const res = await fetch(`/api/catalog/families/${fam.id}`, {
          method: "DELETE",
          headers: authHeaders(),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message || "Delete failed");
        }
        toast.success("Family deleted");
        if (form.id === fam.id) closeEditor();
        load();
      } catch (e) {
        toast.error(e?.message || "Delete failed");
      }
    },
    [form.id, load]
  );

  const columns = useMemo(
    () => [
      {
        id: "familyCode",
        header: ({ column }) => (
          <DataGridColumnHeader title="Family Code" column={column} />
        ),
        accessorFn: (row) => row.familyCode,
        cell: ({ row }) => (
          <TruncatedText
            value={row.original.familyCode}
            className="font-medium text-foreground"
          />
        ),
        size: 180,
        meta: { headerTitle: "Family Code", identity: true, truncate: true },
      },
      {
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Name" column={column} />
        ),
        accessorFn: (row) => row.name,
        cell: ({ row }) => <TruncatedText value={row.original.name} />,
        size: 240,
        meta: { headerTitle: "Name", truncate: true },
      },
      {
        id: "category",
        header: ({ column }) => (
          <DataGridColumnHeader title="Category" column={column} />
        ),
        accessorFn: (row) => row.category,
        cell: ({ row }) => <TruncatedText value={row.original.category} />,
        size: 160,
        meta: { headerTitle: "Category", truncate: true },
      },
      {
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        accessorFn: (row) => row.status,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        size: 120,
        meta: { headerTitle: "Status" },
      },
      {
        id: "axesCount",
        header: ({ column }) => (
          <DataGridColumnHeader title="# Axes" column={column} />
        ),
        accessorFn: (row) => (Array.isArray(row.axes) ? row.axes.length : 0),
        cell: ({ row }) => (
          <span>{Array.isArray(row.original.axes) ? row.original.axes.length : 0}</span>
        ),
        size: 100,
        meta: { headerTitle: "# Axes" },
      },
      {
        id: "action",
        header: ({ column }) => (
          <DataGridColumnHeader title="Actions" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              mode="icon"
              variant="outline"
              aria-label={`Edit family ${row.original.familyCode || row.original.name || ""}`}
              title="Edit family"
              onClick={(event) => {
                event.stopPropagation();
                openEdit(row.original);
              }}
            >
              <Pencil />
            </Button>
            <Button
              mode="icon"
              variant="outline"
              aria-label={`Delete family ${row.original.familyCode || row.original.name || ""}`}
              title="Delete family"
              onClick={(event) => {
                event.stopPropagation();
                remove(row.original);
              }}
            >
              <Trash2 />
            </Button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 104,
        meta: { headerTitle: "Actions" },
      },
    ],
    [openEdit, remove]
  );

  // Search runs over the rows already loaded from the API.
  const visibleFamilies = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    if (!needle) return families;
    return families.filter((fam) =>
      [fam.familyCode, fam.name, fam.category, fam.status].some((field) =>
        String(field ?? "").toLowerCase().includes(needle)
      )
    );
  }, [families, searchQuery]);

  const handlePaginationChange = useCallback((updater) => {
    setPagination((prev) => ({
      ...prev,
      ...(typeof updater === "function" ? updater(prev) : updater),
    }));
  }, []);

  return (
    <Page>
      <PageHeader
        title="Product Families"
        description="Designs + their configurable axes. Variants resolve on demand — never pre-materialized."
        actions={
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" aria-label="Family status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "all" ? "All statuses" : status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="primary" size="md" onClick={openNew}>
              <Plus className="size-4" />
              New Family
            </Button>
          </>
        }
      />

      {/* Editor */}
      {editorOpen && (
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-sm font-semibold text-foreground">
                {form.id ? "Edit Family" : "New Family"}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Design details plus the axes shoppers configure on the storefront.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              mode="icon"
              size="sm"
              onClick={closeEditor}
              aria-label="Close editor"
              title="Close editor"
            >
              <X />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FormField
                label="Family Code"
                htmlFor="family-code"
                error={formErrors.familyCode}
                errorId="family-code-error"
              >
                <Input
                  id="family-code"
                  value={form.familyCode}
                  onChange={(e) => setField("familyCode", e.target.value)}
                  placeholder="e.g. LR-001"
                  aria-invalid={Boolean(formErrors.familyCode)}
                  aria-describedby={
                    formErrors.familyCode ? "family-code-error" : undefined
                  }
                />
              </FormField>
              <FormField
                label="Name"
                htmlFor="family-name"
                error={formErrors.name}
                errorId="family-name-error"
              >
                <Input
                  id="family-name"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="e.g. Luna Solitaire Ring"
                  aria-invalid={Boolean(formErrors.name)}
                  aria-describedby={
                    formErrors.name ? "family-name-error" : undefined
                  }
                />
              </FormField>
              <FormField label="Category" htmlFor="family-category">
                <Select
                  value={form.category}
                  onValueChange={(value) => setField("category", value)}
                >
                  <SelectTrigger id="family-category" className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Default Shape" htmlFor="family-default-shape">
                <Input
                  id="family-default-shape"
                  value={form.defaultShape}
                  onChange={(e) => setField("defaultShape", e.target.value)}
                  placeholder="e.g. Round"
                />
              </FormField>
              <FormField
                label="Default Metal Type"
                htmlFor="family-default-metal-type"
              >
                <Input
                  id="family-default-metal-type"
                  value={form.defaultMetalType}
                  onChange={(e) => setField("defaultMetalType", e.target.value)}
                  placeholder="e.g. 18K Yellow Gold"
                />
              </FormField>
              <FormField label="Status" htmlFor="family-status">
                <Select
                  value={form.status}
                  onValueChange={(value) => setField("status", value)}
                >
                  <SelectTrigger id="family-status" className="w-full">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField
                label="Story (Markdown)"
                htmlFor="family-story"
                className="sm:col-span-full"
              >
                <Textarea
                  id="family-story"
                  value={form.storyMd}
                  onChange={(e) => setField("storyMd", e.target.value)}
                  placeholder="Design story / narrative (markdown supported)"
                  rows={4}
                />
              </FormField>
            </div>

            {/* Axes editor */}
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">
                    Configurable Axes
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Each axis defines a dimension shoppers configure. Variants
                    resolve from these — they are never stored.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addAxis}>
                  <Plus className="size-4" />
                  Add Axis
                </Button>
              </div>

              {(!form.axes || form.axes.length === 0) && (
                <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No axes yet. Click “Add Axis” to define one.
                </div>
              )}

              {form.axes.map((axis, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-border bg-muted/30 p-3"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                    <div className="sm:col-span-3">
                      <FormField label="Axis" htmlFor={`axis-type-${idx}`}>
                        <Select
                          value={axis.axis}
                          onValueChange={(value) =>
                            setAxisField(idx, "axis", value)
                          }
                        >
                          <SelectTrigger id={`axis-type-${idx}`} className="w-full">
                            <SelectValue placeholder="Select an axis" />
                          </SelectTrigger>
                          <SelectContent>
                            {AXIS_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>
                    </div>
                    <div className="sm:col-span-5">
                      <FormField
                        label="Allowed Values"
                        htmlFor={`axis-values-${idx}`}
                        hint="Comma-separated (e.g. Round, Oval, Cushion)"
                      >
                        <Input
                          id={`axis-values-${idx}`}
                          value={axis.allowedValuesCsv}
                          onChange={(e) =>
                            setAxisField(
                              idx,
                              "allowedValuesCsv",
                              e.target.value
                            )
                          }
                          placeholder="e.g. Round, Oval, Cushion"
                        />
                      </FormField>
                    </div>
                    <div className="sm:col-span-3">
                      <FormField
                        label="Default Value"
                        htmlFor={`axis-default-${idx}`}
                      >
                        <Input
                          id={`axis-default-${idx}`}
                          value={axis.defaultValue}
                          onChange={(e) =>
                            setAxisField(idx, "defaultValue", e.target.value)
                          }
                          placeholder="e.g. Round"
                        />
                      </FormField>
                    </div>
                    <div className="flex items-end sm:col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        mode="icon"
                        size="sm"
                        onClick={() => removeAxis(idx)}
                        aria-label={`Remove axis ${idx + 1}`}
                        title={`Remove axis ${idx + 1}`}
                        className="w-full"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`axis-weight-${idx}`}
                        checked={axis.affectsWeight !== false}
                        onCheckedChange={(checked) =>
                          setAxisField(idx, "affectsWeight", checked === true)
                        }
                      />
                      <Label
                        htmlFor={`axis-weight-${idx}`}
                        className="text-xs font-normal text-muted-foreground"
                      >
                        Affects weight
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`axis-price-${idx}`}
                        checked={axis.affectsPrice !== false}
                        onCheckedChange={(checked) =>
                          setAxisField(idx, "affectsPrice", checked === true)
                        }
                      />
                      <Label
                        htmlFor={`axis-price-${idx}`}
                        className="text-xs font-normal text-muted-foreground"
                      >
                        Affects price
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Editor actions */}
            <div className="mt-6 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" size="md" onClick={closeEditor}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={save}
                disabled={saving}
                aria-busy={saving}
              >
                {saving
                  ? "Saving…"
                  : form.id
                    ? "Update Family"
                    : "Create Family"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Family list */}
      {loading ? (
        <Card>
          <CardContent className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : (
        <ListWithCardToggle
          title="Product families"
          titleAs="none"
          data={visibleFamilies}
          columns={columns}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          serverSidePagination
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          pageCount={Math.max(1, Math.ceil(families.length / PAGE_SIZE))}
          totalCount={families.length}
          infiniteScroll
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
          resizableColumns
          paginationResetKey={statusFilter}
        />
      )}
    </Page>
  );
}
