"use client";

import React from "react";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import MediaField from "@/components/common/ui/MediaField";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from "lucide-react";
import { makeListHelpers } from "./listHelpers";

// Editor for one of the 4 "standard" mega-menus (Engagement/Wedding/Jewelry/
// About Us): a repeatable list of Columns (title + repeatable {label,link}
// items) plus one CTA image/title/description/button panel.
const StandardMenuEditor = ({ content, onChange }) => {
  const columns = Array.isArray(content.columns) ? content.columns : [];
  const imageSection = content.imageSection || { imageUrl: "", title: "", description: "", ctaText: "", ctaUrl: "" };

  const colList = makeListHelpers(columns, (next) => onChange({ ...content, columns: next }), () => ({
    title: "",
    link: "",
    items: [],
  }));

  const setImageSection = (patch) => onChange({ ...content, imageSection: { ...imageSection, ...patch } });

  return (
    <div className="space-y-5">
      {/* Columns */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Columns</h3>
            <p className="text-xs text-muted-foreground">
              {columns.length} {columns.length === 1 ? "column" : "columns"} in this menu
            </p>
          </div>
        </div>

        {columns.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-4 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No columns yet — add the first one to get started.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {columns.map((col, colIdx) => {
              const items = Array.isArray(col.items) ? col.items : [];
              const itemList = makeListHelpers(items, (next) => colList.update(colIdx, { items: next }), () => ({
                label: "",
                link: "",
              }));
              return (
                <li
                  key={colIdx}
                  className="rounded-xl border border-border bg-card"
                >
                  {/* Column header row */}
                  <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
                    <GripVertical
                      className="size-4 shrink-0 text-muted-foreground/60"
                      aria-hidden="true"
                    />
                    <span
                      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-foreground"
                      aria-hidden="true"
                    >
                      {colIdx + 1}
                    </span>
                    <Input
                      value={col.title || ""}
                      onChange={(e) => colList.update(colIdx, { title: e.target.value })}
                      placeholder="Column title (e.g. Shop by Style)"
                      aria-label={`Column ${colIdx + 1} title`}
                      className="min-w-[160px] flex-1"
                    />
                    <Input
                      value={col.link || ""}
                      onChange={(e) => colList.update(colIdx, { link: e.target.value })}
                      placeholder="Title link (optional)"
                      aria-label={`Column ${colIdx + 1} link`}
                      className="min-w-[160px] flex-1"
                    />
                    <div className="ms-auto flex items-center gap-1">
                      <Button
                        variant="ghost"
                        mode="icon"
                        size="sm"
                        aria-label={`Move column ${colIdx + 1} up`}
                        title="Move up"
                        onClick={() => colList.move(colIdx, -1)}
                        disabled={colIdx === 0}
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        mode="icon"
                        size="sm"
                        aria-label={`Move column ${colIdx + 1} down`}
                        title="Move down"
                        onClick={() => colList.move(colIdx, 1)}
                        disabled={colIdx === columns.length - 1}
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        mode="icon"
                        size="sm"
                        aria-label={`Delete column ${colIdx + 1}`}
                        title="Delete column"
                        onClick={() => colList.remove(colIdx)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="px-4 py-3">
                    {items.length === 0 ? (
                      <p className="py-2 text-xs text-muted-foreground">
                        No links in this column yet.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {items.map((item, itemIdx) => (
                          <li
                            key={itemIdx}
                            className="flex flex-wrap items-center gap-2"
                          >
                            <Input
                              value={item.label || ""}
                              onChange={(e) => itemList.update(itemIdx, { label: e.target.value })}
                              placeholder="Label (e.g. Solitaire)"
                              aria-label={`Column ${colIdx + 1} link ${itemIdx + 1} label`}
                              className="min-w-[140px] flex-1"
                            />
                            <Input
                              value={item.link || ""}
                              onChange={(e) => itemList.update(itemIdx, { link: e.target.value })}
                              placeholder="/product?subcat=Solitaire"
                              aria-label={`Column ${colIdx + 1} link ${itemIdx + 1} URL`}
                              className="min-w-[140px] flex-1"
                            />
                            <div className="ms-auto flex items-center gap-1">
                              <Button
                                variant="ghost"
                                mode="icon"
                                size="sm"
                                aria-label={`Move link ${itemIdx + 1} up`}
                                title="Move up"
                                onClick={() => itemList.move(itemIdx, -1)}
                                disabled={itemIdx === 0}
                              >
                                <ChevronUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                mode="icon"
                                size="sm"
                                aria-label={`Move link ${itemIdx + 1} down`}
                                title="Move down"
                                onClick={() => itemList.move(itemIdx, 1)}
                                disabled={itemIdx === items.length - 1}
                              >
                                <ChevronDown className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                mode="icon"
                                size="sm"
                                aria-label={`Delete link ${itemIdx + 1}`}
                                title="Delete link"
                                onClick={() => itemList.remove(itemIdx)}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 gap-1.5 text-muted-foreground"
                      onClick={itemList.add}
                    >
                      <Plus className="h-3.5 w-3.5" /> Add link
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <Button variant="outline" className="mt-3 gap-1.5" onClick={colList.add}>
          <Plus className="h-4 w-4" /> Add column
        </Button>
      </div>

      {/* CTA panel */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">
          CTA Panel (right-side image + button)
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          The promotional block shown on the right of this dropdown.
        </p>

        <div className="mt-4 max-w-md space-y-3">
          <MediaField
            label="Image"
            value={imageSection.imageUrl}
            onChange={(url) => setImageSection({ imageUrl: url })}
            prefix="mega-menu"
          />
          <div className="space-y-1.5">
            <Label htmlFor="mega-cta-title">Title</Label>
            <Input
              id="mega-cta-title"
              value={imageSection.title || ""}
              onChange={(e) => setImageSection({ title: e.target.value })}
              placeholder="Not Sure Where to Start?"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mega-cta-description">Description</Label>
            <Input
              id="mega-cta-description"
              value={imageSection.description || ""}
              onChange={(e) => setImageSection({ description: e.target.value })}
              placeholder="Short supporting copy"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="mega-cta-text">Button text</Label>
              <Input
                id="mega-cta-text"
                value={imageSection.ctaText || ""}
                onChange={(e) => setImageSection({ ctaText: e.target.value })}
                placeholder="BOOK A VIRTUAL APPOINTMENT"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mega-cta-url">Button link</Label>
              <Input
                id="mega-cta-url"
                value={imageSection.ctaUrl || ""}
                onChange={(e) => setImageSection({ ctaUrl: e.target.value })}
                placeholder="#book-appointment"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandardMenuEditor;
