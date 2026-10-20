"use client";
import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/common/ui/sheet";
import { ScrollArea } from "@/components/common/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/common/ui/cards/card";
import { TwoColCard } from "@/components/common/ui/cards/TwoColCard";
import { Button } from "@/components/common/ui/button";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { Badge, BadgeDot } from "@/components/common/ui/badge";
import { Download, Truck, Check } from "lucide-react";
import { cn, formatDateShort } from "@/lib/utils";

// Fulfillment pipeline — the operational lifecycle of a luxury order.
const FULFILLMENT_STAGES = [
  "Order Placed",
  "Confirmed",
  "In Production",
  "Picking",
  "Packing",
  "Shipped",
  "Delivered",
];

const ViewOrders = ({ open, onClose, orderId, orders }) => {
  const [invoiceBusy, setInvoiceBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [tracking, setTracking] = useState("");
  const [courier, setCourier] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    if (orders) {
      setStatus(orders.order_status || orders.orderStatus || "Order Placed");
      setTracking(orders.trackingNumber || orders.tracking_number || "");
      setCourier(orders.courierName || orders.courier_name || "");
      setSavedMsg("");
    }
  }, [orders]);

  const orderRowId = orders?.id;

  const handleSaveFulfillment = async () => {
    if (!orderRowId) return;
    setSaving(true);
    setSavedMsg("");
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authTokenStoreAdmin")
          : null;
      const res = await fetch(`/api/order-management/${orderRowId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          status,
          trackingNumber: tracking,
          courierName: courier,
        }),
      });
      if (res.ok) {
        setSavedMsg("Fulfillment updated");
      } else {
        const j = await res.json().catch(() => ({}));
        setSavedMsg(j?.message || j?.error || "Update failed");
      }
    } catch (e) {
      setSavedMsg(e.message);
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(""), 3500);
    }
  };

  const currentStageIdx = FULFILLMENT_STAGES.findIndex(
    (s) => s.toLowerCase() === (status || "").toLowerCase()
  );

  // Cancelling an order is destructive, so it goes through the app's
  // ConfirmDialog rather than the browser's native confirm().
  const [cancelOpen, setCancelOpen] = useState(false);

  const requestCancelOrder = () => {
    if (!orderRowId) return;
    setCancelOpen(true);
  };

  const handleCancelOrder = async () => {
    if (!orderRowId) return;
    setCancelOpen(false);
    setStatus("Cancelled");
    setSaving(true);
    setSavedMsg("");
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authTokenStoreAdmin")
          : null;
      const res = await fetch(`/api/order-management/${orderRowId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          status: "Cancelled",
          trackingNumber: tracking,
          courierName: courier,
        }),
      });
      if (res.ok) {
        setSavedMsg("Order cancelled");
      } else {
        const j = await res.json().catch(() => ({}));
        setSavedMsg(j?.message || j?.error || "Cancel failed");
      }
    } catch (e) {
      setSavedMsg(e.message);
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(""), 3500);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!orders) return;
    setInvoiceBusy(true);
    try {
      const mod = await import("@/lib/invoice/orderInvoice");
      await mod.downloadOrderInvoice(orders);
    } catch (err) {
      console.error("Invoice generation failed:", err);
    } finally {
      setInvoiceBusy(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[720px] top-2 sm:top-5 bottom-2 sm:bottom-5 end-2 sm:end-5 h-auto rounded-lg p-0 sm:max-w-none [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b py-3.5 px-5 border-border flex-row items-center justify-between">
          <SheetTitle>Order Info</SheetTitle>
          <Button
            variant="outline"
            size="sm"
            className="me-8 gap-1.5"
            onClick={handleDownloadInvoice}
            disabled={invoiceBusy || !orders}
          >
            <Download className="size-3.5" />
            {invoiceBusy ? "Preparing…" : "Download Invoice"}
          </Button>
        </SheetHeader>

        <SheetBody className="px-5 py-0">
          <ScrollArea className="h-[calc(100dvh-11.5rem)] pe-3 -me-3">
            {/* ORDER DETAILS */}
            <div className="grid xl:grid-cols-1 gap-5 lg:gap-9">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="justify-start bg-muted/70 gap-9 h-auto py-5">
                    {[
                      ["Order ID", orders?.id],
                      ["Status", orders?.order_status],
                      ["Order placed", formatDateShort(orders?.created_at)],
                      [
                        "Total",
                        Number.isFinite(Number(orders?.subtotal))
                          ? `$${Number(orders.subtotal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : "—",
                      ],
                      [
                        "Payment",
                        `${orders?.payment_method || "COD"} · ${orders?.payment_status || "Pending"}` +
                          (orders?.currency_code && orders.currency_code !== "USD" && orders?.charged_amount
                            ? ` (charged ${orders.currency_code} ${Number(orders.charged_amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
                            : ""),
                      ],
                      ["Ship to", orders?.customer_name || "—"],
                      ["Estimated Delivery", orders?.estimated_delivery || "—"],
                    ].map(([label, value], i) => (
                      <div key={i}>
                        <span className="text-xs text-secondary-foreground">
                          {label}
                        </span>
                        <div className="text-sm font-medium">{value}</div>
                      </div>
                    ))}
                  </CardHeader>

                  <CardContent className="p-5 lg:p-7.5 space-y-5">
                    <TwoColCard items={orders?.items} limit={4} />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ─── FULFILLMENT CONTROL ─────────────────────────────── */}
            <Card className="overflow-hidden mt-5 border-primary/20">
              <CardHeader className="justify-start bg-primary gap-2 h-auto py-3.5 px-5 flex-row items-center">
                <Truck className="size-4 text-white" />
                <span className="text-sm font-semibold text-white">
                  Fulfillment &amp; Shipping
                </span>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {/* Stage progress */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {FULFILLMENT_STAGES.map((s, i) => {
                    const done = currentStageIdx >= 0 && i <= currentStageIdx;
                    return (
                      <React.Fragment key={s}>
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <span
                            className={cn(
                              "size-5 rounded-full flex items-center justify-center text-xs font-semibold",
                              done
                                ? "bg-primary text-white"
                                : "bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground"
                            )}
                          >
                            {done ? <Check className="size-3" /> : i + 1}
                          </span>
                          <span
                            className={cn(
                              "text-xs text-center max-w-[64px] leading-tight",
                              done ? "text-primary font-medium" : "text-gray-600 dark:text-muted-foreground"
                            )}
                          >
                            {s}
                          </span>
                        </div>
                        {i < FULFILLMENT_STAGES.length - 1 && (
                          <div
                            className={cn(
                              "h-0.5 flex-1 min-w-2 rounded",
                              i < currentStageIdx ? "bg-primary" : "bg-gray-200 dark:bg-secondary"
                            )}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor={`order-status-${orderRowId ?? "new"}`}
                      className="text-sm text-secondary-foreground"
                    >
                      Status
                    </label>
                    <select
                      id={`order-status-${orderRowId ?? "new"}`}
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="border border-input rounded-md px-2.5 py-2 text-sm bg-white dark:bg-card"
                    >
                      {FULFILLMENT_STAGES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor={`order-courier-${orderRowId ?? "new"}`}
                      className="text-sm text-secondary-foreground"
                    >
                      Courier
                    </label>
                    <input
                      id={`order-courier-${orderRowId ?? "new"}`}
                      value={courier}
                      onChange={(e) => setCourier(e.target.value)}
                      placeholder="FedEx, DHL, Brinks…"
                      className="border border-input rounded-md px-2.5 py-2 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor={`order-tracking-${orderRowId ?? "new"}`}
                      className="text-sm text-secondary-foreground"
                    >
                      Tracking #
                    </label>
                    <input
                      id={`order-tracking-${orderRowId ?? "new"}`}
                      value={tracking}
                      onChange={(e) => setTracking(e.target.value)}
                      placeholder="Tracking number"
                      className="border border-input rounded-md px-2.5 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white"
                    onClick={handleSaveFulfillment}
                    disabled={saving || !orderRowId}
                  >
                    {saving ? "Saving…" : "Update Fulfillment"}
                  </Button>
                  {savedMsg && (
                    <span
                      className="text-sm text-success font-medium"
                      role="status"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      {savedMsg}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between mt-5">
              <div className="space-y-2.5">
                <div className="flex gap-2.5">
                  <p>{orders?.id}</p>
                  <Badge variant="success">{orders?.order_status}</Badge>
                </div>

                <div className="flex gap-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-secondary-foreground">
                      Placed
                    </span>
                    <span className="text-sm font-medium text-mono">
                      {formatDateShort(orders?.created_at)}
                    </span>
                  </div>

                  <Badge appearance="ghost" variant="destructive">
                    <BadgeDot className="size-1 bg-muted-foreground/60" />
                  </Badge>

                  <div className="flex items-center gap-1">
                    <span className="text-xs text-secondary-foreground">
                      Customer
                    </span>
                    <span className="text-sm font-medium text-mono">
                      {orders?.customer_name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5">
                <Button
                  variant="ghost"
                  onClick={requestCancelOrder}
                  disabled={saving || !orderRowId}
                >
                  Cancel Order
                </Button>
                <Button
                  variant="outline"
                  aria-disabled="true"
                  className="opacity-60 cursor-not-allowed"
                  title="Notify Customer is not yet available"
                >
                  Notify Customer
                </Button>
              </div>
            </div>

            {/* shipping data — real order fields only; no fake ETA/log, see
                OrderManagement/constant.js history for the mock data this replaced */}
            <Card className="my-5">
              <CardHeader className="justify-start bg-muted/70 gap-9 h-auto py-5">
                Shipping Data
              </CardHeader>
              <CardContent className="flex flex-wrap justify-between gap-5">
                {[
                  ["Courier", orders?.courierName || orders?.courier_name],
                  [
                    "Tracking #",
                    orders?.trackingNumber || orders?.tracking_number,
                    orders?.trackingUrl || orders?.tracking_url,
                  ],
                  [
                    "Shipped",
                    (orders?.shippedAt || orders?.shipped_at) &&
                      formatDateShort(orders?.shippedAt || orders?.shipped_at),
                  ],
                  [
                    "Delivered",
                    (orders?.deliveredAt || orders?.delivered_at) &&
                      formatDateShort(orders?.deliveredAt || orders?.delivered_at),
                  ],
                ].map(([label, value, url], i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <span className="text-xs font-normal text-secondary-foreground">
                      {label}
                    </span>
                    {value && url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary underline"
                      >
                        {value}
                      </a>
                    ) : (
                      <span className="text-sm font-medium text-mono">
                        {value || "—"}
                      </span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </ScrollArea>
        </SheetBody>
      </SheetContent>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancelOrder}
        title="Cancel order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmLabel="Cancel order"
      />
    </Sheet>
  );
};

export default ViewOrders;
