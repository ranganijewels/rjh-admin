"use client";

import React from "react";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
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
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Media Tiles</h3>
          <p className="text-xs text-muted-foreground">
            {tiles.length} {tiles.length === 1 ? "tile" : "tiles"} in this menu
          </p>
        </div>
      </div>

      {tiles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No tiles yet — add the first one to get started.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((tile, idx) => (
            <li
              key={idx}
              className="rounded-xl border border-border bg-card p-3"
            >
              <MediaField
                value={tile.image || ""}
                onChange={(url) => list.update(idx, { image: url })}
                prefix="mega-menu/customize"
                aspectClassName="aspect-square"
              />
              <div className="mt-2 space-y-1.5">
                <Label htmlFor={`tile-label-${idx}`} className="sr-only">
                  Tile {idx + 1} label
                </Label>
                <Input
                  id={`tile-label-${idx}`}
                  value={tile.label || ""}
                  onChange={(e) => list.update(idx, { label: e.target.value })}
                  placeholder="Label (e.g. Engagement Rings)"
                />
                <Label htmlFor={`tile-link-${idx}`} className="sr-only">
                  Tile {idx + 1} link
                </Label>
                <Input
                  id={`tile-link-${idx}`}
                  className="text-xs"
                  value={tile.link || ""}
                  onChange={(e) => list.update(idx, { link: e.target.value })}
                  placeholder="/customize?category=ring"
                />
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  mode="icon"
                  size="sm"
                  aria-label={`Move tile ${idx + 1} up`}
                  title="Move up"
                  onClick={() => list.move(idx, -1)}
                  disabled={idx === 0}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  mode="icon"
                  size="sm"
                  aria-label={`Move tile ${idx + 1} down`}
                  title="Move down"
                  onClick={() => list.move(idx, 1)}
                  disabled={idx === tiles.length - 1}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  mode="icon"
                  size="sm"
                  aria-label={`Delete tile ${idx + 1}`}
                  title="Delete tile"
                  onClick={() => list.remove(idx)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Button variant="outline" className="mt-4 gap-1.5" onClick={list.add}>
        <Plus className="h-4 w-4" /> Add tile
      </Button>
    </div>
  );
};

export default CustomizeMenuEditor;
