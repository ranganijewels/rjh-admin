"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { PackageOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ListWithCardToggle } from "@/components/common/ListWithCardToggle";
import { StatusBadge } from "@/components/common/ui/badge";
import { Button } from "@/components/common/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
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
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";

import { authHeaders } from "../Catalog/_ui";

const money = (v) => "$" + Number(v || 0).toLocaleString();

const EMPTY = "—";

// Renders one configured column value. The `type` hint in the cfg decides
// the presentation; every cell falls back to the shared muted em dash when
// the record has no value for that field.
const CellValue = ({ row, col }) => {
  const v = row[col.key];

  if (col.type === "money") {
    return <span className="text-sm text-foreground">{money(v)}</span>;
  }

  if (col.type === "date") {
    return (
      <span className="text-sm text-foreground">
        {v ? new Date(v).toLocaleDateString() : EMPTY}
      </span>
    );
  }

  if (col.type === "json") {
    return (
      <span className="text-sm text-muted-foreground">
        {Array.isArray(v) ? `${v.length} items` : v ? "{…}" : EMPTY}
      </span>
    );
  }

  if (col.type === "badge") {
    if (v === null || v === undefined || v === "") {
      return <span className="text-sm text-muted-foreground">{EMPTY}</span>;
    }
    return <StatusBadge status={String(v)} />;
  }

  if (v === null || v === undefined || v === "") {
    return <span className="text-sm text-muted-foreground">{EMPTY}</span>;
  }

  return <TruncatedText value={v} />;
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

  const openNew = useCallback(() => {
    const f = {};
    fields.forEach((fld) => (f[fld.key] = fld.default ?? ""));
    setForm(f);
    setErrors({});
    setEditing({});
  }, [fields]);

  const openEdit = useCallback((row) => {
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
  }, [fields]);

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

  const remove = useCallback((row) => setDeleteTarget(row), []);

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

  const runAction = useCallback(async (row, act) => {
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
  }, [load, resource]);

  const entityLabel = title || "Record";

  // --- grid columns --------------------------------------------------------
  // The cfg column shape ({ key, label, type }) maps straight onto the shared
  // TanStack grid, so the table is rendered by ListWithCardToggle.
  const gridColumns = useMemo(() => {
    const list = (columns || []).map((c, index) => ({
      id: c.key,
      header: ({ column }) => (
        <DataGridColumnHeader title={c.label} column={column} />
      ),
      accessorFn: (row) => row[c.key],
      cell: ({ row }) => <CellValue row={row.original} col={c} />,
      size: 180,
      meta: {
        headerTitle: c.label,
        identity: index === 0,
        truncate: true,
      },
    }));

    list.push({
      id: "action",
      header: ({ column }) => (
        <DataGridColumnHeader title="Actions" column={column} />
      ),
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex items-center gap-2">
            {(rowActions || []).map((a) => {
              const isBusy = actioningId === `${record.id}:${a.action}`;
              return (
                <Button
                  key={`${a.action}-${a.label}`}
                  variant="outline"
                  size="sm"
                  disabled={isBusy}
                  onClick={(event) => {
                    event.stopPropagation();
                    runAction(record, a);
                  }}
                >
                  {isBusy ? `${a.label}…` : a.label}
                </Button>
              );
            })}
            {!readOnly && !noEdit && (
              <Button
                mode="icon"
                variant="outline"
                size="sm"
                aria-label={`Edit ${entityLabel}`}
                title="Edit"
                onClick={(event) => {
                  event.stopPropagation();
                  openEdit(record);
                }}
              >
                <Pencil className="size-4" />
              </Button>
            )}
            {!readOnly && (
              <Button
                mode="icon"
                variant="outline"
                size="sm"
                className="text-destructive"
                aria-label={`Delete ${entityLabel}`}
                title="Delete"
                onClick={(event) => {
                  event.stopPropagation();
                  remove(record);
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 200,
      meta: { headerTitle: "Actions" },
    });

    return list;
  }, [columns, rowActions, readOnly, noEdit, actioningId, entityLabel, openEdit, remove, runAction]);

  // --- editor --------------------------------------------------------------

  const renderField = (fld) => {
    const inputId = `${fieldIdBase}-${fld.key}`;
    const errorId = `${inputId}-error`;
    const fieldError = errors[fld.key];
    const isRequired = !fld.optional;
    const describedBy = fieldError ? errorId : undefined;

    return (
      <div
        key={fld.key}
        className={`flex flex-col gap-1.5 ${fld.full ? "sm:col-span-full" : ""}`}
      >
        {fld.type === "boolean" ? (
          <div className="flex items-center gap-2">
            <Checkbox
              id={inputId}
              checked={!!form[fld.key]}
              onCheckedChange={(value) => set(fld.key, !!value)}
              aria-required={isRequired}
            />
            <Label htmlFor={inputId} className="cursor-pointer font-normal text-muted-foreground">
              {fld.label}
            </Label>
          </div>
        ) : (
          <>
            <Label htmlFor={inputId}>{fld.label}</Label>
            {fld.type === "select" ? (
              <Select
                value={form[fld.key] ?? ""}
                onValueChange={(value) => set(fld.key, value)}
              >
                <SelectTrigger
                  id={inputId}
                  aria-required={isRequired}
                  aria-invalid={!!fieldError}
                  aria-describedby={describedBy}
                >
                  <SelectValue placeholder={fld.placeholder || "Select an option"} />
                </SelectTrigger>
                <SelectContent>
                  {(fld.options || []).map((opt) => {
                    const optionValue =
                      typeof opt === "string" ? opt : opt.value;
                    const optionLabel =
                      typeof opt === "string" ? opt : opt.label;
                    return (
                      <SelectItem key={optionValue} value={optionValue}>
                        {optionLabel}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            ) : fld.type === "textarea" || fld.type === "json" ? (
              <Textarea
                id={inputId}
                rows={fld.type === "json" ? 6 : 3}
                value={form[fld.key] ?? ""}
                onChange={(e) => set(fld.key, e.target.value)}
                placeholder={fld.placeholder}
                aria-required={isRequired}
                aria-invalid={!!fieldError}
                aria-describedby={describedBy}
              />
            ) : (
              <Input
                id={inputId}
                type={fld.type === "number" ? "number" : fld.type === "date" ? "date" : "text"}
                value={form[fld.key] ?? ""}
                onChange={(e) => set(fld.key, e.target.value)}
                placeholder={fld.placeholder}
                aria-required={isRequired}
                aria-invalid={!!fieldError}
                aria-describedby={describedBy}
              />
            )}
          </>
        )}
        {fieldError ? (
          <span id={errorId} role="alert" className="text-xs text-destructive">
            {fieldError}
          </span>
        ) : fld.hint ? (
          <span className="text-xs text-muted-foreground">{fld.hint}</span>
        ) : null}
      </div>
    );
  };

  return (
    <Page>
      <PageHeader
        title={title}
        description={description}
        actions={
          !readOnly ? (
            <Button variant="primary" onClick={openNew}>
              <Plus className="size-4" />
              Add New {entityLabel}
            </Button>
          ) : null
        }
      />

      {editing && (
        <div ref={formSectionRef} tabIndex={-1}>
          <Card>
            <CardHeader className="flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  {editing.id ? `Edit ${entityLabel}` : `New ${entityLabel}`}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {editing.id
                    ? `Update this ${entityLabel.toLowerCase()} record.`
                    : `Create a new ${entityLabel.toLowerCase()} record.`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={save} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {fields.map(renderField)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {loading ? (
        <Card>
          <CardContent className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <PackageOpen className="size-10 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">No {entityLabel} yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {readOnly
              ? `There are no ${entityLabel.toLowerCase()} records yet.`
              : `Create your first ${entityLabel.toLowerCase()} to get started.`}
          </p>
          {!readOnly && (
            <Button variant="primary" onClick={openNew}>
              <Plus className="size-4" />
              Add New {entityLabel}
            </Button>
          )}
        </div>
      ) : (
        <ListWithCardToggle
          title={entityLabel}
          titleAs="none"
          data={rows}
          columns={gridColumns}
          resizableColumns
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={`Delete ${entityLabel}`}
        message="This will permanently delete this record. This action cannot be undone."
      />
    </Page>
  );
}
