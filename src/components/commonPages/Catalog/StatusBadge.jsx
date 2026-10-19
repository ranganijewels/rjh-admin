"use client";
// Shared status pill used across Catalog admin pages (Product Families / BOM Manager / Catalog Masters).
// Pass a custom `map` to override/extend the default status -> class lookup.

const DEFAULT_STATUS_MAP = {
  draft: "bg-gray-100 dark:bg-muted text-gray-700 dark:text-foreground",
  review: "bg-amber-100 text-amber-800",
  approved: "bg-blue-100 text-blue-800",
  published: "bg-emerald-100 text-emerald-800",
  archived: "bg-rose-100 text-rose-700",
  obsolete: "bg-rose-100 text-rose-700",
};

export default function StatusBadge({ status, map, className, capitalize }) {
  const statusMap = map || DEFAULT_STATUS_MAP;
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
        capitalize ? "capitalize " : ""
      }${statusMap[status] || "bg-gray-100 dark:bg-muted text-gray-700 dark:text-foreground"}${
        className ? ` ${className}` : ""
      }`}
    >
      {status || "—"}
    </span>
  );
}
