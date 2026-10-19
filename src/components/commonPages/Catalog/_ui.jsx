"use client";
// Shared layout + helpers for the Catalog admin pages (Masters / Families / BOM).
import { Input } from "@/components/common/ui/input";
import { Textarea } from "@/components/common/ui/textarea";
import { Button } from "@/components/common/ui/button";

export const authHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authTokenStoreAdmin") : null;
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const Section = ({ title, action, children }) => (
  <section className="mb-6 rounded-xl border border-border bg-card">
    <div className="flex items-center justify-between bg-muted/60 px-5 py-3 rounded-t-xl">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </section>
);

export const Grid = ({ children, cols = 3 }) => (
  <div
    className={`grid grid-cols-1 sm:grid-cols-2 ${
      cols === 4 ? "lg:grid-cols-4" : cols === 2 ? "" : "lg:grid-cols-3"
    } gap-3`}
  >
    {children}
  </div>
);

export const Field = ({ label, children, full, hint, htmlFor, error, errorId }) => (
  <div className={`flex flex-col gap-1 ${full ? "sm:col-span-full" : ""}`}>
    <label htmlFor={htmlFor} className="text-xs font-medium text-secondary-foreground">{label}</label>
    {children}
    {error ? (
      <span id={errorId} role="alert" className="text-[11px] text-destructive">{error}</span>
    ) : (
      hint && <span className="text-[11px] text-muted-foreground">{hint}</span>
    )}
  </div>
);

export const Select = ({ value, onChange, options, className, ...props }) => (
  <select
    value={value ?? ""}
    onChange={onChange}
    className={`border border-input rounded-md px-2.5 py-2 text-sm bg-white dark:bg-card aria-invalid:border-destructive/60 ${className || ""}`}
    {...props}
  >
    {options.map((o) =>
      typeof o === "string" ? (
        <option key={o} value={o}>
          {o}
        </option>
      ) : (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      )
    )}
  </select>
);

export { Input, Textarea, Button };
