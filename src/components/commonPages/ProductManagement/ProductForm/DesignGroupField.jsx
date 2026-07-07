"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/common/ui/input";

const authHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authTokenStoreAdmin") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Design Group picker: links separate per-shape products into one "design".
// Autocompletes from existing groups so codes stay consistent, and shows what
// shapes already exist in the chosen group.
export default function DesignGroupField({ value, onChange, currentShape, currentId }) {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/product-management/design-groups", {
          headers: authHeaders(),
        });
        const json = await res.json();
        setGroups(json?.data || []);
      } catch {
        /* optional */
      }
    })();
  }, []);

  const match = groups.find(
    (g) => (g.group || "").toLowerCase() === (value || "").toLowerCase()
  );
  // shapes already used in this group by OTHER products
  const usedShapes = (match?.products || [])
    .filter((p) => p.id !== currentId)
    .map((p) => p.diamondShape)
    .filter(Boolean);
  const shapeClash =
    currentShape && usedShapes.some((s) => s?.toLowerCase() === currentShape.toLowerCase());

  return (
    <div className="space-y-1">
      <Input
        list="design-group-list"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. AURORA-SOLITAIRE"
      />
      <datalist id="design-group-list">
        {groups.map((g) => (
          <option key={g.group} value={g.group} />
        ))}
      </datalist>
      {value ? (
        match ? (
          <p className="text-[11px] text-muted-foreground">
            Joins <b>{match.count}</b> product(s) · shapes:{" "}
            {usedShapes.length ? usedShapes.join(", ") : "—"}
            {shapeClash && (
              <span className="text-amber-600">
                {" "}
                · ⚠ {currentShape} already exists in this group
              </span>
            )}
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground">
            New group — this product starts it. Add more products with the same
            code and a different diamond shape.
          </p>
        )
      ) : (
        <p className="text-[11px] text-muted-foreground">
          Optional. Give every shape of the same design the same code to link
          them on the product page.
        </p>
      )}
    </div>
  );
}
