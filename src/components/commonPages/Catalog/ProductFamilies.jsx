"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Section,
  Grid,
  Field,
  Select,
  Input,
  Textarea,
  Button,
  authHeaders,
} from "@/components/commonPages/Catalog/_ui";
import StatusBadge from "@/components/commonPages/Catalog/StatusBadge";

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

export default function ProductFamilies() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm());

  const PAGE_SIZE = 50;
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadMore = () => load(offset + PAGE_SIZE, { append: true });

  // Auto-load the next page as the sentinel scrolls into view, instead of
  // requiring a manual "Load more" click.
  const sentinelRef = useRef(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMore) loadMore();
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, offset]);

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

  const openEdit = (fam) => {
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
  };

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

  const remove = async (fam) => {
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
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#162640]">
            Product Families
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Designs + their configurable axes. Variants resolve on demand —
            never pre-materialized.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={STATUS_FILTERS}
          />
          <Button type="button" variant="primary" size="md" onClick={openNew}>
            New Family
          </Button>
        </div>
      </div>

      {/* Editor */}
      {editorOpen && (
        <Section
          title={form.id ? "Edit Family" : "New Family"}
          action={
            <button
              type="button"
              onClick={closeEditor}
              className="text-xs font-medium text-muted-foreground hover:text-[#162640] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              Close
            </button>
          }
        >
          <Grid cols={3}>
            <Field
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
            </Field>
            <Field
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
            </Field>
            <Field label="Category">
              <Select
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                options={CATEGORIES}
              />
            </Field>
            <Field label="Default Shape">
              <Input
                value={form.defaultShape}
                onChange={(e) => setField("defaultShape", e.target.value)}
                placeholder="e.g. Round"
              />
            </Field>
            <Field label="Default Metal Type">
              <Input
                value={form.defaultMetalType}
                onChange={(e) => setField("defaultMetalType", e.target.value)}
                placeholder="e.g. 18K Yellow Gold"
              />
            </Field>
            <Field label="Status">
              <Select
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
                options={STATUSES}
              />
            </Field>
            <Field label="Story (Markdown)" full>
              <Textarea
                value={form.storyMd}
                onChange={(e) => setField("storyMd", e.target.value)}
                placeholder="Design story / narrative (markdown supported)"
                rows={4}
              />
            </Field>
          </Grid>

          {/* Axes editor */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-[#162640]">
                  Configurable Axes
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Each axis defines a dimension shoppers configure. Variants
                  resolve from these — they are never stored.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAxis}
              >
                + Add Axis
              </Button>
            </div>

            {(!form.axes || form.axes.length === 0) && (
              <div className="rounded-md border border-dashed border-gray-300 dark:border-border p-4 text-center text-xs text-muted-foreground">
                No axes yet. Click “Add Axis” to define one.
              </div>
            )}

            <div className="flex flex-col gap-3">
              {form.axes.map((axis, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-gray-200 dark:border-border bg-muted/30 p-3"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                    <div className="sm:col-span-3">
                      <Field label="Axis">
                        <Select
                          value={axis.axis}
                          onChange={(e) =>
                            setAxisField(idx, "axis", e.target.value)
                          }
                          options={AXIS_TYPES}
                        />
                      </Field>
                    </div>
                    <div className="sm:col-span-5">
                      <Field
                        label="Allowed Values"
                        hint="Comma-separated (e.g. Round, Oval, Cushion)"
                      >
                        <Input
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
                      </Field>
                    </div>
                    <div className="sm:col-span-3">
                      <Field label="Default Value">
                        <Input
                          value={axis.defaultValue}
                          onChange={(e) =>
                            setAxisField(idx, "defaultValue", e.target.value)
                          }
                          placeholder="e.g. Round"
                        />
                      </Field>
                    </div>
                    <div className="flex items-end sm:col-span-1">
                      <button
                        type="button"
                        onClick={() => removeAxis(idx)}
                        aria-label={`Remove axis ${idx + 1}`}
                        className="w-full rounded-md border border-rose-200 px-2 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 text-xs text-secondary-foreground">
                      <input
                        type="checkbox"
                        checked={axis.affectsWeight !== false}
                        onChange={(e) =>
                          setAxisField(idx, "affectsWeight", e.target.checked)
                        }
                      />
                      Affects weight
                    </label>
                    <label className="flex items-center gap-2 text-xs text-secondary-foreground">
                      <input
                        type="checkbox"
                        checked={axis.affectsPrice !== false}
                        onChange={(e) =>
                          setAxisField(idx, "affectsPrice", e.target.checked)
                        }
                      />
                      Affects price
                    </label>
                  </div>
                </div>
              ))}
            </div>
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
              {saving && (
                <svg
                  className="h-3.5 w-3.5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}
              {saving ? "Saving…" : form.id ? "Update Family" : "Create Family"}
            </Button>
          </div>
        </Section>
      )}

      {/* Table (md and up) */}
      <div className="hidden overflow-hidden rounded-xl border border-gray-200 dark:border-border md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-[#162640] text-left text-white">
                <th scope="col" className="px-4 py-3 font-semibold">Family Code</th>
                <th scope="col" className="px-4 py-3 font-semibold">Name</th>
                <th scope="col" className="px-4 py-3 font-semibold">Category</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 font-semibold"># Axes</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Loading families…
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-rose-600"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && families.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No product families yet. Click “New Family” to create one.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                families.map((fam, i) => (
                  <tr
                    key={fam.id ?? fam.familyCode ?? i}
                    className={i % 2 === 0 ? "bg-white dark:bg-card" : "bg-gray-50 dark:bg-muted"}
                  >
                    <td className="px-4 py-3 font-medium text-[#162640]">
                      {fam.familyCode || "—"}
                    </td>
                    <td className="px-4 py-3">{fam.name || "—"}</td>
                    <td className="px-4 py-3">{fam.category || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={fam.status} />
                    </td>
                    <td className="px-4 py-3">
                      {Array.isArray(fam.axes) ? fam.axes.length : 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(fam)}
                          aria-label={`Edit family ${fam.familyCode || fam.name || ""}`}
                          className="rounded-md border border-[#162640] px-3 py-1.5 text-xs font-medium text-[#162640] transition-colors hover:bg-[#162640] hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(fam)}
                          aria-label={`Delete family ${fam.familyCode || fam.name || ""}`}
                          className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card layout (below md) */}
      <div className="flex flex-col gap-3 md:hidden">
        {loading && (
          <div className="rounded-xl border border-gray-200 dark:border-border px-4 py-8 text-center text-sm text-muted-foreground">
            Loading families…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-gray-200 dark:border-border px-4 py-8 text-center text-sm text-rose-600">
            {error}
          </div>
        )}

        {!loading && !error && families.length === 0 && (
          <div className="rounded-xl border border-gray-200 dark:border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No product families yet. Tap “New Family” to create one.
          </div>
        )}

        {!loading &&
          !error &&
          families.map((fam, i) => (
            <div
              key={fam.id ?? fam.familyCode ?? i}
              className="rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-[#162640]">
                    {fam.familyCode || "—"}
                  </div>
                  <div className="text-sm">{fam.name || "—"}</div>
                </div>
                <StatusBadge status={fam.status} />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-secondary-foreground">
                <div>
                  <dt className="text-muted-foreground">Category</dt>
                  <dd>{fam.category || "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground"># Axes</dt>
                  <dd>{Array.isArray(fam.axes) ? fam.axes.length : 0}</dd>
                </div>
              </dl>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(fam)}
                  aria-label={`Edit family ${fam.familyCode || fam.name || ""}`}
                  className="rounded-md border border-[#162640] px-3 py-1.5 text-xs font-medium text-[#162640] transition-colors hover:bg-[#162640] hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(fam)}
                  aria-label={`Delete family ${fam.familyCode || fam.name || ""}`}
                  className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>

      {!loading && !error && hasMore && (
        <div ref={sentinelRef} className="mt-4 flex justify-center py-6">
          {loadingMore && (
            <span className="text-sm text-muted-foreground">Loading more…</span>
          )}
        </div>
      )}
    </div>
  );
}
