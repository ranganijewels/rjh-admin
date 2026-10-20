"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Page, PageHeader } from "@/components/common/ui/page";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import { Checkbox } from "@/components/common/ui/checkbox";
import { Badge } from "@/components/common/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/cards/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/ui/table";
import { toast } from "sonner";
import { Calculator, Grid3x3 } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/common/ui/select";
import { getAuthToken } from "@/lib/auth-token";

const authHeaders = () => {
  const token = getAuthToken();
  return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
};

// Sentinel value for "nothing selected" — a Select item always needs a real,
// non-empty value.
const NONE = "__none__";
const ANY = "__any__";

const money = (v) => `$${Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const Row = ({ label, value, strong }) => (
  <div className={`flex justify-between border-b border-border/60 py-2 ${strong ? "text-base font-semibold" : "text-sm"}`}>
    <span className={strong ? "" : "text-muted-foreground"}>{label}</span>
    <span className="tabular-nums">{money(value)}</span>
  </div>
);

const MatchBadge = ({ matched }) =>
  matched ? (
    <Badge variant="success" appearance="light" size="sm">
      ✓ matched
    </Badge>
  ) : (
    <Badge variant="destructive" appearance="light" size="sm">
      ✗ no rate matched
    </Badge>
  );

// One numbered step in the calculation ledger — shows what went IN, the
// formula the engine applied, whether a master rate matched, and the $ OUT.
const Step = ({ n, title, children, amount, warn }) => (
  <div className="flex gap-3 border-b border-border/60 py-3 last:border-0">
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
      {n}
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{title}</span>
        {amount !== undefined && (
          <span className={`tabular-nums text-sm font-semibold ${warn ? "text-destructive" : ""}`}>{money(amount)}</span>
        )}
      </div>
      <div className="mt-1 space-y-1 text-xs text-muted-foreground">{children}</div>
    </div>
  </div>
);

// Small labeled dropdown — "Any" is always available for optional fields.
const Field = ({ label, value, onChange, options, optional, placeholder, id }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
    <Select value={value || ANY} onValueChange={(v) => onChange(v === ANY ? "" : v)}>
      <SelectTrigger id={id} size="sm" className="h-9">
        <SelectValue placeholder={placeholder || `Select${optional ? " (any)" : ""}`} />
      </SelectTrigger>
      <SelectContent>
        {optional && <SelectItem value={ANY}>Any</SelectItem>}
        {options.map((o) => <SelectItem key={o} value={String(o)}>{o}</SelectItem>)}
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
    <Page>
      <PageHeader
        title="Price Preview"
        description="Live price computed from master data — no values are stored on the product."
        actions={
          <>
            <Button variant="outline" size="md" onClick={runAllVariants} disabled={matrixLoading || !productDetail}>
              <Grid3x3 className="size-4" /> {matrixLoading ? "Computing…" : "Compute All Variants"}
            </Button>
            <Button variant="primary" size="md" onClick={run} disabled={loading}>
              <Calculator className="size-4" /> {loading ? "Calculating…" : "Calculate Price"}
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-foreground">Product</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Pick the product whose price you want to preview.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <Label htmlFor="price-preview-product" className="text-xs text-muted-foreground">Product</Label>
          <Select
            value={productId || NONE}
            onValueChange={(v) => setProductId(v === NONE ? "" : v)}
          >
            <SelectTrigger id="price-preview-product" className="w-full max-w-xl">
              <SelectValue placeholder="Select a product…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Select a product…</SelectItem>
              {products.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.title} {p.design_no ? `(${p.design_no})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {loadingProduct && (
            <p className="text-xs text-muted-foreground">Loading product options…</p>
          )}
        </CardContent>
      </Card>

      {productDetail && !loadingProduct && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">Variant</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Every combination this product actually offers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-5">
              <Field
                id="preview-metal-type"
                label="Metal Type"
                value={metalType}
                onChange={setMetalType}
                options={metalOptions.map((m) => m.type)}
              />
              <Field
                id="preview-metal-purity"
                label="Metal Purity"
                value={metalPurity}
                onChange={setMetalPurity}
                options={purityOptions}
              />
              <Field
                id="preview-metal-color"
                label="Metal Color"
                value={metalColor}
                onChange={setMetalColor}
                options={colorOptions}
              />
              {hasCenterStone ? (
                weightMatrix.length ? (
                  <Field
                    id="preview-center-carat"
                    label="Center Diamond (ct)"
                    value={centerCaratCt}
                    onChange={setCenterCaratCt}
                    options={weightMatrix.map(String)}
                  />
                ) : (
                  <div className="space-y-1.5">
                    <Label htmlFor="preview-center-carat" className="text-xs text-muted-foreground">Center Diamond (ct)</Label>
                    <Input
                      id="preview-center-carat"
                      type="number"
                      step="any"
                      value={centerCaratCt}
                      onChange={(e) => setCenterCaratCt(e.target.value)}
                    />
                  </div>
                )
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Center Diamond</Label>
                  <p className="pt-2 text-sm text-muted-foreground">— no center stone —</p>
                </div>
              )}
              <Field
                id="preview-diamond-quality"
                label="Diamond Clarity/Quality"
                value={diamondQuality}
                onChange={setDiamondQuality}
                options={catalogQualities}
                optional
              />
            </div>
            {productDetail.shape && (
              <p className="text-xs text-muted-foreground">
                Diamond shape is fixed for this product: <span className="font-medium text-foreground">{productDetail.shape.trim()}</span>
                {" "}— shape variants are separate sibling products (Design Group), not selectable here.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-foreground">Overrides</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Optional adjustments applied on top of the master rates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="preview-diamond-color" className="text-xs text-muted-foreground">Diamond Color (optional)</Label>
              <Input
                id="preview-diamond-color"
                value={diamondColor}
                onChange={(e) => setDiamondColor(e.target.value)}
                placeholder="e.g. EF"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="preview-country" className="text-xs text-muted-foreground">Country (tax)</Label>
              <Input
                id="preview-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g., US"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="preview-margin" className="text-xs text-muted-foreground">Margin %</Label>
              <Input
                id="preview-margin"
                type="number"
                value={marginPercent}
                onChange={(e) => setMargin(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="flex items-center gap-2 pb-2">
              <Checkbox
                id="preview-include-shipping"
                checked={includeShipping}
                onCheckedChange={(checked) => setIncludeShipping(!!checked)}
              />
              <Label htmlFor="preview-include-shipping" className="text-sm font-normal">
                Include shipping
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

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
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
            {/* Quick-glance summary */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground">Summary</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  What the customer would pay.
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {result.mrpApplied && (
                    <Badge variant="warning" appearance="light" size="sm">
                      MRP override applied
                    </Badge>
                  )}
                  {result.labourOverridden && (
                    <Badge variant="warning" appearance="light" size="sm">
                      Labour rate overridden
                    </Badge>
                  )}
                </div>
                {result.warnings?.length > 0 && (
                  <div className="mt-3 space-y-0.5 text-xs text-destructive">
                    {result.warnings.map((wn, i) => <div key={i}>⚠ {wn}</div>)}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Full step-by-step ledger — every input + formula the engine used */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground">Full Breakdown</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Computed in this order, exactly as the pricing engine applies it.
                </CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {matrix && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-foreground">
              All Variants — {productDetail?.title}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Computed final price for every metal / purity / carat combination.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metal / Purity</TableHead>
                  {matrix.carats.map((ct) => (
                    <TableHead key={ct} className="text-right">{ct} ct</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {matrix.purityRows.map((pr) => (
                  <TableRow key={`${pr.type}-${pr.purity}`}>
                    <TableCell className="whitespace-nowrap font-medium text-foreground">
                      {pr.type} {pr.purity}
                    </TableCell>
                    {matrix.carats.map((ct) => {
                      const d = cellFor(pr.type, pr.purity, ct);
                      const hasWarn = d?.warnings?.length > 0;
                      return (
                        <TableCell
                          key={ct}
                          className={`text-right tabular-nums ${hasWarn ? "text-destructive" : "text-foreground"}`}
                        >
                          {d ? `$${Number(d.finalPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"}
                          {hasWarn && <span title={d.warnings.join(", ")}> ⚠</span>}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </Page>
  );
}
