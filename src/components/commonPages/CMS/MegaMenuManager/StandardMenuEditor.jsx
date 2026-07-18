"use client";
import React from "react";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import MediaField from "@/components/common/ui/MediaField";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { makeListHelpers } from "./listHelpers";

// Editor for one of the 4 "standard" mega-menus (Engagement/Wedding/Jewelry/
// About Us): a repeatable list of Columns (title + repeatable {label,link}
// items) plus one CTA image/title/description/button panel.
const StandardMenuEditor = ({ content, onChange }) => {
  const columns = Array.isArray(content.columns) ? content.columns : [];
  const imageSection = content.imageSection || { imageUrl: "", title: "", description: "", ctaText: "", ctaUrl: "" };

  const colList = makeListHelpers(columns, (next) => onChange({ ...content, columns: next }), () => ({
    title: "",
    items: [],
  }));

  const setImageSection = (patch) => onChange({ ...content, imageSection: { ...imageSection, ...patch } });

  return (
    <div className="space-y-4">
      <div className="border border-border rounded-lg p-4">
        <h3 className="font-medium text-sm mb-3">Columns</h3>
        <div className="space-y-4">
          {columns.map((col, colIdx) => {
            const items = Array.isArray(col.items) ? col.items : [];
            const itemList = makeListHelpers(items, (next) => colList.update(colIdx, { items: next }), () => ({
              label: "",
              link: "",
            }));
            return (
              <div key={colIdx} className="border border-border rounded-lg p-3 bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    value={col.title || ""}
                    onChange={(e) => colList.update(colIdx, { title: e.target.value })}
                    placeholder="Column title (e.g. SHOP BY STYLE)"
                    className="flex-1"
                  />
                  <Button variant="outline" mode="icon" size="sm" onClick={() => colList.move(colIdx, -1)} disabled={colIdx === 0}>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    mode="icon"
                    size="sm"
                    onClick={() => colList.move(colIdx, 1)}
                    disabled={colIdx === columns.length - 1}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" mode="icon" size="sm" onClick={() => colList.remove(colIdx)}>
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex items-center gap-2">
                      <Input
                        value={item.label || ""}
                        onChange={(e) => itemList.update(itemIdx, { label: e.target.value })}
                        placeholder="Label (e.g. Solitaire)"
                        className="flex-1"
                      />
                      <Input
                        value={item.link || ""}
                        onChange={(e) => itemList.update(itemIdx, { link: e.target.value })}
                        placeholder="/product?subcat=Solitaire"
                        className="flex-1"
                      />
                      <Button variant="outline" mode="icon" size="sm" onClick={() => itemList.move(itemIdx, -1)} disabled={itemIdx === 0}>
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        mode="icon"
                        size="sm"
                        onClick={() => itemList.move(itemIdx, 1)}
                        disabled={itemIdx === items.length - 1}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" mode="icon" size="sm" onClick={() => itemList.remove(itemIdx)}>
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={itemList.add}>
                    <Plus className="h-3.5 w-3.5" /> Add link
                  </Button>
                </div>
              </div>
            );
          })}
          <Button variant="outline" className="gap-1.5" onClick={colList.add}>
            <Plus className="h-4 w-4" /> Add column
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-lg p-4">
        <h3 className="font-medium text-sm mb-3">CTA Panel (right-side image + button)</h3>
        <div className="space-y-3 max-w-md">
          <MediaField label="Image" value={imageSection.imageUrl} onChange={(url) => setImageSection({ imageUrl: url })} prefix="mega-menu" />
          <div>
            <label className="text-xs font-medium text-muted-foreground">Title</label>
            <Input value={imageSection.title || ""} onChange={(e) => setImageSection({ title: e.target.value })} placeholder="Not Sure Where to Start?" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Input
              value={imageSection.description || ""}
              onChange={(e) => setImageSection({ description: e.target.value })}
              placeholder="Short supporting copy"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Button text</label>
              <Input
                value={imageSection.ctaText || ""}
                onChange={(e) => setImageSection({ ctaText: e.target.value })}
                placeholder="BOOK A VIRTUAL APPOINTMENT"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Button link</label>
              <Input value={imageSection.ctaUrl || ""} onChange={(e) => setImageSection({ ctaUrl: e.target.value })} placeholder="#book-appointment" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandardMenuEditor;
