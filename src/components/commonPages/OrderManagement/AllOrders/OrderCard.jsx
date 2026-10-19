"use client";

import React from "react";
import { CalendarDays, Eye, Package, User } from "lucide-react";

import { Badge, StatusBadge } from "@/components/common/ui/badge";
import { Button } from "@/components/common/ui/button";
import { Card, CardContent } from "@/components/common/ui/cards/card";
import { ShortId } from "@/components/common/ui/short-id";

const fmtMoney = (n) =>
  "$" +
  Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Stacked/card presentation of a single order. Used for tablet and mobile,
// where the wide table (order #, customer, quantity, value, date, channel,
// payment + order status, actions) cannot fit without horizontal scrolling.
export default function OrderCard({ order, onView }) {
  if (!order) return null;

  const orderNumber = order.orderNumber || order.order_number;

  return (
    <Card className="h-full overflow-hidden">
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {orderNumber ? (
                <span
                  className="truncate text-sm font-semibold text-foreground"
                  title={orderNumber}
                >
                  {orderNumber}
                </span>
              ) : (
                <ShortId value={order.id} length={10} label="Order ID" />
              )}
              {order.is_test && (
                <Badge variant="warning" appearance="light" size="sm">
                  Test
                </Badge>
              )}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {fmtDate(order.created_at)}
            </p>
          </div>

          <StatusBadge status={order.order_status} />
        </div>

        <dl className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm">
          <div className="min-w-0">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="size-3.5" aria-hidden="true" />
              Customer
            </dt>
            <dd
              className="mt-0.5 truncate text-foreground"
              title={order.customer_name || ""}
            >
              {order.customer_name || "—"}
            </dd>
          </div>

          <div className="min-w-0">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Package className="size-3.5" aria-hidden="true" />
              Quantity
            </dt>
            <dd className="mt-0.5 text-foreground">
              {order.total_quantity ?? 0}
            </dd>
          </div>

          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Total value</dt>
            <dd className="mt-0.5 font-semibold text-foreground">
              {Number.isFinite(Number(order.subtotal))
                ? fmtMoney(order.subtotal)
                : "—"}
            </dd>
          </div>

          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Payment</dt>
            <dd className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <StatusBadge status={order.payment_status || "Unknown"} size="sm" />
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
          <span className="truncate text-xs capitalize text-muted-foreground">
            {order.payment_method || "—"}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView?.(order)}
            aria-label={`View order ${orderNumber || order.id || ""}`}
          >
            <Eye className="size-4" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
