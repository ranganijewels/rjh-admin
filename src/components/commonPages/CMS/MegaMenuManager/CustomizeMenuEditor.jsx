"use client";
import React from "react";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import MediaField from "@/components/common/ui/MediaField";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { makeListHelpers } from "./listHelpers";

// Editor for the Customize menu's distinct layout: a grid of image tiles
// (no columns, no CTA panel) — matches what's live today.
const CustomizeMenuEditor = ({ content, onChange }) => {
  const tiles = Array.isArray(content.mediaTiles) ? content.mediaTiles : [];
  const list = makeListHelpers(tiles, (next) => onChange({ ...content, mediaTiles: next }), () => ({
    label: "",
    image: "",
    link: "",
  }));

  return (
    <div className="border border-border rounded-lg p-4">
      <h3 className="font-medium text-sm mb-3">Media Tiles</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map((tile, idx) => (
          <div key={idx} className="border border-border rounded-lg p-3 bg-muted/20">
            <MediaField
              value={tile.image || ""}
              onChange={(url) => list.update(idx, { image: url })}
              prefix="mega-menu/customize"
              aspectClassName="aspect-square"
            />
            <Input
              className="mt-2"
              value={tile.label || ""}
              onChange={(e) => list.update(idx, { label: e.target.value })}
              placeholder="Label (e.g. Engagement Rings)"
            />
            <Input
              className="mt-2 text-xs"
              value={tile.link || ""}
              onChange={(e) => list.update(idx, { link: e.target.value })}
              placeholder="/customize?category=ring"
            />
            <div className="flex items-center gap-1.5 mt-2">
              <Button variant="outline" mode="icon" size="sm" onClick={() => list.move(idx, -1)} disabled={idx === 0}>
                <ChevronUp className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" mode="icon" size="sm" onClick={() => list.move(idx, 1)} disabled={idx === tiles.length - 1}>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" mode="icon" size="sm" onClick={() => list.remove(idx)}>
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button variant="outline" className="gap-1.5 mt-4" onClick={list.add}>
        <Plus className="h-4 w-4" /> Add tile
      </Button>
    </div>
  );
};

export default CustomizeMenuEditor;
