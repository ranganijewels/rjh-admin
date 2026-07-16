"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { toast } from "sonner";
import { Calculator, Grid3x3 } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/common/ui/select";

const authHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authTokenStoreAdmin") : null;
  return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
};

const money = (v) => `$${Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const Row = ({ label, value, strong }) => (
  <div className={`flex justify-between py-2 border-b border-border/60 ${strong ? "font-semibold text-base" : "text-sm"}`}>
    <span className={strong ? "" : "text-muted-foreground"}>{label}</span>
    <span className="tabular-nums">{money(value)}</span>
  </div>
);

const MatchBadge = ({ matched }) =>
  matched ? (
    <span className="text-[11px] text-success">✓ matched</span>
  ) : (
    <span className="text-[11px] text-destructive">✗ no rate matched</span>
  );

// One numbered step in the calculation ledger — shows what went IN, the
// formula the engine applied, whether a master rate matched, and the $ OUT.
const Step = ({ n, title, children, amount, warn }) => (
  <div className="flex gap-3 py-3 border-b border-border/60 last:border-0">
    <div className="shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
      {n}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-baseline gap-2">
        <span className="text-sm font-medium">{title}</span>
        {amount !== undefined && (
          <span className={`tabular-nums text-sm font-semibold ${warn ? "text-destructive" : ""}`}>{money(amount)}</span>
        )}
      </div>
      <div className="text-xs text-muted-foreground mt-1 space-y-1">{children}</div>
    </div>
  </div>
);

// Small labeled dropdown — "Any" is always available for optional fields.
const Field = ({ label, value, onChange, options, optional, placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-muted-foreground">{label}</label>
    <Select value={value || "__any__"} onValueChange={(v) => onChange(v === "__any__" ? "" : v)}>
      <SelectTrigger className="h-9">
        <SelectValue placeholder={placeholder || `Select${optional ? " (any)" : ""}`} />
      </SelectTrigger>
      <SelectContent>
        {optional && <SelectItem value="__any__">Any</SelectItem>}
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  </div>
);

export default function PricePreview() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [productDetail, setProductDetail] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [catalogQualities, setCatalogQualities] = useState([]);

  // Variant selectors — populated from the selected product's own options.
  const [metalType, setMetalType] = useState("");
  const [metalPurity, setMetalPurity] = useState("");
  const [metalColor, setMetalColor] = useState("");
  const [centerCaratCt, setCenterCaratCt] = useState("");
  const [diamondQuality, setDiamondQuality] = useState("");
  const [diamondColor, setDiamondColor] = useState("");

  const [country, setCountry] = useState("");
  const [marginPercent, setMargin] = useState("");
  const [includeShipping, setIncludeShipping] = useState(false);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [matrix, setMatrix] = useState(null);
  const [matrixLoading, setMatrixLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/product-management?page=1&limit=100", { headers: authHeaders() });
        const json = await res.json();
        setProducts(json?.data || []);
      } catch {}
      try {
        const res = await fetch("/api/catalog/masters?kind=diamond_quality", { headers: authHeaders() });
        const json = await res.json();
        const rows = Array.isArray(json) ? json : json?.data || [];
        setCatalogQualities(rows.map((r) => r.code || r.name).filter(Boolean));
      } catch {}
    })();
  }, []);

  const metalOptions = productDetail?.metadata?.metalOptions || [];
  const weightMatrix = useMemo(
    () =>
      (productDetail?.metadata?.weightMatrix || [])
        .map((r) => Number(r.carat))
        .filter((n) => Number.isFinite(n) && n > 0)
        .sort((a, b) => a - b),
    [productDetail]
  );
  const hasCenterStone = weightMatrix.length > 0 || Number(productDetail?.centerStoneWeightCt) > 0;
  const activeMetal = metalOptions.find((m) => m.type === metalType) || metalOptions[0];
  const purityOptions = activeMetal?.purities || [];
  const colorOptions = activeMetal?.colors || [];

  // Load the selected product's own variant options + current values as defaults.
  useEffect(() => {
    if (!productId) {
      setProductDetail(null);
      setResult(null);
      setMatrix(null);
      return;
    }
    (async () => {
      setLoadingProduct(true);
      setResult(null);
      setMatrix(null);
      try {
        const res = await fetch(`/api/product-management/${productId}`, { headers: authHeaders() });
        const json = await res.json();
        const p = json?.data || null;
        setProductDetail(p);
        const opts = p?.metadata?.metalOptions || [];
        const firstType = opts.find((m) => m.type === p?.metal) || opts[0];
        setMetalType(firstType?.type || p?.metal || "");
        setMetalPurity(
          firstType?.purities?.includes(p?.metal_purity) ? p.metal_purity : firstType?.purities?.[0] || ""
        );
        setMetalColor(
          firstType?.colors?.includes(p?.metal_color) ? p.metal_color : firstType?.colors?.[0] || ""
        );
        const carats = (p?.metadata?.weightMatrix || []).map((r) => Number(r.carat)).filter((n) => n > 0);
        const centerCt = Number(p?.centerStoneWeightCt) || carats[0] || "";
        setCenterCaratCt(centerCt ? String(centerCt) : "");
        setDiamondQuality(p?.diamond_clarity || "");
        setDiamondColor(p?.diamond_color || "");
      } catch {
        toast.error("Failed to load product details");
      } finally {
        setLoadingProduct(false);
      }
    })();
  }, [productId]);

  // Re-anchor purity/color when the metal TYPE changes (their option lists differ per type).
  useEffect(() => {
    if (!activeMetal) return;
    if (!activeMetal.purities?.includes(metalPurity)) setMetalPurity(activeMetal.purities?.[0] || "");
    if (!activeMetal.colors?.includes(metalColor)) setMetalColor(activeMetal.colors?.[0] || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metalType]);

  const buildOverrides = (overrides = {}) => ({
    productId,
    metalType: metalType || undefined,
    metalPurity: metalPurity || undefined,
    metalColor: metalColor || undefined,
    centerCaratCt: centerCaratCt ? Number(centerCaratCt) : undefined,
    diamondQuality: diamondQuality || undefined,
    diamondColor: diamondColor || undefined,
    country: country || undefined,
    marginPercent: marginPercent ? Number(marginPercent) : undefined,
    includeShipping,
    ...overrides,
  });

  const run = async () => {
    if (!productId) { toast.error("Select a product"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/pricing-engine/preview", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(buildOverrides()),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      toast.error("Preview failed");
    } finally {
      setLoading(false);
    }
  };

  // Every metal-type/purity × every centre carat this product actually offers.
  const runAllVariants = async () => {
    if (!productId) { toast.error("Select a product"); return; }
    const purityRows = metalOptions.flatMap((m) => (m.purities || []).map((pur) => ({ type: m.type, purity: pur })));
    const carats = weightMatrix.length ? weightMatrix : [Number(centerCaratCt) || 0].filter(Boolean);
    if (!purityRows.length || !carats.length) {
      toast.error("This product has no metal options / carat matrix to enumerate");
      return;
    }
    setMatrixLoading(true);
    setMatrix(null);
    try {
      const cells = await Promise.all(
        purityRows.flatMap((pr) =>
          carats.map(async (ct) => {
            const res = await fetch("/api/pricing-engine/preview", {
              method: "POST",
              headers: authHeaders(),
              body: JSON.stringify(
                buildOverrides({ metalType: pr.type, metalPurity: pr.purity, centerCaratCt: ct })
              ),
            });
            const data = await res.json();
            return { type: pr.type, purity: pr.purity, carat: ct, data };
          })
        )
      );
      setMatrix({ carats, purityRows, cells });
    } catch {
      toast.error("Failed to compute variant matrix");
    } finally {
      setMatrixLoading(false);
    }
  };

  const cellFor = (type, purity, carat) =>
    matrix?.cells.find((c) => c.type === type && c.purity === purity && c.carat === carat)?.data;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Price Preview</h1>
        <p className="text-sm text-muted-foreground">
          Live price computed from master data — no values are stored on the product.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="price-preview-product" className="text-xs font-medium text-muted-foreground">Product</label>
        <select
          id="price-preview-product"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="flex h-9 w-full max-w-xl rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Select a product…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} {p.design_no ? `(${p.design_no})` : ""}
            </option>
          ))}
        </select>
      </div>

      {loadingProduct && <p className="text-sm text-muted-foreground">Loading product options…</p>}

      {productDetail && !loadingProduct && (
        <div className="border border-border rounded-lg p-4 space-y-4">
          <p className="text-xs font-medium text-muted-foreground">
            Variant — every combination this product actually offers
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <Field
              label="Metal Type"
              value={metalType}
              onChange={setMetalType}
              options={metalOptions.map((m) => m.type)}
            />
            <Field label="Metal Purity" value={metalPurity} onChange={setMetalPurity} options={purityOptions} />
            <Field label="Metal Color" value={metalColor} onChange={setMetalColor} options={colorOptions} />
            {hasCenterStone ? (
              weightMatrix.length ? (
                <Field
                  label="Center Diamond (ct)"
                  value={centerCaratCt}
                  onChange={setCenterCaratCt}
                  options={weightMatrix.map(String)}
                />
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Center Diamond (ct)</label>
                  <Input type="number" step="any" value={centerCaratCt} onChange={(e) => setCenterCaratCt(e.target.value)} />
                </div>
              )
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Center Diamond</label>
                <p className="text-sm text-muted-foreground pt-2">— no center stone —</p>
              </div>
            )}
            <Field
              label="Diamond Clarity/Quality"
              value={diamondQuality}
              onChange={setDiamondQuality}
              options={catalogQualities}
              optional
            />
          </div>
          {productDetail.shape && (
            <p className="text-xs text-muted-foreground">
              Diamond shape is fixed for this product: <span className="font-medium">{productDetail.shape.trim()}</span>
              {" "}— shape variants are separate sibling products (Design Group), not selectable here.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Diamond Color (optional)</label>
          <Input value={diamondColor} onChange={(e) => setDiamondColor(e.target.value)} placeholder="e.g. EF" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Country (tax)</label>
          <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g., US" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Margin %</label>
          <Input type="number" value={marginPercent} onChange={(e) => setMargin(e.target.value)} placeholder="0" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={includeShipping} onChange={(e) => setIncludeShipping(e.target.checked)} />
          Include shipping
        </label>
        <Button onClick={run} disabled={loading}>
          <Calculator className="h-4 w-4 mr-1" /> {loading ? "Calculating…" : "Calculate Price"}
        </Button>
        <Button variant="outline" onClick={runAllVariants} disabled={matrixLoading || !productDetail}>
          <Grid3x3 className="h-4 w-4 mr-1" /> {matrixLoading ? "Computing…" : "Compute All Variants"}
        </Button>
      </div>

      {result && (() => {
        const bd = result.priceBreakdown || {};
        const w = bd.weights || {};
        const m = bd.metal || {};
        const lines = bd.diamonds?.length ? bd.diamonds : (bd.diamond ? [{ ...bd.diamond, isCenter: true }] : []);
        const l = bd.labor || {};
        const addLines = bd.additionalCharges || [];
        const pb = bd.priceBook;
        const taxLines = bd.taxes || [];
        let step = 0;
        return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          {/* Quick-glance summary */}
          <div className="border border-border rounded-lg p-5 h-fit">
            <h3 className="font-semibold mb-2">Summary</h3>
            <Row label="Metal Value" value={result.metalValue} />
            <Row label="Diamond Value" value={result.diamondValue} />
            {result.gemstoneValue > 0 && <Row label="Gemstone Value" value={result.gemstoneValue} />}
            <Row label="Labor / Making" value={result.laborCharge} />
            <Row label="Additional Charges" value={result.additionalCharges} />
            {result.marginAmount > 0 && <Row label="Margin" value={result.marginAmount} />}
            {result.markupAmount > 0 && <Row label="Markup" value={result.markupAmount} />}
            {result.bookDiscount > 0 && <Row label="Price Book Discount" value={-result.bookDiscount} />}
            <Row label="Tax" value={result.taxAmount} />
            <Row label="Shipping" value={result.shippingAmount} />
            {result.discount > 0 && <Row label="Discount" value={-result.discount} />}
            {result.mrpApplied && (
              <Row label="Computed price (pre-MRP)" value={result.computedPrice} />
            )}
            <div className="mt-2">
              <Row label="Final Price" value={result.finalPrice} strong />
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {result.mrpApplied && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
                  MRP override applied
                </span>
              )}
              {result.labourOverridden && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
                  Labour rate overridden
                </span>
              )}
            </div>
            {result.warnings?.length > 0 && (
              <div className="text-destructive text-xs mt-3 space-y-0.5">
                {result.warnings.map((wn, i) => <div key={i}>⚠ {wn}</div>)}
              </div>
            )}
          </div>

          {/* Full step-by-step ledger — every input + formula the engine used */}
          <div className="border border-border rounded-lg p-5 lg:col-span-2">
            <h3 className="font-semibold mb-1">Full Breakdown</h3>
            <p className="text-xs text-muted-foreground mb-2">Computed in this order, exactly as the pricing engine applies it.</p>

            <Step n={++step} title="Metal weight" amount={undefined}>
              <div>
                Source: <span className="font-medium">{w.metalWeightSource || "—"}</span>
                {w.metalWeightLookup !== undefined && (
                  <> · global master lookup: {w.metalWeightLookup ? "used" : "not used"}</>
                )}
              </div>
              {w.baseMetalPurity && (
                <div>
                  Base weight at <span className="font-medium">{w.baseMetalPurity}</span>: {w.baseWeightG} g
                  {" "}× purity multiplier {w.purityWeightMultiplier} = <span className="font-medium">{w.netWeightG} g net</span>
                </div>
              )}
              {!w.baseMetalPurity && <div>Net weight: <span className="font-medium">{w.netWeightG} g</span></div>}
              <div>Gross weight (net + diamond grams): {w.grossWeightG} g ({w.diamondWeightInGrams} g from diamonds)</div>
            </Step>

            <Step n={++step} title="Metal value" amount={result.metalValue}>
              <div className="flex items-center gap-2">
                <span>{m.netWeightG} g × {money(m.ratePerGram)}/g</span>
                <MatchBadge matched={m.matched} />
              </div>
              {m.rateId && <div className="text-[11px]">rate id: {m.rateId}</div>}
            </Step>

            <Step n={++step} title="Diamond value" amount={result.diamondValue} warn={lines.some((x) => !x.matched) && lines.length > 0}>
              {lines.length ? lines.map((x, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span>
                    {x.shape?.trim() || "—"} {x.isCenter ? "(center)" : "(side)"} · {x.caratWeight} ct × {money(x.ratePerCarat)}/ct = {money(x.value)}
                  </span>
                  <MatchBadge matched={x.matched} />
                </div>
              )) : <div>No diamonds on this product.</div>}
            </Step>

            {result.gemstoneValue > 0 && (
              <Step n={++step} title="Gemstone value" amount={result.gemstoneValue}>
                <div>Not yet supported by the engine — always $0.</div>
              </Step>
            )}

            <Step n={++step} title="Labor / making charge" amount={result.laborCharge} warn={!l.matched && !result.labourOverridden}>
              {result.labourOverridden ? (
                <div>Product-level Labour Rate override applied (flat amount) — master rate ignored.</div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span>
                      Type: <span className="font-medium">{l.type || "—"}</span> · rate {l.rate}
                      {l.type === "percentage" ? "%" : l.type === "per_gram" ? "/g" : ""}
                    </span>
                    <MatchBadge matched={l.matched} />
                  </div>
                  {l.type === "per_gram" && <div>Applied on net weight: {l.appliedOnNetWeightG} g × {l.rate} = {money(l.value)}</div>}
                  {l.type === "percentage" && <div>Applied on metal + diamond value = {money(l.value)}</div>}
                  {l.type === "fixed" && <div>Flat amount = {money(l.value)}</div>}
                  {l.rateId && <div className="text-[11px]">rate id: {l.rateId}</div>}
                </>
              )}
            </Step>

            <Step n={++step} title="Additional charges" amount={result.additionalCharges}>
              {addLines.length ? addLines.map((c, i) => (
                <div key={i}>
                  {c.name} ({c.type}, {c.method}): {c.method === "percentage" ? `${c.value}%` : money(c.value)} → {money(c.amount)}
                </div>
              )) : <div>None configured.</div>}
            </Step>

            <Step
              n={++step}
              title="Margin / Markup / Price Book"
              amount={(result.marginAmount || 0) + (result.markupAmount || 0) - (result.bookDiscount || 0)}
            >
              {pb ? (
                <>
                  <div>Price book: <span className="font-medium">{pb.code}</span> ({pb.channel})</div>
                  <div>Margin: {result.marginAmount > 0 ? money(result.marginAmount) : "$0"} · Markup: {pb.markupPercent}% = {money(pb.markupValue)} · Discount: {pb.discountPercent}% = −{money(pb.discountValue)}</div>
                </>
              ) : (
                <div>No price book applied — standard retail pricing{result.marginAmount > 0 ? ` · Margin: ${money(result.marginAmount)}` : ""}.</div>
              )}
            </Step>

            <Step n={++step} title="Tax" amount={result.taxAmount}>
              {taxLines.length ? taxLines.map((t, i) => (
                <div key={i}>{t.name}: {t.value}{t.method === "percentage" ? "%" : ""} → {money(t.amount)}</div>
              )) : <div>No tax rate matched for this country/state — $0.</div>}
            </Step>

            {includeShipping && (
              <Step n={++step} title="Shipping" amount={result.shippingAmount}>
                <div>{bd.shipping?.rateId ? `Rate id: ${bd.shipping.rateId}` : "No shipping rate matched for this destination."}</div>
              </Step>
            )}

            {result.discount > 0 && (
              <Step n={++step} title="Discount" amount={-result.discount}>
                <div>Coupon / manual discount applied at checkout.</div>
              </Step>
            )}

            <Step n={++step} title="Final price" amount={result.finalPrice}>
              {result.mrpApplied ? (
                <div>Design MRP override (<span className="font-medium">{money(result.finalPrice)}</span>) wins over the computed price ({money(result.computedPrice)}).</div>
              ) : (
                <div>Sum of every step above.</div>
              )}
            </Step>
          </div>
        </div>
        );
      })()}

      {matrix && (
        <div className="border border-border rounded-lg p-4 overflow-x-auto">
          <h3 className="font-semibold mb-3">All Variants — {productDetail?.title}</h3>
          <table className="text-sm w-full">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="p-2 font-medium">Metal / Purity</th>
                {matrix.carats.map((ct) => (
                  <th key={ct} className="p-2 font-medium text-right">{ct} ct</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.purityRows.map((pr) => (
                <tr key={`${pr.type}-${pr.purity}`} className="border-b border-border/60">
                  <td className="p-2 font-medium whitespace-nowrap">{pr.type} {pr.purity}</td>
                  {matrix.carats.map((ct) => {
                    const d = cellFor(pr.type, pr.purity, ct);
                    const hasWarn = d?.warnings?.length > 0;
                    return (
                      <td key={ct} className={`p-2 text-right tabular-nums ${hasWarn ? "text-destructive" : ""}`}>
                        {d ? `$${Number(d.finalPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"}
                        {hasWarn && <span title={d.warnings.join(", ")}> ⚠</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
