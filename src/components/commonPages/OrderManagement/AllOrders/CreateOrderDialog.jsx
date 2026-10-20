"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Package, Search, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/common/ui/button";
import DialogContent, {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/common/ui/dialog";
import { SafeImage } from "@/components/common/ui/safe-image";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Separator } from "@/components/common/ui/separator";
import { Textarea } from "@/components/common/ui/textarea";
import { useCrudApi } from "@/hooks/useCrudApi";

// "Create order" writes through POST /api/product-management/create-manual-order
// (upstream POST /api/v1/orders). That endpoint is product-driven, so the
// dialog starts with a product search and only then collects the order
// details. The payload shape mirrors the existing product-side manual order
// modal so both entry points hit the same contract.
const EMPTY_FORM = {
  metalColor: "",
  diamondType: "",
  carat_weight: "",
  metalPurity: "",
  size: "",
  quantity: "1",
  product_price: "",
  customerName: "",
  phone: "",
  email: "",
  notes: "",
};

export default function CreateOrderDialog({ open, onOpenChange, onCreated }) {
  const { fetchByPages } = useCrudApi("/api/product-management");
  const { create } = useCrudApi("/api/product-management/create-manual-order");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchRef = useRef(fetchByPages);
  useEffect(() => {
    fetchRef.current = fetchByPages;
  });

  // Product search — debounced so typing does not spam the catalogue API.
  useEffect(() => {
    if (!open) return undefined;

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setSearching(false);
      return undefined;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetchRef.current({
          page: 1,
          limit: 8,
          search: trimmed,
        });
        setResults(res?.data || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, open]);

  // Reset the form whenever the dialog is reopened.
  useEffect(() => {
    if (open) return;
    setQuery("");
    setResults([]);
    setProduct(null);
    setForm(EMPTY_FORM);
  }, [open]);

  const canSubmit = useMemo(
    () => Boolean(product?.id) && form.customerName.trim() !== "",
    [product, form.customerName]
  );

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await create({
        product_id: product.id,
        metal_color: form.metalColor,
        diamond_type: form.diamondType,
        carat_weight: form.carat_weight,
        metal_purity: form.metalPurity,
        size: form.size,
        quantity: Number(form.quantity) || 1,
        product_price: Number(form.product_price) || 0,
        customer_name: form.customerName,
        phone: form.phone,
        email: form.email,
        notes: form.notes,
      });

      toast.success("Order created");
      onCreated?.();
      onOpenChange?.(false);
    } catch (error) {
      toast.error(error?.message || "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  const update = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>Create order</DialogTitle>
          <DialogDescription>
            Pick a product, then add the customer and pricing details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Product picker */}
          <div className="space-y-2">
            <Label htmlFor="order-product-search">Product</Label>
            <div className="relative">
              <Search
                className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="order-product-search"
                placeholder="Search products by name or design number…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="ps-9 pe-9"
              />
              {query && (
                <Button
                  mode="icon"
                  variant="ghost"
                  size="sm"
                  className="absolute end-1 top-1/2 size-6 -translate-y-1/2"
                  onClick={() => setQuery("")}
                  aria-label="Clear product search"
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>

            {searching && (
              <p className="text-xs text-muted-foreground">Searching…</p>
            )}

            {!searching && query.trim() && results.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No products match “{query.trim()}”.
              </p>
            )}

            {results.length > 0 && (
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-border p-1">
                {results.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setProduct(item);
                      setResults([]);
                      setQuery("");
                    }}
                    className="flex w-full items-center gap-3 rounded-md p-2 text-start transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                      {item.product_image ? (
                        <SafeImage
                          src={item.product_image}
                          alt={item.title || "Product"}
                          className="size-full object-cover"
                        />
                      ) : (
                        <Package
                          className="size-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {item.title || item.productName}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.design_no || item.productCode || ""}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {product && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
                <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-card">
                  {product.product_image ? (
                    <SafeImage
                      src={product.product_image}
                      alt={product.title || "Product"}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Package
                      className="size-5 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {product.title || product.productName}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {product.design_no || product.productCode || ""}
                  </span>
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setProduct(null)}
                  aria-label="Remove selected product"
                >
                  <X className="size-4" />
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Order details */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="order-quantity">Quantity</Label>
              <Input
                id="order-quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => update("quantity", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order-price">Product price ($)</Label>
              <Input
                id="order-price"
                type="number"
                min="0"
                placeholder="0.00"
                value={form.product_price}
                onChange={(e) => update("product_price", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Metal colour</Label>
              <Select
                value={form.metalColor}
                onValueChange={(value) => update("metalColor", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select metal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="white-gold">18K White Gold</SelectItem>
                  <SelectItem value="yellow-gold">18K Yellow Gold</SelectItem>
                  <SelectItem value="rose-gold">18K Rose Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Metal purity</Label>
              <Select
                value={form.metalPurity}
                onValueChange={(value) => update("metalPurity", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select purity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="14k">14K</SelectItem>
                  <SelectItem value="18k">18K</SelectItem>
                  <SelectItem value="22k">22K</SelectItem>
                  <SelectItem value="platinum">Platinum 950</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Size</Label>
              <Input
                placeholder="e.g. 5"
                value={form.size}
                onChange={(e) => update("size", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Carat weight</Label>
              <Input
                placeholder="e.g. 0.5"
                value={form.carat_weight}
                onChange={(e) => update("carat_weight", e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">
              Customer information
            </h4>

            <div className="space-y-2">
              <Label htmlFor="order-customer">Customer name *</Label>
              <Input
                id="order-customer"
                value={form.customerName}
                onChange={(e) => update("customerName", e.target.value)}
                placeholder="Enter customer name"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="order-phone">Phone</Label>
                <Input
                  id="order-phone"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order-email">Email</Label>
                <Input
                  id="order-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="customer@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order-notes">Notes</Label>
              <Textarea
                id="order-notes"
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Add any special instructions or notes…"
                rows={3}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={!canSubmit || submitting}
            >
              {submitting ? "Creating…" : "Create order"}
            </Button>
          </div>

          {!canSubmit && (
            <p className="text-xs text-muted-foreground">
              Select a product and enter the customer name to continue.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
