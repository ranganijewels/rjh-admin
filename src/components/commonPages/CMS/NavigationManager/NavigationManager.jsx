"use client";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/common/ui/button";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/components/common/ui/toolbar";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, ExternalLink } from "lucide-react";
import { useCrudList } from "@/hooks/useCrudList";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import NavItemModel from "./NavItemModel";

const authHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authTokenStoreAdmin") : null;
  return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
};

const NavigationManager = () => {
  const {
    list,
    loading,
    editData,
    setEditData,
    deleteId,
    setDeleteId,
    dialogOpen,
    setDialogOpen,
    confirmOpen,
    setConfirmOpen,
    fetchData,
    handleDelete,
  } = useCrudList("/api/cms/navigation");

  // Which parent a brand-new item should be created under — only meaningful
  // in create mode; editing an existing item keeps its own parentId as-is.
  const [addParentId, setAddParentId] = useState(null);

  const { topLevel, childrenByParent } = useMemo(() => {
    const top = [];
    const byParent = {};
    (list || []).forEach((item) => {
      if (item.parentId) {
        (byParent[item.parentId] = byParent[item.parentId] || []).push(item);
      } else {
        top.push(item);
      }
    });
    const bySort = (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    top.sort(bySort);
    Object.values(byParent).forEach((arr) => arr.sort(bySort));
    return { topLevel: top, childrenByParent: byParent };
  }, [list]);

  const handleAddTop = () => { setEditData(null); setAddParentId(null); setDialogOpen(true); };
  const handleAddChild = (parentId) => { setEditData(null); setAddParentId(parentId); setDialogOpen(true); };
  const handleEdit = (item) => { setEditData(item); setAddParentId(item.parentId || null); setDialogOpen(true); };
  const handleAskDelete = (id) => { setDeleteId(id); setConfirmOpen(true); };

  const confirmDelete = async () => {
    try {
      await handleDelete();
    } catch (e) {
      toast.error(e.message || "Failed to delete");
      setConfirmOpen(false);
    }
  };

  const move = async (item, siblings, direction) => {
    const idx = siblings.findIndex((s) => s.id === item.id);
    const swapWith = direction === "up" ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= siblings.length) return;
    const orderedIds = siblings.map((s) => s.id);
    [orderedIds[idx], orderedIds[swapWith]] = [orderedIds[swapWith], orderedIds[idx]];
    try {
      const res = await fetch("/api/cms/navigation/reorder", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ parentId: item.parentId || null, orderedIds }),
      });
      if (!res.ok) throw new Error("Reorder failed");
      fetchData();
    } catch {
      toast.error("Failed to reorder");
    }
  };

  const Row = ({ item, siblings, idx, sub }) => (
    <div className={`flex items-center justify-between gap-3 ${sub ? "pl-4 py-1.5 border-l-2 border-border" : "px-4 py-3 bg-muted/30"}`}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={sub ? "text-sm" : "font-medium text-sm"}>{item.label}</span>
          {!item.isActive && (
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground border border-border rounded px-1.5 py-0.5">
              Inactive
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
          {item.url}
          {item.target === "_blank" && <ExternalLink className="h-3 w-3 shrink-0" />}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="outline" mode="icon" size="sm" onClick={() => move(item, siblings, "up")} disabled={idx === 0}>
          <ChevronUp className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" mode="icon" size="sm" onClick={() => move(item, siblings, "down")} disabled={idx === siblings.length - 1}>
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" mode="icon" size="sm" onClick={() => handleEdit(item)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" mode="icon" size="sm" onClick={() => handleAskDelete(item.id)}>
          <Trash2 className="h-3.5 w-3.5 text-red-500" />
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Navigation Menu" className="font-semibold !text-foreground text-lg" />
          <ToolbarDescription className="mt-1 text-sm">
            Build the storefront header menu — link to a Collection, Category, Style, static page, or any custom URL.
          </ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <Button onClick={handleAddTop}>
            <Plus className="mr-2 h-4 w-4" /> Add Top-Level Item
          </Button>
        </ToolbarActions>
      </Toolbar>

      <div className="space-y-3 mt-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : topLevel.length === 0 ? (
          <p className="text-sm text-muted-foreground">No navigation items yet — add the first one above.</p>
        ) : (
          topLevel.map((item, idx) => {
            const children = childrenByParent[item.id] || [];
            return (
              <div key={item.id} className="border border-border rounded-lg overflow-hidden">
                <Row item={item} siblings={topLevel} idx={idx} />
                <div className="px-4 py-2 space-y-1.5">
                  {children.map((child, cIdx) => (
                    <Row key={child.id} item={child} siblings={children} idx={cIdx} sub />
                  ))}
                  <Button variant="outline" size="sm" className="mt-1 gap-1.5" onClick={() => handleAddChild(item.id)}>
                    <Plus className="h-3.5 w-3.5" /> Add Sub-Link
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <NavItemModel
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditData(null); }}
        onSuccess={fetchData}
        editData={editData}
        parentId={addParentId}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Navigation Item"
        message="Are you sure you want to delete this navigation item? This action cannot be undone."
      />
    </div>
  );
};

export default NavigationManager;
