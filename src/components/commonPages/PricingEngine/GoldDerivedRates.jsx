"use client";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth-token";

const authHeaders = () => {
  const token =
    getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const norm = (s) => (s || "").toUpperCase().replace("KT", "K").trim();

// Live "what will gold actually price at" panel for the Metal Rates page:
// reads the latest active 24K gold row + the KT master factors and shows the
// derived per-gram price for every gold karat. Explicit rate rows override —
// those are flagged so stale manual rows are easy to spot and archive.
export default function GoldDerivedRates() {
  const [state, setState] = useState({ loading: true, base: null, rows: [] });

  useEffect(() => {
    (async () => {
      try {
        const [ratesRes, puritiesRes] = await Promise.all([
          fetch("/api/pricing-master/metal-rates", { headers: authHeaders() }),
          fetch("/api/catalog/masters?kind=metal_purity", { cache: "no-store" }),
        ]);
        const ratesJson = await ratesRes.json();
        const purities = await puritiesRes.json();
        const rates = (Array.isArray(ratesJson) ? ratesJson : ratesJson?.data || []).filter(
          (r) => r.status === "active"
        );
        const goldRates = rates.filter((r) => (r.metalType || "").toLowerCase() === "gold");
        const latest = (list) =>
          [...list].sort(
            (a, b) => new Date(b.effectiveDate || 0) - new Date(a.effectiveDate || 0)
          )[0];
        const base = latest(goldRates.filter((r) => norm(r.purity) === "24K"));
        const goldPurities = (Array.isArray(purities) ? purities : [])
          .filter(
            (p) =>
              (p.metadata?.applicableMetals || []).includes("GOLD") &&
              p.status === "active" &&
              norm(p.code) !== "24K"
          )
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        const basisRow = (Array.isArray(purities) ? purities : []).find(
          (p) => norm(p.code) === "24K"
        );
        const basis = Number(basisRow?.metadata?.pricingFactor) || 99.9;
        const basePerGram = base ? Number(base.rate) : null;

        const rows = goldPurities.map((p) => {
          const factor = Number(p.metadata?.pricingFactor);
          const override = latest(goldRates.filter((r) => norm(r.purity) === norm(p.code)));
          return {
            code: p.code,
            factor: Number.isFinite(factor) && factor > 0 ? factor : null,
            derived:
              basePerGram && Number.isFinite(factor) && factor > 0
                ? (basePerGram * factor) / basis
                : null,
            override: override ? Number(override.rate) : null,
          };
        });
        setState({ loading: false, base: basePerGram, rows });
      } catch {
        setState({ loading: false, base: null, rows: [] });
      }
    })();
  }, []);

  if (state.loading) return null;

  return (
    <div className="mb-5 rounded-lg border border-dashed border-warning/40 bg-warning/10 p-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div>
          <div className="text-xs font-semibold text-warning">
            Gold — auto-derived KT prices
          </div>
          <div className="text-[11px] text-warning/80">
            You only maintain the <b>24K row</b>; karats price at 24K × factor ÷ 99.9
            (factors live in Catalog → KT / Purity Master). An explicit row for a
            karat overrides its derived price.
          </div>
        </div>
        <div className="text-sm font-semibold text-warning">
          24K: {state.base != null ? `$${state.base.toFixed(2)}/g` : "— no 24K gold row yet"}
        </div>
      </div>
      {state.rows.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {state.rows.map((r) => (
            <div
              key={r.code}
              className="rounded-md border border-warning/30 bg-card px-3 py-1.5 text-xs"
            >
              <span className="font-semibold">{r.code}</span>{" "}
              {r.override != null ? (
                <span>
                  = ${r.override.toFixed(2)}/g{" "}
                  <span className="text-warning">(explicit row overrides{r.derived != null ? ` $${r.derived.toFixed(2)} derived` : ""})</span>
                </span>
              ) : r.derived != null ? (
                <span>
                  = ${r.derived.toFixed(2)}/g{" "}
                  <span className="text-muted-foreground">(×{r.factor} ÷ 99.9)</span>
                </span>
              ) : (
                <span className="text-destructive">no factor — set one in the KT master</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
