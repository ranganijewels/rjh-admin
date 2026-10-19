"use client";

import { useEffect, useRef, useState, useCallback, useId } from "react";
import { toast } from "sonner";
import { Section, Field, Grid, Select, Input, Textarea, Button, authHeaders } from "../Catalog/_ui";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";

const money = (v) => "$" + Number(v || 0).toLocaleString();
const fmtCell = (row, col) => {
  const v = row[col.key];
  if (col.type === "money") return money(v);
  if (col.type === "date") return v ? new Date(v).toLocaleDateString() : "—";
  if (col.type === "json") return Array.isArray(v) ? `${v.length} items` : v ? "{…}" : "—";
  if (col.type === "badge")
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
        {v ?? "—"}
      </span>
    );
  return v ?? "—";
};

export default function EntityManager({ cfg }) {
  const { title, description, resource, columns, fields, readOnly, noEdit, rowActions } = cfg;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | {} (new) | row (edit)
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actioningId, setActioningId] = useState(null);
  const formSectionRef = useRef(null);
  const fieldIdBase = useId();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/enterprise/${resource}`, { cache: "no-store" });
      const j = await res.json();
      setRows(Array.isArray(j) ? j : j?.data ?? []);
    } catch (e) {
      toast.error(e?.message ? `Failed to load: ${e.message}` : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (editing && formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [editing]);

  const openNew = () => {
    const f = {};
    fields.forEach((fld) => (f[fld.key] = fld.default ?? ""));
    setForm(f);
    setErrors({});
    setEditing({});
  };
  const openEdit = (row) => {
    const f = {};
    fields.forEach((fld) => {
      let v = row[fld.key];
      if (fld.type === "csv" && Array.isArray(v)) v = v.join(", ");
      if (fld.type === "json" && v && typeof v === "object") v = JSON.stringify(v, null, 2);
      f[fld.key] = v ?? fld.default ?? "";
    });
    setForm(f);
    setErrors({});
    setEditing(row);
  };

  const set = (k, v) => {
    setForm((s) => ({ ...s, [k]: v }));
    setErrors((s) => (s[k] ? { ...s, [k]: undefined } : s));
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {};
      const nextErrors = {};
      for (const fld of fields) {
        let v = form[fld.key];
        if (v === "" || v == null) {
          if (fld.optional) continue;
          nextErrors[fld.key] = `${fld.label} is required`;
        }
        if (fld.type === "number") v = v === "" ? undefined : Number(v);
        else if (fld.type === "boolean") v = !!v;
        else if (fld.type === "csv") v = String(v || "").split(",").map((s) => s.trim()).filter(Boolean);
        else if (fld.type === "json") {
          try { v = v ? JSON.parse(v) : {}; } catch {
            nextErrors[fld.key] = `Invalid JSON in ${fld.label}`;
            toast.error(`Invalid JSON in ${fld.label}`);
            throw new Error("json");
          }
        }
        if (v !== undefined) payload[fld.key] = v;
      }
      if (Object.keys(nextErrors).length) {
        setErrors(nextErrors);
        toast.error("Please fix the highlighted fields");
        throw new Error("validation");
      }
      const isEdit = editing && editing.id;
      const url = isEdit ? `/api/enterprise/${resource}/${editing.id}` : `/api/enterprise/${resource}`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || `Save failed (HTTP ${res.status})`);
      }
      toast.success(isEdit ? "Updated" : "Created");
      setEditing(null);
      setErrors({});
      load();
    } catch (e) {
      if (e.message !== "json" && e.message !== "validation") toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = (row) => setDeleteTarget(row);

  const confirmDelete = async () => {
    const row = deleteTarget;
    if (!row) return;
    try {
      const res = await fetch(`/api/enterprise/${resource}/${row.id}`, { method: "DELETE", headers: authHeaders() });
      if (res.ok) {
        toast.success("Deleted");
        load();
      } else {
        const j = await res.json().catch(() => ({}));
        toast.error(j?.message ? `Delete failed: ${j.message}` : `Delete failed (HTTP ${res.status})`);
      }
    } finally {
      setDeleteTarget(null);
    }
  };

  const runAction = async (row, act) => {
    setActioningId(`${row.id}:${act.action}`);
    try {
      const res = await fetch(`/api/enterprise/${resource}/${row.id}/${act.action}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(act.body || {}),
      });
      if (res.ok) {
        toast.success(`${act.label} done`);
        load();
      } else {
        const j = await res.json().catch(() => ({}));
        toast.error(j?.message ? `${act.label} failed: ${j.message}` : `${act.label} failed (HTTP ${res.status})`);
      }
    } finally {
      setActioningId(null);
    }
  };

  const entityLabel = title || "Record";

  return (
    <div className="p-5">
      <div className="flex items-start justify-between mb-5 gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-0.5 max-w-[820px]">{description}</p>}
        </div>
        {!readOnly && (
          <Button variant="primary" className="shrink-0" onClick={openNew}>
            + Add New {entityLabel}
          </Button>
        )}
      </div>

      {editing && (
        <div ref={formSectionRef} tabIndex={-1}>
          <Section
            title={editing.id ? "Edit" : "New"}
            action={
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={save} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            }
          >
            <Grid>
              {fields.map((fld) => {
                const inputId = `${fieldIdBase}-${fld.key}`;
                const errorId = `${inputId}-error`;
                const fieldError = errors[fld.key];
                const isRequired = !fld.optional;
                return (
                  <Field key={fld.key} label={fld.label} hint={fld.hint} full={fld.full} htmlFor={inputId} error={fieldError} errorId={errorId}>
                    {fld.type === "select" ? (
                      <Select
                        id={inputId}
                        value={form[fld.key]}
                        onChange={(e) => set(fld.key, e.target.value)}
                        options={fld.options || []}
                        aria-required={isRequired}
                        aria-invalid={!!fieldError}
                        aria-describedby={fieldError ? errorId : undefined}
                      />
                    ) : fld.type === "textarea" || fld.type === "json" ? (
                      <Textarea
                        id={inputId}
                        value={form[fld.key]}
                        onChange={(e) => set(fld.key, e.target.value)}
                        placeholder={fld.placeholder}
                        aria-required={isRequired}
                        aria-invalid={!!fieldError}
                        aria-describedby={fieldError ? errorId : undefined}
                      />
                    ) : fld.type === "boolean" ? (
                      <label htmlFor={inputId} className="inline-flex items-center gap-2 w-fit cursor-pointer">
                        <input
                          id={inputId}
                          type="checkbox"
                          checked={!!form[fld.key]}
                          onChange={(e) => set(fld.key, e.target.checked)}
                          className="w-4 h-4"
                          aria-required={isRequired}
                        />
                        <span className="text-sm text-secondary-foreground">{fld.label}</span>
                      </label>
                    ) : (
                      <Input
                        id={inputId}
                        type={fld.type === "number" ? "number" : fld.type === "date" ? "date" : "text"}
                        value={form[fld.key]}
                        onChange={(e) => set(fld.key, e.target.value)}
                        placeholder={fld.placeholder}
                        aria-required={isRequired}
                        aria-invalid={!!fieldError}
                        aria-describedby={fieldError ? errorId : undefined}
                      />
                    )}
                  </Field>
                );
              })}
            </Grid>
          </Section>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-border overflow-x-auto">
        <table className="w-full text-sm" aria-label={`${entityLabel} records`}>
          <thead>
            <tr className="bg-primary text-primary-foreground text-left">
              {columns.map((c) => (
                <th key={c.key} scope="col" className="px-4 py-3 font-semibold text-sm tracking-wide">{c.label}</th>
              ))}
              <th scope="col" className="px-4 py-3 font-semibold text-sm tracking-wide text-right">Actions</th>
            </tr>
          </thead>
          <tbody aria-busy={loading} aria-live="polite">
            {loading ? (
              <tr><td colSpan={columns.length + 1} className="px-4 py-8 text-center text-muted-foreground">Loading {entityLabel}…</td></tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-muted-foreground">
                  No {entityLabel} yet.
                  {!readOnly && (
                    <>
                      {" "}
                      <button onClick={openNew} className="text-primary hover:underline font-medium">
                        Click + Add New {entityLabel} to create your first one.
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-gray-100 dark:border-border even:bg-gray-50 dark:bg-muted hover:bg-primary/5 focus-within:bg-primary/5">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-2.5">{fmtCell(row, c)}</td>
                  ))}
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    {(rowActions || []).map((a) => {
                      const isBusy = actioningId === `${row.id}:${a.action}`;
                      return (
                        <button
                          key={a.label}
                          onClick={() => runAction(row, a)}
                          disabled={isBusy}
                          className="text-primary hover:underline text-xs mr-3 font-medium disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {isBusy ? `${a.label}…` : a.label}
                        </button>
                      );
                    })}
                    {!readOnly && !noEdit && (
                      <button onClick={() => openEdit(row)} className="text-primary hover:underline text-xs mr-3">Edit</button>
                    )}
                    {!readOnly && (
                      <button onClick={() => remove(row)} className="text-red-500 hover:underline text-xs">Delete</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={`Delete ${entityLabel}`}
        message="This will permanently delete this record. This action cannot be undone."
      />
    </div>
  );
}
