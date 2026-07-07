"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/common/ui/button";
import { Input } from "@/components/common/ui/input";
import { toast } from "sonner";
import { Calculator } from "lucide-react";

const authHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authTokenStoreAdmin") : null;
  return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
};

const Row = ({ label, value, strong }) => (
  <div className={`flex justify-between py-2 border-b border-border/60 ${strong ? "font-semibold text-base" : "text-sm"}`}>
    <span className={strong ? "" : "text-muted-foreground"}>{label}</span>
    <span className="tabular-nums">${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
  </div>
);

export default function PricePreview() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [country, setCountry] = useState("");
  const [marginPercent, setMargin] = useState("");
  const [includeShipping, setIncludeShipping] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/product-management?page=1&limit=100", { headers: authHeaders() });
        const json = await res.json();
        setProducts(json?.data || []);
      } catch {}
    })();
  }, []);

  const run = async () => {
    if (!productId) { toast.error("Select a product"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/pricing-engine/preview", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          productId,
          country: country || undefined,
          marginPercent: marginPercent ? Number(marginPercent) : undefined,
          includeShipping,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      toast.error("Preview failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Price Preview</h1>
        <p className="text-sm text-muted-foreground">
          Live price computed from master data — no values are stored on the product.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="price-preview-product" className="text-xs font-medium text-muted-foreground">Product</label>
          <select
            id="price-preview-product"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Select a product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} {p.design_no ? `(${p.design_no})` : ""}
              </option>
            ))}
          </select>
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
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={includeShipping} onChange={(e) => setIncludeShipping(e.target.checked)} />
          Include shipping
        </label>
        <Button onClick={run} disabled={loading}>
          <Calculator className="h-4 w-4 mr-1" /> {loading ? "Calculating…" : "Calculate Price"}
        </Button>
      </div>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          <div className="border border-border rounded-lg p-5">
            <h3 className="font-semibold mb-2">Price Breakdown</h3>
            <Row label="Metal Value" value={result.metalValue} />
            <Row label="Diamond Value" value={result.diamondValue} />
            {result.gemstoneValue > 0 && <Row label="Gemstone Value" value={result.gemstoneValue} />}
            <Row label="Labor / Making" value={result.laborCharge} />
            <Row label="Additional Charges" value={result.additionalCharges} />
            {result.marginAmount > 0 && <Row label="Margin" value={result.marginAmount} />}
            <Row label="Tax" value={result.taxAmount} />
            <Row label="Shipping" value={result.shippingAmount} />
            {result.discount > 0 && <Row label="Discount" value={-result.discount} />}
            <div className="mt-2">
              <Row label="Final Price" value={result.finalPrice} strong />
            </div>
          </div>

          <div className="border border-border rounded-lg p-5 text-sm space-y-3">
            <h3 className="font-semibold">Rate Resolution</h3>
            {result.priceBreakdown?.metal && (
              <div>
                <div className="font-medium">Metal</div>
                <div className="text-muted-foreground">
                  {result.priceBreakdown.metal.weightG} g × ${result.priceBreakdown.metal.ratePerGram}/g
                  {!result.priceBreakdown.metal.matched && <span className="text-destructive"> — no rate matched</span>}
                </div>
              </div>
            )}
            {result.priceBreakdown?.diamond && (
              <div>
                <div className="font-medium">Diamond</div>
                <div className="text-muted-foreground">
                  {result.priceBreakdown.diamond.caratWeight} ct × ${result.priceBreakdown.diamond.ratePerCarat}/ct
                  {!result.priceBreakdown.diamond.matched && result.priceBreakdown.diamond.caratWeight > 0 && <span className="text-destructive"> — no rate matched</span>}
                </div>
              </div>
            )}
            {result.priceBreakdown?.labor && (
              <div>
                <div className="font-medium">Labor</div>
                <div className="text-muted-foreground">
                  {result.priceBreakdown.labor.type || "—"} @ {result.priceBreakdown.labor.rate}
                </div>
              </div>
            )}
            {result.priceBreakdown?.taxes?.length > 0 && (
              <div>
                <div className="font-medium">Taxes</div>
                {result.priceBreakdown.taxes.map((t, i) => (
                  <div key={i} className="text-muted-foreground">{t.name}: {t.value}{t.method === "percentage" ? "%" : ""} → ${t.amount}</div>
                ))}
              </div>
            )}
            {result.warnings?.length > 0 && (
              <div className="text-destructive text-xs">⚠ {result.warnings.join(", ")}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
