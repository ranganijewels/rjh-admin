"use client";

import React from "react";
import { Package } from "lucide-react";

import { SafeImage } from "@/components/common/ui/safe-image";
import { cn } from "@/lib/utils";

/**
 * The lines of an order.
 *
 * The product name arrives resolved (the storefront title is a template
 * like "{{karat}} {{metal_color}} Gold Round Diamond Elegant Ring" and the
 * line carries the variant the customer chose), so what is shown here is
 * the ring they actually bought.
 */
export function OrderLineItems({ items = [], className }) {
  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-10 text-center">
        <Package className="size-6 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">No items on this order</p>
        <p className="text-xs text-muted-foreground">
          The order was placed before line items were recorded.
        </p>
      </div>
    );
  }

  return (
    <ul className={cn("flex flex-col gap-2", className)}>
      {items.map((item, index) => {
        const quantity = item.quantity ?? 1;
        const specs = Array.isArray(item.specs) ? item.specs : [];

        return (
          <li
            key={`${item.product_title}-${index}`}
            className="flex items-start gap-3.5 rounded-xl border border-border bg-card p-3"
          >
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
              <SafeImage
                src={item?.product?.image}
                alt={item?.product?.title || item?.product_title || "Product image"}
                className="size-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {item?.product_title || item?.product?.title || "Item"}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
                {item?.product?.metal && (
                  <span className="font-medium text-foreground">
                    {item.product.metal}
                  </span>
                )}
                {item?.center_diamond_weight && (
                  <span>{item.center_diamond_weight}</span>
                )}
                {specs.map((spec) => (
                  <span key={spec}>{spec}</span>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {item?.label || item?.subtotal || "—"}
              </span>
              {quantity > 1 && (
                <span className="text-xs text-muted-foreground">
                  {quantity} ×{" "}
                  {item?.unit_price != null
                    ? `$${Number(item.unit_price).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : ""}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default OrderLineItems;
