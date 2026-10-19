"use client";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/common/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/common/ui/cards/card";
import { Badge } from "@/components/common/ui/badge";
import { PageHeader } from "@/components/common/ui/page";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { useCrudList } from "@/hooks/useCrudList";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import NavItemModel from "./NavItemModel";
import { cn } from "@/lib/utils";

const authHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authTokenStoreAdmin") : null;
  return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
};

// One numbered row in the menu card. Actions are always present in the DOM
// (for keyboard + touch) but only fade in on hover/focus on pointer devices,
// matching the reference layout.
const MenuRow = ({ item, number, siblings, idx, sub, onMove, onEdit, onDelete }) => {
  const isFirst = idx === 0;
  const isLast = idx === siblings.length - 1;

  return (
    <div
      className={cn(
        "group flex items-center gap-4 py-3.5 transition-colors hover:bg-muted/40 focus-within:bg-muted/40",
        sub ? "ps-14 pe-4" : "px-4"
      )}
    >
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          sub ? "bg-muted text-muted-foreground" : "bg-secondary text-foreground"
        )}
        aria-hidden="true"
      >
        {number}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("truncate text-sm", sub ? "font-normal" : "font-medium")}>
            {item.label}
          </span>
          {!item.isActive && (
            <Badge appearance="outline" shape="circle" size="sm">
              Inactive
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="truncate" title={item.url}>
            {item.url}
          </span>
          {item.target === "_blank" && (
            <ExternalLink className="h-3 w-3 shrink-0" aria-label="Opens in a new tab" />
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
        <Button
          variant="ghost"
          mode="icon"
          size="sm"
          aria-label={`Move ${item.label} up`}
          title="Move up"
          onClick={() => onMove(item, siblings, "up")}
          disabled={isFirst}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          mode="icon"
          size="sm"
          aria-label={`Move ${item.label} down`}
          title="Move down"
          onClick={() => onMove(item, siblings, "down")}
          disabled={isLast}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          mode="icon"
          size="sm"
          aria-label={`Edit ${item.label}`}
          title="Edit"
          onClick={() => onEdit(item)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          mode="icon"
          size="sm"
          aria-label={`Delete ${item.label}`}
          title="Delete"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
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

  return (
    <div>
      <PageHeader
        titleAs="h2"
        title="Navigation Menu"
        description="Build the storefront header menu — link to a Collection, Category, Style, static page, or any custom URL."
        actions={
          <Button onClick={handleAddTop}>
            <Plus className="size-4" aria-hidden="true" /> Add menu item
          </Button>
        }
      />

      <Card className="mt-4">
        <CardHeader className="py-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Menu items</p>
            <p className="text-xs text-muted-foreground">
              {topLevel.length === 0
                ? "No items yet"
                : `${topLevel.length} top-level ${topLevel.length === 1 ? "item" : "items"}`}
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">Loading…</p>
          ) : topLevel.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                No navigation items yet — add the first one to get started.
              </p>
              <Button onClick={handleAddTop} variant="outline">
                <Plus className="me-2 h-4 w-4" aria-hidden="true" /> Add menu item
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {topLevel.map((item, idx) => {
                const children = childrenByParent[item.id] || [];
                return (
                  <li key={item.id}>
                    <MenuRow
                      item={item}
                      number={idx + 1}
                      siblings={topLevel}
                      idx={idx}
                      onMove={move}
                      onEdit={handleEdit}
                      onDelete={handleAskDelete}
                    />

                    {children.length > 0 && (
                      <ul className="divide-y divide-border border-t border-border/60 bg-muted/20">
                        {children.map((child, cIdx) => (
                          <li key={child.id}>
                            <MenuRow
                              item={child}
                              number={`${idx + 1}.${cIdx + 1}`}
                              siblings={children}
                              idx={cIdx}
                              sub
                              onMove={move}
                              onEdit={handleEdit}
                              onDelete={handleAskDelete}
                            />
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="px-4 pb-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-muted-foreground"
                        onClick={() => handleAddChild(item.id)}
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add sub-link
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

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
